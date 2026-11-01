import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DesktopApp } from "@/components/erp/desktop-views";
import { MobileApp } from "@/components/erp/mobile-views";
import { parseView, type View } from "@/lib/erp-store";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: parseView(search.view),
  }),
  component: Home,
});

function Home() {
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  function onNavigate(next: View) {
    void navigate({ search: { view: next } });
  }

  return (
    <>
      <DesktopApp view={view} onNavigate={onNavigate} />
      <MobileApp view={view} onNavigate={onNavigate} />
    </>
  );
}
