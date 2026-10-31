import PageInProgress from "@/components/shared/page-in-progress";

// Used when a page in the shop calls notFound(), e.g. /women/athleisure
// has no page yet. The navbar and footer stay, because this sits inside the shop layout.
export default function NotFound() {
  return <PageInProgress />;
}