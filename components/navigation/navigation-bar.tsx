import {
  Bot,
  Code2,
  Group,
  Library,
  Newspaper,
  Settings2,
  Telescope,
  Triangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LogoutButton from "../logout-component";
import Link from "next/link";

export function NavigationBar() {
  return (
    <div className="grid h-screen pl-[30px] md:pl-[53px]">
      <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <p className="font-semibold text-xl">
            N
            </p>
          </Button>
        </div>
        <TooltipProvider>
          <nav className="grid gap-1 p-2">
            <Link href="/users">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    aria-label="Models"
                  >
                    <Bot className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Users
                </TooltipContent>
              </Tooltip>
            </Link>

            <Link href="/courses">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    aria-label="Courses"
                  >
                    <Library className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Courses
                </TooltipContent>
              </Tooltip>
            </Link>

            <Link href="/cohort">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    aria-label="Cohort"
                  >
                    <Group className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Cohort
                </TooltipContent>
              </Tooltip>
            </Link>

            <Link href="/blogs">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    aria-label="Blog"
                  >
                    <Newspaper className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Blogs
                </TooltipContent>
              </Tooltip>
            </Link>

            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="API"
                >
                  <Code2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                API
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Settings"
                >
                  <Settings2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip> */}
          </nav>
          <nav className="mt-auto grid gap-1 p-2">
            <LogoutButton />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Account"
                >
                  <Telescope className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Visit Website
              </TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
      </aside>
    </div>
  );
}
