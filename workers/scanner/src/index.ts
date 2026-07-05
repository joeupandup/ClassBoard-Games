import puppeteer from "@cloudflare/puppeteer";

interface ScannerEnv {
  BROWSER: Fetcher;
  DB: D1Database;
  GAME_ASSETS: R2Bucket;
  AI: Ai;
}

interface ScanMessage {
  jobId: string;
  gameId: string;
  url: string;
  requestedBy: string;
}

const blockedNames = new Set([
  "localhost",
  "metadata",
  "metadata.google.internal",
  "0.0.0.0",
  "::1",
]);

function safeUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) return false;
  const host = url.hostname.toLowerCase();
  if (
    blockedNames.has(host) ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return false;
  }
  return true;
}

function fallbackMetadata(title: string, text: string) {
  const lower = `${title} ${text}`.toLowerCase();
  const subject = /math|addition|subtract|number|fraction/.test(lower)
    ? "Maths"
    : /science|weather|animal|plant/.test(lower)
      ? "Science"
      : "English";
  const skills = [
    /tense|verb|grammar/.test(lower) ? "Grammar" : "Target vocabulary",
    /listen|audio|sound/.test(lower) ? "Listening" : "Quick recall",
  ];
  return {
    title: title || "Untitled classroom game",
    shortDescription:
      "An interactive classroom game analysed from its public page. Review this draft before publishing.",
    studentGoal: `Students practise ${skills[0].toLowerCase()} through a focused interactive challenge.`,
    howToPlay: [
      "Open the game on the classroom screen.",
      "Follow the prompt and choose or enter an answer.",
      "Review the answer before moving to the next round.",
    ],
    teacherNotes: ["Check instructions and audio before the lesson."],
    subject,
    categories: [subject],
    skills,
    tags: ["browser scan", "teacher review required"],
    activityTypes: ["Interactive Game"],
    gradeMin: 1,
    gradeMax: 5,
  };
}

async function aiMetadata(env: ScannerEnv, title: string, text: string) {
  const fallback = fallbackMetadata(title, text);
  try {
    const prompt = `You catalogue classroom learning games for teachers.
Return strict JSON only with these fields:
title, shortDescription, studentGoal, howToPlay (3 strings), teacherNotes
(1-3 strings), subject, categories, skills, tags, activityTypes, gradeMin,
gradeMax. Be specific and do not invent features that are not evident.

Page title: ${title}
Visible page text:
${text.slice(0, 12000)}`;
    const result = (await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct-fast",
      {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 900,
      },
    )) as { response?: string };
    const raw = result.response?.replace(/^```json\s*|\s*```$/g, "");
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as typeof fallback) };
  } catch {
    return fallback;
  }
}

async function updateJob(
  env: ScannerEnv,
  jobId: string,
  progress: number,
  step: string,
) {
  await env.DB.prepare(
    `UPDATE scan_jobs
     SET status = 'running', progress = ?, current_step = ?,
         started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
     WHERE id = ?`,
  )
    .bind(progress, step, jobId)
    .run();
}

async function scan(env: ScannerEnv, message: ScanMessage) {
  if (!safeUrl(message.url)) throw new Error("Unsafe or non-public URL.");
  await updateJob(env, message.jobId, 10, "Opening public game");

  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(message.url, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    });
    await updateJob(env, message.jobId, 35, "Capturing screenshots");

    const title = await page.title();
    const bodyText = await page.evaluate(
      () => document.body?.innerText?.slice(0, 20000) ?? "",
    );
    const screenshot = (await page.screenshot({
      type: "jpeg",
      quality: 84,
      fullPage: false,
    })) as Uint8Array;
    const screenshotKey = `screenshots/${message.gameId}/${crypto.randomUUID()}.jpg`;
    await env.GAME_ASSETS.put(screenshotKey, screenshot, {
      httpMetadata: {
        contentType: "image/jpeg",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    await updateJob(env, message.jobId, 66, "Generating teaching metadata");
    const metadata = await aiMetadata(env, title, bodyText);

    await env.DB.batch([
      env.DB.prepare(
        `UPDATE games SET
          title = ?, description_short = ?, student_goal = ?,
          how_to_play = ?, teacher_notes = ?, subject = ?,
          grade_min = ?, grade_max = ?, categories = ?, skills = ?,
          tags = ?, activity_types = ?, status = 'ready_for_review',
          last_scanned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      ).bind(
        metadata.title,
        metadata.shortDescription,
        metadata.studentGoal,
        JSON.stringify(metadata.howToPlay),
        JSON.stringify(metadata.teacherNotes),
        metadata.subject,
        metadata.gradeMin,
        metadata.gradeMax,
        JSON.stringify(metadata.categories),
        JSON.stringify(metadata.skills),
        JSON.stringify(metadata.tags),
        JSON.stringify(metadata.activityTypes),
        message.gameId,
      ),
      env.DB.prepare(
        `INSERT INTO game_assets (id, game_id, type, object_key, width, height)
         VALUES (?, ?, 'screenshot', ?, 1440, 900)`,
      ).bind(crypto.randomUUID(), message.gameId, screenshotKey),
      env.DB.prepare(
        `UPDATE scan_jobs SET status = 'completed', progress = 100,
         current_step = 'Ready for review', finished_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      ).bind(message.jobId),
    ]);
  } finally {
    await browser.close();
  }
}

export default {
  async queue(batch: MessageBatch<ScanMessage>, env: ScannerEnv) {
    for (const message of batch.messages) {
      try {
        await scan(env, message.body);
        message.ack();
      } catch (error) {
        const reason =
          error instanceof Error ? error.message.slice(0, 500) : "Scan failed";
        await env.DB.batch([
          env.DB.prepare(
            `UPDATE scan_jobs SET status = 'failed', error = ?,
             current_step = 'Scan failed', finished_at = CURRENT_TIMESTAMP,
             attempts = attempts + 1 WHERE id = ?`,
          ).bind(reason, message.body.jobId),
          env.DB.prepare(
            `UPDATE games SET status = 'failed', updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
          ).bind(message.body.gameId),
        ]);
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<ScannerEnv>;
