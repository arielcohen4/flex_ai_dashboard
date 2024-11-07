import Link from "next/link";
import {
  IconBrandDiscord,
  IconBrandX,
  IconBrandLinkedin,
  IconBrandGithub,
} from "@tabler/icons-react";

export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="https://discord.gg/TTBxDCkT"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandDiscord className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <Link
            href="https://x.com/getflex_ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandX className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <Link
            href="https://www.linkedin.com/company/getflex-ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandLinkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <Link
            href="https://github.com/getflexai/flex_ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandGithub className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
