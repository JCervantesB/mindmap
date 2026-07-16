"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === "light" ? "dark" : "light")} />}>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Cambiar tema</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Cambiar a {theme === "light" ? "oscuro" : "claro"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
