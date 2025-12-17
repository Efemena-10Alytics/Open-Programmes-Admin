"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const LogoutButton = () => {
  const handleSignout = async () => {
    await signOut().then(() => {
      window.location.href = "/auth/signin";
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="mt-auto rounded-lg"
            aria-label="Logout"
            onClick={handleSignout}
          >
            <LogOut className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          Exit
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LogoutButton;