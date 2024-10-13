import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
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
                    <stop offset="0%" stop-color="#F1F5F9" stop-opacity="0" />
                    <stop offset="100%" stop-color="#F1F5F9" />
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
                <g fill="none" fill-rule="nonzero">
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
              <h1 className="font-bold text-lg">Flex AI</h1>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
