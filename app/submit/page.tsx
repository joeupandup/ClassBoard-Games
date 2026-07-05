import type { Metadata } from "next";
import { SubmitGameFlow } from "@/components/submit-game-flow";

export const metadata: Metadata = {
  title: "Submit a game",
  description: "Turn a public classroom game link into a polished listing.",
};

export default function SubmitPage() {
  return <SubmitGameFlow />;
}
