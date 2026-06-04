import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyTheme, getStoredTheme, setStoredTheme, type ThemeMode } from "@/lib/theme";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { t } = useTranslation("common");
  const mode = getStoredTheme();

  const setMode = (next: ThemeMode) => {
    setStoredTheme(next);
    applyTheme(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t("theme.toggle")}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode("light")} className={mode === "light" ? "font-semibold" : ""}>
          <Sun className="w-4 h-4 mr-2" /> {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")} className={mode === "dark" ? "font-semibold" : ""}>
          <Moon className="w-4 h-4 mr-2" /> {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("system")} className={mode === "system" ? "font-semibold" : ""}>
          <Monitor className="w-4 h-4 mr-2" /> {t("theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
