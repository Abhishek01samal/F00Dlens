import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Activity, Droplets, Info, TrendingUp, Flame, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface DietPlanData {
  type?: "diet_plan" | "question";
  message?: string;
  progress?: string;
  calculations?: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  meals?: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  gymAddons?: {
    preWorkout: string;
    postWorkout: string;
  };
  advice?: {
    portionControl: string;
    hydration: string;
    alternatives: string[];
    cheatMeal: string;
  };
  // Raw response fallback
  response?: string;
  rawContent?: string;
}

// Macro chart component
const MacroChart = memo(({ protein, carbs, fats }: { protein: number; carbs: number; fats: number }) => {
  const total = protein + carbs + fats;
  const proteinPercent = (protein / total) * 100;
  const carbsPercent = (carbs / total) * 100;
  const fatsPercent = (fats / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-20 text-sm text-muted-foreground">Protein</div>
        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${proteinPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-green-500 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-xs font-bold text-white">{protein}g</span>
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 text-sm text-muted-foreground">Carbs</div>
        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${carbsPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="h-full bg-yellow-500 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-xs font-bold text-white">{carbs}g</span>
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 text-sm text-muted-foreground">Fats</div>
        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fatsPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-orange-500 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-xs font-bold text-white">{fats}g</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

MacroChart.displayName = "MacroChart";

// Calorie gauge component
const CalorieGauge = memo(({ value, max = 3000 }: { value: number; max?: number }) => {
  const percent = Math.min((value / max) * 100, 100);
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${percent * 2.51} 251`}
          initial={{ strokeDasharray: "0 251" }}
          animate={{ strokeDasharray: `${percent * 2.51} 251` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame className="w-5 h-5 text-primary mb-1" />
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">kcal</span>
      </div>
    </div>
  );
});

CalorieGauge.displayName = "CalorieGauge";

export const DietPlanDisplay = memo(({ data }: { data: DietPlanData }) => {
  // Handle question type
  if (data.type === "question") {
    return (
      <Card className="p-8 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
        <div className="flex items-start gap-4">
          <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-lg text-foreground mb-2">{data.message}</p>
            {data.progress && (
              <Badge variant="outline" className="mt-2">{data.progress}</Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Get content from any possible source
  const content = data.response || data.rawContent || data.message || (data as any).content || "";
  
  // Check if we have structured data
  const hasStructuredData = data.calculations && data.meals;
  
  // If we have raw text content (not structured), render it nicely
  if (!hasStructuredData && content) {
    return (
      <div className="space-y-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              Your Personalized Diet Plan
            </h2>
            <div className="prose prose-invert max-w-none space-y-2">
              {content.split('\n').map((line: string, idx: number) => {
                if (!line.trim()) return <br key={idx} />;
                if (line.startsWith('##')) {
                  return <h3 key={idx} className="text-lg font-bold text-primary mt-4 mb-2">{line.replace(/##/g, '').trim()}</h3>;
                }
                if (line.startsWith('#')) {
                  return <h2 key={idx} className="text-xl font-bold text-foreground mt-4 mb-2">{line.replace(/#/g, '').trim()}</h2>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h4 key={idx} className="text-md font-semibold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, '').trim()}</h4>;
                }
                if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                  return <li key={idx} className="ml-4 text-muted-foreground list-disc">{line.replace(/^[-•*]\s*/, '')}</li>;
                }
                if (line.includes(':') && line.length < 100 && !line.includes('http')) {
                  const colonIdx = line.indexOf(':');
                  const label = line.substring(0, colonIdx);
                  const value = line.substring(colonIdx + 1);
                  return (
                    <div key={idx} className="flex gap-2 py-1">
                      <span className="font-medium text-foreground">{label}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  );
                }
                return <p key={idx} className="text-muted-foreground">{line}</p>;
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // If no content at all, show a fallback with any available data
  if (!hasStructuredData && !content) {
    // Try to render whatever data we have
    const jsonData = JSON.stringify(data, null, 2);
    return (
      <div className="space-y-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              Your Personalized Diet Plan
            </h2>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-auto">{jsonData}</pre>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      {/* Calculations Header with Charts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Your Personalized Diet Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calorie Gauge */}
            <div className="text-center">
              <CalorieGauge value={data.calculations!.targetCalories} />
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">BMR</div>
                  <div className="font-bold">{data.calculations!.bmr}</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">TDEE</div>
                  <div className="font-bold">{data.calculations!.tdee}</div>
                </div>
              </div>
            </div>

            {/* Macro Distribution */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Macro Distribution</h3>
              <MacroChart 
                protein={data.calculations!.protein} 
                carbs={data.calculations!.carbs} 
                fats={data.calculations!.fats} 
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Meal Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.meals!).map(([meal, items], idx) => (
          <motion.div
            key={meal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-4 hover:border-primary/50 transition-all h-full">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-bold capitalize">{meal}</h3>
              </div>
              <ul className="space-y-1.5">
                {items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gym Add-ons */}
      {data.gymAddons && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-green-400" />
              <h3 className="font-bold text-green-400">Pre-Workout</h3>
            </div>
            <p className="text-sm text-muted-foreground">{data.gymAddons.preWorkout}</p>
          </Card>
          <Card className="p-4 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <h3 className="font-bold text-blue-400">Post-Workout</h3>
            </div>
            <p className="text-sm text-muted-foreground">{data.gymAddons.postWorkout}</p>
          </Card>
        </motion.div>
      )}

      {/* Advice Section */}
      {data.advice && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h3 className="text-lg font-bold">Expert Advice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2 text-primary">Portion Control</h4>
              <p className="text-sm text-muted-foreground">{data.advice.portionControl}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <h4 className="font-semibold text-blue-400">Hydration</h4>
              </div>
              <p className="text-sm text-muted-foreground">{data.advice.hydration}</p>
            </Card>
          </div>

          {data.advice.alternatives?.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Healthy Alternatives</h4>
              <div className="flex flex-wrap gap-2">
                {data.advice.alternatives.map((alt, idx) => (
                  <Badge key={idx} variant="secondary">{alt}</Badge>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4 bg-primary/5 border-primary/30">
            <h4 className="font-semibold mb-2">Cheat Meal Guidelines</h4>
            <p className="text-sm text-muted-foreground">{data.advice.cheatMeal}</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
});

DietPlanDisplay.displayName = "DietPlanDisplay";
