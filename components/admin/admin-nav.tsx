"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Store } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-[4px] px-[12px] pb-[12px] lg:flex-col lg:pb-0">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-[40px] items-center gap-[10px] rounded-[4px] px-[12px] text-[14px] text-black transition-colors ${
              active ? "bg-[#F2F2F2] font-semibold" : "hover:bg-[#F2F2F2]"
            }`}
          >
            <Icon strokeWidth={1.75} className="size-[18px]" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex h-[40px] items-center gap-[10px] rounded-[4px] px-[12px] text-[14px] text-black transition-colors hover:bg-[#F2F2F2]"
      >
        <Store strokeWidth={1.75} className="size-[18px]" />
        Back to store
      </Link>
    </nav>
  );
}