import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 38 38"
            >
              <defs>
                <linearGradient
                  id="b"
                  x1="87.629%"
                  x2="9.97%"
                  y1="28.473%"
                  y2="86.882%"
                >
                  <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0" />
                  <stop offset="100%" stopColor="#F1F5F9" />
                </linearGradient>
                <filter
                  id="a"
                  width="141.4%"
                  height="141.4%"
                  x="-20.7%"
                  y="-20.7%"
                  filterUnits="objectBoundingBox"
                >
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                </filter>
              </defs>
              <g fill="none" fillRule="nonzero">
                <path
                  fill="#A855F7"
                  d="M19 33.5c-8.008 0-14.5-6.492-14.5-14.5S10.992 4.5 19 4.5 33.5 10.992 33.5 19 27.008 33.5 19 33.5Zm0-5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z"
                  filter="url(#a)"
                />
                <path
                  fill="url(#b)"
                  d="M19 33.5c-8.008 0-14.5-6.492-14.5-14.5S10.992 4.5 19 4.5 33.5 10.992 33.5 19 27.008 33.5 19 33.5Zm0-5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z"
                />
              </g>
            </svg>
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              Flex AI
            </h1>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}
