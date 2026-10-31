import type { Metadata } from "next";
import PageInProgress from "@/components/shared/page-in-progress";

export const metadata: Metadata = {
  title: "Page in progress | Lunexa",
};

// Catches every address that has no page yet (e.g. /accessories, /looks/1).
// Pages that DO exist always win over this one.
export default function PageInProgressRoute() {
  return <PageInProgress />;
}