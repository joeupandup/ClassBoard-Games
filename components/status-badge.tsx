import type { GameStatus, Visibility } from "@/lib/types";

const labels: Record<GameStatus | Visibility, string> = {
  draft: "Draft",
  processing: "Processing",
  ready_for_review: "Ready for review",
  published: "Published",
  failed: "Failed",
  archived: "Archived",
  private: "Private",
  school: "School",
  public: "Public",
};

export function StatusBadge({ value }: { value: GameStatus | Visibility }) {
  return <span className={`status status--${value}`}>{labels[value]}</span>;
}
