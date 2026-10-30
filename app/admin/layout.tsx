import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin | Lunexa",
  robots: { index: false, follow: false }, // keep search engines out
};

// Checks the login cookie and the database, so it sits inside <Suspense> (below)
async function AdminShell({ children }: { children: ReactNode }) {
  const admin = await requireAdmin(); // not an admin = 404, nothing below is shown

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] lg:flex-row">
      <aside className="border-b border-[#E5E5E5] bg-white lg:w-[240px] lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="px-[20px] py-[20px]">
          <p className="text-[18px] font-bold uppercase leading-[24px] text-black">Lunexa admin</p>
          <p className="mt-[2px] truncate text-[12px] leading-[16px] text-[#6B6B6B]">{admin.email}</p>
        </div>
        <AdminNav />
      </aside>

      <main className="min-w-0 flex-1 px-[16px] py-[24px] lg:px-[32px]">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F7]" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}