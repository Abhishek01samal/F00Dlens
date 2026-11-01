import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  User, 
  Palette, 
  History, 
  LogOut, 
  Settings,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import type { HistoryItem } from "@/hooks/useHistoryStore";

// Theme definitions
type Theme = 
  | "matrix" 
  | "midnight" 
  | "sunrise" 
  | "neon-purple" 
  | "ocean" 
  | "ember" 
  | "arctic"
  | "cyberpunk"
  | "forest"
  | "cherry"
  | "golden"
  | "lavender"
  | "sunset"
  | "mint";

interface ThemeConfig {
  id: Theme;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview: string;
}

const themes: ThemeConfig[] = [
  { id: "matrix", name: "Matrix", colors: { primary: "#00ff00", secondary: "#003300", accent: "#00ff00" }, preview: "linear-gradient(135deg, #000 0%, #003300 50%, #001100 100%)" },
  { id: "midnight", name: "Midnight", colors: { primary: "#3b82f6", secondary: "#1e293b", accent: "#60a5fa" }, preview: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c1929 100%)" },
  { id: "sunrise", name: "Sunrise", colors: { primary: "#f97316", secondary: "#fef3c7", accent: "#f43f5e" }, preview: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fce7f3 100%)" },
  { id: "neon-purple", name: "Neon Purple", colors: { primary: "#a855f7", secondary: "#1a0a2e", accent: "#ec4899" }, preview: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)" },
  { id: "ocean", name: "Ocean", colors: { primary: "#14b8a6", secondary: "#0c1929", accent: "#22c55e" }, preview: "linear-gradient(135deg, #0c1929 0%, #134e4a 50%, #0c2d2d 100%)" },
  { id: "ember", name: "Ember", colors: { primary: "#f97316", secondary: "#1a0a0a", accent: "#eab308" }, preview: "linear-gradient(135deg, #1a0a0a 0%, #451a03 50%, #1a0a0a 100%)" },
  { id: "arctic", name: "Arctic", colors: { primary: "#0ea5e9", secondary: "#f0f9ff", accent: "#06b6d4" }, preview: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ecfeff 100%)" },
  { id: "cyberpunk", name: "Cyberpunk", colors: { primary: "#f0f", secondary: "#0a0a1a", accent: "#0ff" }, preview: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)" },
  { id: "forest", name: "Forest", colors: { primary: "#22c55e", secondary: "#0a1a0a", accent: "#86efac" }, preview: "linear-gradient(135deg, #0a1a0a 0%, #14532d 50%, #0a1a0a 100%)" },
  { id: "cherry", name: "Cherry", colors: { primary: "#f43f5e", secondary: "#1a0a0f", accent: "#fb7185" }, preview: "linear-gradient(135deg, #1a0a0f 0%, #4c0519 50%, #1a0a0f 100%)" },
  { id: "golden", name: "Golden", colors: { primary: "#eab308", secondary: "#1a1a0a", accent: "#fde047" }, preview: "linear-gradient(135deg, #1a1a0a 0%, #422006 50%, #1a1a0a 100%)" },
  { id: "lavender", name: "Lavender", colors: { primary: "#a78bfa", secondary: "#faf5ff", accent: "#c4b5fd" }, preview: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #fdf4ff 100%)" },
  { id: "sunset", name: "Sunset", colors: { primary: "#fb923c", secondary: "#1a0f0a", accent: "#f472b6" }, preview: "linear-gradient(135deg, #1a0f0a 0%, #7c2d12 30%, #831843 70%, #1a0f0a 100%)" },
  { id: "mint", name: "Mint", colors: { primary: "#34d399", secondary: "#f0fdf4", accent: "#a7f3d0" }, preview: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)" },
];

// Extended theme CSS variables
const themeVariables: Record<Theme, Record<string, string>> = {
  matrix: {},
  midnight: {},
  sunrise: {},
  "neon-purple": {},
  ocean: {},
  ember: {},
  arctic: {},
  cyberpunk: {
    "--background": "270 50% 5%",
    "--foreground": "300 100% 90%",
    "--card": "270 50% 8%",
    "--card-foreground": "300 100% 90%",
    "--popover": "270 50% 6%",
    "--popover-foreground": "300 100% 90%",
    "--primary": "300 100% 50%",
    "--primary-foreground": "270 50% 5%",
    "--secondary": "270 40% 15%",
    "--secondary-foreground": "300 100% 90%",
    "--muted": "270 30% 12%",
    "--muted-foreground": "300 30% 60%",
    "--accent": "180 100% 50%",
    "--accent-foreground": "270 50% 5%",
    "--border": "270 40% 20%",
    "--input": "270 50% 10%",
    "--ring": "300 100% 50%",
  },
  forest: {
    "--background": "120 30% 5%",
    "--foreground": "120 80% 90%",
    "--card": "120 30% 8%",
    "--card-foreground": "120 80% 90%",
    "--popover": "120 30% 6%",
    "--popover-foreground": "120 80% 90%",
    "--primary": "142 76% 36%",
    "--primary-foreground": "120 30% 5%",
    "--secondary": "120 30% 15%",
    "--secondary-foreground": "120 80% 90%",
    "--muted": "120 20% 12%",
    "--muted-foreground": "120 30% 55%",
    "--accent": "142 69% 58%",
    "--accent-foreground": "120 30% 5%",
    "--border": "120 25% 18%",
    "--input": "120 30% 10%",
    "--ring": "142 76% 36%",
  },
  cherry: {
    "--background": "350 30% 6%",
    "--foreground": "350 100% 95%",
    "--card": "350 30% 10%",
    "--card-foreground": "350 100% 95%",
    "--popover": "350 30% 8%",
    "--popover-foreground": "350 100% 95%",
    "--primary": "350 89% 60%",
    "--primary-foreground": "350 30% 6%",
    "--secondary": "350 30% 18%",
    "--secondary-foreground": "350 100% 95%",
    "--muted": "350 20% 15%",
    "--muted-foreground": "350 30% 55%",
    "--accent": "350 89% 65%",
    "--accent-foreground": "350 30% 6%",
    "--border": "350 25% 20%",
    "--input": "350 30% 12%",
    "--ring": "350 89% 60%",
  },
  golden: {
    "--background": "45 30% 5%",
    "--foreground": "45 100% 95%",
    "--card": "45 30% 8%",
    "--card-foreground": "45 100% 95%",
    "--popover": "45 30% 6%",
    "--popover-foreground": "45 100% 95%",
    "--primary": "45 93% 47%",
    "--primary-foreground": "45 30% 5%",
    "--secondary": "45 30% 15%",
    "--secondary-foreground": "45 100% 95%",
    "--muted": "45 20% 12%",
    "--muted-foreground": "45 30% 55%",
    "--accent": "50 89% 55%",
    "--accent-foreground": "45 30% 5%",
    "--border": "45 25% 18%",
    "--input": "45 30% 10%",
    "--ring": "45 93% 47%",
  },
  lavender: {
    "--background": "270 40% 97%",
    "--foreground": "270 20% 15%",
    "--card": "270 40% 100%",
    "--card-foreground": "270 20% 15%",
    "--popover": "270 40% 100%",
    "--popover-foreground": "270 20% 15%",
    "--primary": "263 70% 69%",
    "--primary-foreground": "270 40% 98%",
    "--secondary": "270 20% 92%",
    "--secondary-foreground": "270 15% 20%",
    "--muted": "270 15% 94%",
    "--muted-foreground": "270 15% 45%",
    "--accent": "263 65% 75%",
    "--accent-foreground": "270 40% 98%",
    "--border": "270 15% 88%",
    "--input": "270 20% 96%",
    "--ring": "263 70% 69%",
  },
  sunset: {
    "--background": "15 30% 6%",
    "--foreground": "30 100% 95%",
    "--card": "15 30% 10%",
    "--card-foreground": "30 100% 95%",
    "--popover": "15 30% 8%",
    "--popover-foreground": "30 100% 95%",
    "--primary": "30 95% 60%",
    "--primary-foreground": "15 30% 6%",
    "--secondary": "15 30% 18%",
    "--secondary-foreground": "30 100% 95%",
    "--muted": "15 20% 15%",
    "--muted-foreground": "30 30% 55%",
    "--accent": "330 80% 60%",
    "--accent-foreground": "15 30% 6%",
    "--border": "15 25% 20%",
    "--input": "15 30% 12%",
    "--ring": "30 95% 60%",
  },
  mint: {
    "--background": "150 40% 97%",
    "--foreground": "150 20% 15%",
    "--card": "150 40% 100%",
    "--card-foreground": "150 20% 15%",
    "--popover": "150 40% 100%",
    "--popover-foreground": "150 20% 15%",
    "--primary": "160 84% 39%",
    "--primary-foreground": "150 40% 98%",
    "--secondary": "150 20% 92%",
    "--secondary-foreground": "150 15% 20%",
    "--muted": "150 15% 94%",
    "--muted-foreground": "150 15% 45%",
    "--accent": "160 77% 60%",
    "--accent-foreground": "150 40% 98%",
    "--border": "150 15% 88%",
    "--input": "150 20% 96%",
    "--ring": "160 84% 39%",
  },
};

interface UserDropdownProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onLogout: () => void;
  className?: string;
}

export const UserDropdown = memo(({ 
  user = {
    name: "User",
    email: "user@example.com",
    initials: "U",
  },
  history,
  onSelectHistoryItem,
  onClearHistory,
  onLogout,
  className
}: UserDropdownProps) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("foodlens-theme-id") as Theme | null;
    return stored ?? "matrix";
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);

    const vars = themeVariables[currentTheme];
    if (vars && Object.keys(vars).length > 0) {
      Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }

    // Persist across refresh + keep login theme consistent
    localStorage.setItem("foodlens-theme-id", currentTheme);
    localStorage.setItem("foodlens-theme-vars", JSON.stringify(vars ?? {}));
  }, [currentTheme]);

  const selectTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'comparison': return 'Comparison';
      case 'product': case 'info': return 'Product Info';
      case 'food': return 'Food History';
      case 'diet': return 'Diet Plan';
      default: return mode;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "w-10 h-10 rounded-full ring-2 ring-border hover:ring-primary transition-all duration-200",
          className
        )}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        {/* User Info */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-medium">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme Selector */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-64 p-2">
                <div className="p-2 border-b border-border mb-2">
                  <h4 className="text-xs font-semibold text-foreground">Choose Theme</h4>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => { e.preventDefault(); scroll('left'); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-5 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:bg-background"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  
                  <div 
                    ref={scrollRef}
                    className="flex gap-2 px-6 py-2 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => selectTheme(theme.id)}
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200",
                          "hover:scale-105 relative",
                          currentTheme === theme.id 
                            ? "border-primary ring-2 ring-primary/30" 
                            : "border-transparent hover:border-muted-foreground/30"
                        )}
                        style={{ background: theme.preview }}
                      >
                        {currentTheme === theme.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); scroll('right'); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-5 h-5 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:bg-background"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-2 pt-2">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ background: themes.find(t => t.id === currentTheme)?.colors.primary }}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {themes.find(t => t.id === currentTheme)?.name}
                    </span>
                  </div>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* History */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <History className="mr-2 h-4 w-4" />
              <span>History</span>
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  {history.length}
                </Badge>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-72 max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                    No history yet
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-2 py-2 border-b border-border">
                      <span className="text-xs font-medium text-muted-foreground">Recent Activity</span>
                      <button
                        onClick={(e) => { e.preventDefault(); onClearHistory(); }}
                        className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear
                      </button>
                    </div>
                    {history.slice(0, 10).map((item) => (
                      <DropdownMenuItem 
                        key={item.id}
                        onClick={() => onSelectHistoryItem(item)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="text-sm font-medium truncate w-full">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {getModeLabel(item.mode)} • {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserDropdown.displayName = "UserDropdown";

export default UserDropdown;
