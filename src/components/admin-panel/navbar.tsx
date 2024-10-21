"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { Search } from "../content/dashboard/search";
import useUser from "@/app/hook/useUser";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const { data: user, isLoading } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = supabaseBrowser();
    const subscription = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log("Change received!", payload);
          // Refetch the user data
          queryClient.invalidateQueries({
            queryKey: ["user"],
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <span className="text-primary">
            Balance:{" "}
            {isLoading ? (
              <Skeleton className="h-4 w-16 inline-block" />
            ) : (
              `$${user?.balance ?? 0}`
            )}
          </span>
          <a
            href="https://docs.getflex.ai/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Docs
          </a>
          <div className="md:block hidden">
            <Search />
          </div>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
