export type GameStatus =
  | "draft"
  | "processing"
  | "ready_for_review"
  | "published"
  | "failed"
  | "archived";

export type Visibility = "private" | "school" | "public";
export type PlayMode = "new_tab" | "iframe" | "hosted";

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description: string;
  verified: boolean;
}

export interface Game {
  id: string;
  ownerId: string;
  publisherId: string;
  title: string;
  slug: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourcePlatform: string;
  status: GameStatus;
  visibility: Visibility;
  descriptionShort: string;
  studentGoal: string;
  howToPlay: string[];
  teacherNotes: string[];
  subject: string;
  gradeMin: number;
  gradeMax: number;
  categories: string[];
  skills: string[];
  tags: string[];
  activityTypes: string[];
  screenshots: string[];
  playMode: PlayMode;
  embedAllowed: boolean;
  accent: string;
  motif: string;
  plays: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastScannedAt?: string;
}

export interface ScanJob {
  id: string;
  gameId: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  currentStep: string;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Collection {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  gameIds: string[];
  visibility: Visibility;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "school_admin" | "platform_admin";
}
