"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, PlusSquare, MessageSquare, User } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Home", icon: Home, path: "/home" },
  { label: "Create", icon: PlusSquare, path: "/create" },
  { label: "Profile", icon: User, path: "/profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden">
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ icon: Icon, path, label }) => {
          const active = pathname === path;

          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={clsx(
                "flex flex-col items-center justify-center text-xs transition-colors",
                active ? "text-indigo-600" : "text-gray-500",
              )}
            >
              <Icon
                className={clsx("h-6 w-6 mb-0.5", active && "stroke-[2.5]")}
              />
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
