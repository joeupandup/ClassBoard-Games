import { ReviewGame } from "@/components/review-game";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewGame id={id} />;
}
