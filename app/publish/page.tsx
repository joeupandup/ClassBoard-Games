import type { Metadata } from "next";
import { HtmlGamePublisher } from "@/components/html-game-publisher";

export const metadata: Metadata = {
  title: "Publish an HTML game",
  description: "Upload a self-contained Wellesley classroom game.",
};

export default function PublishPage() {
  return <HtmlGamePublisher />;
}
