import type { Metadata } from "next";
import { ExploreLibrary } from "@/components/explore-library";

export const metadata: Metadata = {
  title: "Explore games",
  description: "Search classroom games by subject, grade, skill and format.",
};

export default function ExplorePage() {
  return <ExploreLibrary />;
}
