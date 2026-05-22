import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { key: "system", icon: Monitor, label: "System theme" },
  { key: "light",  icon: Sun,     label: "Light theme"  },
  { key: "dark",   icon: Moon,    label: "Dark theme"   },
];

export type ThemeSwitcherProps = {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  defaultValue?: "light" | "dark" | "system";
  className?: string;
};

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = "system",
  className,
}: ThemeSwitcherProps) => {
  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark" | "system") => { setTheme(themeKey); },
    [setTheme],
  );

  return (
    <div className={cn("relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border", className)}>
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;
        return (
          <button
            aria-label={label}
            className={cn(
              "relative h-6 w-6 rounded-full transition-colors duration-200",
              isActive ? "bg-secondary" : "",
            )}
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark" | "system")}
            type="button"
          >
            <Icon className={cn(
              "m-auto h-4 w-4 transition-colors duration-200",
              isActive ? "text-foreground" : "text-muted-foreground",
            )} />
          </button>
        );
      })}
    </div>
  );
};
