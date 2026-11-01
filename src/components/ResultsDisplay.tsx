import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Leaf, AlertTriangle, TrendingUp, ShoppingBag, Clock, DollarSign, Lightbulb, Factory, Package, ExternalLink, Building2, User, History, Calendar, Timer } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  CartesianGrid,
} from "recharts";

interface ResultsDisplayProps {
  result: any;
}

const chartTooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
} as const;

const getScoreHex = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#eab308";
  return "#ef4444";
};

const HealthGauge = memo(({ score }: { score: number }) => {
  const color = getScoreHex(score);
  const gaugeData = [{ value: score, fill: color }];
  return (
    <div className="relative w-36 h-36 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={gaugeData}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: "hsl(var(--muted))" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
});
HealthGauge.displayName = "HealthGauge";

const MacroDonut = memo(({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) => {
  const data = useMemo(
    () => [
      { name: "Protein", value: protein, fill: "#22c55e" },
      { name: "Carbs", value: carbs, fill: "#3b82f6" },
      { name: "Fat", value: fat, fill: "#f97316" },
    ],
    [protein, carbs, fat]
  );
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
          >
            {data.map((entry, i) => (
              <Cell key={i} name={entry.name} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-1">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
            {d.name} {d.value}g
          </span>
        ))}
      </div>
    </div>
  );
});
MacroDonut.displayName = "MacroDonut";

const NUTRIENT_DAILY_MAX: Record<string, number> = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 70,
  fiber: 30,
  sugar: 50,
  sodium: 2300,
  cholesterol: 300,
};

const NUTRIENT_COLORS: Record<string, string> = {
  calories: "#3b82f6",
  protein: "#22c55e",
  carbs: "#8b5cf6",
  fat: "#f97316",
  fiber: "#14b8a6",
  sugar: "#ef4444",
  sodium: "#f59e0b",
  cholesterol: "#ec4899",
};

const NutritionDailyChart = memo(({ nutrition }: { nutrition: Record<string, number> }) => {
  const data = useMemo(
    () =>
      Object.entries(nutrition)
        .map(([key, value]) => {
          const max = NUTRIENT_DAILY_MAX[key] || 100;
          const pct = Math.min((Number(value) / max) * 100, 100);
          return {
            name: key.charAt(0).toUpperCase() + key.slice(1),
            key,
            pct: Math.round(pct * 10) / 10,
            raw: value,
          };
        })
        .sort((a, b) => b.pct - a.pct),
    [nutrition]
  );

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value: any, _name: any, item: any) => [
              `${item?.payload?.raw} (${value}% of daily max)`,
              item?.payload?.name,
            ]}
          />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={NUTRIENT_COLORS[entry.key] || "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
NutritionDailyChart.displayName = "NutritionDailyChart";

const ScoreBreakdownChart = memo(({ factors }: { factors: any[] }) => {
  const data = useMemo(
    () =>
      factors.map((f) => ({
        name: f.factor,
        impact: Number(f.impact) || 0,
      })),
    [factors]
  );

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
          />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(value: any) => [`${value} pts`, "Impact"]} />
          <Bar dataKey="impact" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.impact >= 0 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
ScoreBreakdownChart.displayName = "ScoreBreakdownChart";

export const ResultsDisplay = memo(({ result }: ResultsDisplayProps) => {
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(0);

  useEffect(() => {
    if (!result.productDetails?.expiryDate) return;

    const calculateDays = () => {
      const expiry = new Date(result.productDetails.expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilExpiry(diffDays);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 86400000);
    return () => clearInterval(interval);
  }, [result.productDetails?.expiryDate]);

  const getScoreLabel = useCallback((score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Poor";
  }, []);

  const getExpiryColor = useCallback((days: number) => {
    if (days < 0) return "text-destructive";
    if (days <= 7) return "text-warning";
    if (days <= 30) return "text-accent";
    return "text-success";
  }, []);

  const scoreLabel = getScoreLabel(result.healthScore ?? 0);

  const nutritionEntries = useMemo(() => {
    if (!result.nutrition) return [];
    return Object.entries(result.nutrition) as Array<[string, number]>;
  }, [result.nutrition]);

  return (
    <section id="results" className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-2">Analysis Results</h2>
          <p className="text-muted-foreground text-sm">Full report — every detail, charted</p>
        </motion.div>

        {/* Hero: product identity + health gauge + freshness */}
        <Card className="bg-background border-2 border-primary/20 p-6 md:p-8" id="overview">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <div className="flex-1 min-w-0">
              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                {result.productName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge>{scoreLabel}</Badge>
                {result.processingLevel && (
                  <Badge variant={String(result.processingLevel).toLowerCase().includes("ultra") ? "destructive" : "secondary"}>
                    {result.processingLevel}
                  </Badge>
                )}
                {result.environmentalImpact?.score != null && (
                  <Badge variant="outline">Eco {result.environmentalImpact.score}/100</Badge>
                )}
              </div>
              {result.healthTip && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Lightbulb className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/90">{result.healthTip}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-5 md:gap-8">
              <HealthGauge score={result.healthScore ?? 0} />
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Health Score</p>
                <p className="text-lg font-semibold" style={{ color: getScoreHex(result.healthScore ?? 0) }}>
                  {scoreLabel}
                </p>
              </div>
            </div>
          </div>

          {result.productDetails && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {result.productDetails.manufacturingDate && (
                <div className="p-3 rounded-lg bg-card/50 border border-primary/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Manufactured</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{new Date(result.productDetails.manufacturingDate).toLocaleDateString()}</p>
                </div>
              )}
              {result.productDetails.expiryDate && (
                <div className="p-3 rounded-lg bg-card/50 border border-primary/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-destructive" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Expires</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{new Date(result.productDetails.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-card/50 border border-primary/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Days Left</p>
                </div>
                <p className={`text-2xl font-bold ${getExpiryColor(daysUntilExpiry)}`}>
                  {daysUntilExpiry > 0 ? daysUntilExpiry : "EXPIRED"}
                </p>
              </div>
              {result.productDetails.shelfLife && (
                <div className="p-3 rounded-lg bg-card/50 border border-primary/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Timer className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Shelf Life</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{result.productDetails.shelfLife}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Charts: macros donut + daily value bars */}
        {(result.nutrition || result.healthScoreBreakdown?.factors) && (
          <div className="grid md:grid-cols-2 gap-6">
            {result.nutrition && (
              <Card className="bg-background border-2 border-primary/20 p-6" id="nutrition">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-full bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Macro Split</h3>
                </div>
                <MacroDonut
                  protein={Number(result.nutrition.protein) || 0}
                  carbs={Number(result.nutrition.carbs) || 0}
                  fat={Number(result.nutrition.fat) || 0}
                />
              </Card>
            )}
            {result.nutrition && (
              <Card className="bg-background border-2 border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-full bg-accent/10">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">% Daily Value</h3>
                </div>
                <NutritionDailyChart nutrition={result.nutrition} />
              </Card>
            )}
          </div>
        )}

        {/* Nutrition stat cards */}
        {nutritionEntries.length > 0 && (
          <Card className="bg-background border-2 border-primary/20 p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Nutrition Facts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nutritionEntries.map(([key, value], i) => {
                const max = NUTRIENT_DAILY_MAX[key] || 100;
                const percentage = Math.min((Number(value) / max) * 100, 100);
                const color = NUTRIENT_COLORS[key] || "#3b82f6";
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-card/40 rounded-lg border border-border/60"
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color }}>
                      {value as number}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize mb-2">{key}</div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${percentage || 0}%`, background: color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Health score breakdown chart */}
        {result.healthScoreBreakdown?.factors?.length > 0 && (
          <Card className="bg-background border-2 border-primary/20 p-6" id="health">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-full bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Score Breakdown</h3>
            </div>
            <ScoreBreakdownChart factors={result.healthScoreBreakdown.factors} />
            <div className="mt-5 grid md:grid-cols-2 gap-3">
              {result.healthScoreBreakdown.factors.map((factor: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-4 rounded-lg bg-card/40 border border-border/60"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-foreground text-sm">{factor.factor}</span>
                    <Badge variant={factor.impact > 0 ? "default" : "destructive"}>
                      {factor.impact > 0 ? "+" : ""}
                      {factor.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{factor.description}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Ingredients */}
        {result.ingredients && (
          <Card className="bg-background border-2 border-primary/20 p-6" id="ingredients">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-full bg-primary/10">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Ingredients Analysis</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h4 className="font-semibold text-foreground">Harmful</h4>
                  <Badge variant="destructive">{result.ingredients.harmful?.length || 0}</Badge>
                </div>
                {(result.ingredients.harmful || []).map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="p-3.5 bg-destructive/10 rounded-lg border-l-4 border-destructive/60 hover:bg-destructive/15 transition-colors"
                  >
                    <p className="text-sm text-foreground leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5 text-success" />
                  <h4 className="font-semibold text-foreground">Beneficial</h4>
                  <Badge variant="default">{result.ingredients.beneficial?.length || 0}</Badge>
                </div>
                {(result.ingredients.beneficial || []).map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="p-3.5 bg-success/10 rounded-lg border-l-4 border-success/60 hover:bg-success/15 transition-colors"
                  >
                    <p className="text-sm text-foreground leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            {result.ingredients.allergens?.length > 0 && (
              <div className="mt-5 p-4 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Allergens</p>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.allergens.map((a: string, i: number) => (
                    <Badge key={i} variant="destructive">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Vitamins + Minerals combined */}
        {(result.vitamins || result.minerals) && (
          <div className="grid md:grid-cols-2 gap-6">
            {result.vitamins && (
              <Card className="bg-background border-2 border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-full bg-success/10">
                    <Leaf className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Vitamins</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(result.vitamins).map(([key, value], i) => {
                    const pct = (value as string)?.includes("%")
                      ? parseInt((value as string).match(/\d+/)?.[0] || "0")
                      : 0;
                    const color = ["#eab308", "#22c55e", "#8b5cf6", "#f97316"][i % 4];
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 bg-success/5 rounded-lg border border-success/20"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-foreground text-sm capitalize">
                            {key.replace("vitamin", "Vit. ")}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">{value as string}</span>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}
            {result.minerals && (
              <Card className="bg-background border-2 border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-full bg-accent/10">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Minerals</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(result.minerals).map(([key, value], i) => {
                    const pct = (value as string)?.includes("%")
                      ? parseInt((value as string).match(/\d+/)?.[0] || "0")
                      : 0;
                    const color = ["#06b6d4", "#ec4899", "#f59e0b", "#3b82f6"][i % 4];
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 bg-accent/5 rounded-lg border border-accent/20"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-foreground text-sm capitalize">{key}</span>
                          <span className="text-xs font-medium text-muted-foreground">{value as string}</span>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Product details (single card) */}
        {result.productDetails && (
          <Card className="bg-background border-2 border-primary/20 p-6" id="details">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-full bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Product Details</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.productDetails.manufacturer && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-card/40 border border-border/60">
                  <Factory className="w-5 h-5 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Manufacturer</p>
                    <p className="text-sm font-semibold text-foreground truncate">{result.productDetails.manufacturer}</p>
                  </div>
                </div>
              )}
              {result.productDetails.batchNumber && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-card/40 border border-border/60">
                  <Package className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Batch Number</p>
                    <p className="text-sm font-semibold text-foreground truncate">{result.productDetails.batchNumber}</p>
                  </div>
                </div>
              )}
              {result.productDetails.manufacturingDate && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-card/40 border border-border/60">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Manufactured</p>
                    <p className="text-sm font-semibold text-foreground">{new Date(result.productDetails.manufacturingDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {result.productDetails.expiryDate && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-card/40 border border-border/60">
                  <Calendar className="w-5 h-5 text-destructive shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Expiry</p>
                    <p className="text-sm font-semibold text-foreground">{new Date(result.productDetails.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {result.productDetails.shelfLife && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-card/40 border border-border/60">
                  <Timer className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Shelf Life</p>
                    <p className="text-sm font-semibold text-foreground">{result.productDetails.shelfLife}</p>
                  </div>
                </div>
              )}
              {result.productDetails.contact && (
                <div className="flex items-center gap-3 p-3.5 rounded-lg bg-card/40 border border-border/60">
                  <User className="w-5 h-5 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Contact</p>
                    <p className="text-sm font-semibold text-foreground truncate">{result.productDetails.contact}</p>
                  </div>
                </div>
              )}
            </div>
            {result.productDetails.certifications?.length > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {result.productDetails.certifications.map((cert: string, i: number) => (
                    <Badge key={i} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Company & Brand */}
        {result.companyInfo && (
          <Card className="bg-background border-2 border-primary/30 p-6" id="company">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-full bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Brand & Company Insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {result.companyInfo.companyName && (
                <div className="p-4 rounded-lg bg-card/40 border border-border/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 className="w-4 h-4 text-accent" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Company</p>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{result.companyInfo.companyName}</p>
                </div>
              )}
              {result.companyInfo.founder && (
                <div className="p-4 rounded-lg bg-card/40 border border-border/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="w-4 h-4 text-accent" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Founder & Origin</p>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{result.companyInfo.founder}</p>
                </div>
              )}
              {result.companyInfo.history && (
                <div className="p-4 rounded-lg bg-card/40 border border-border/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <History className="w-4 h-4 text-accent" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Company History</p>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{result.companyInfo.history}</p>
                </div>
              )}
              {result.companyInfo.marketPosition && (
                <div className="p-4 rounded-lg bg-card/40 border border-border/60">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Market Position</p>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{result.companyInfo.marketPosition}</p>
                </div>
              )}
            </div>
            {result.companyInfo.keyFacts?.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Key Facts</p>
                </div>
                <div className="space-y-2">
                  {result.companyInfo.keyFacts.map((fact: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-card/30 border border-border/40"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-sm text-foreground/90 leading-relaxed">{fact}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Homemade alternative */}
        {result.homemadeAlternative && (
          <Card className="bg-background border-2 border-primary/20 p-6" id="homemade">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-success/10">
                <Leaf className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Homemade Alternative</h3>
                <p className="text-sm text-primary font-medium">{result.homemadeAlternative.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-card/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Prep</p>
                <p className="text-sm font-bold text-foreground">{result.homemadeAlternative.prepTime}</p>
              </div>
              <div className="p-3 rounded-lg bg-card/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Cook</p>
                <p className="text-sm font-bold text-foreground">{result.homemadeAlternative.cookTime}</p>
              </div>
              <div className="p-3 rounded-lg bg-card/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Servings</p>
                <p className="text-sm font-bold text-foreground">{result.homemadeAlternative.servings}</p>
              </div>
              <div className="p-3 rounded-lg bg-card/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Cal / Serving</p>
                <p className="text-sm font-bold text-foreground">{result.homemadeAlternative.caloriesPerServing}</p>
              </div>
            </div>
            <Separator className="mb-5" />
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                  <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Total Cost
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {result.homemadeAlternative.totalCost || result.homemadeAlternative.costEstimate}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Per Serving
                    </p>
                    <p className="text-xl font-bold text-primary">{result.homemadeAlternative.perServingCost}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Savings</p>
                    <p className="text-xl font-bold text-success">{result.homemadeAlternative.savingsVsStoreBought}</p>
                  </div>
                  {result.homemadeAlternative.healthierBy && (
                    <div className="p-3.5 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Healthier By</p>
                      <p className="text-xl font-bold text-success">{result.homemadeAlternative.healthierBy}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2.5 text-sm">Ingredients</h5>
                <ul className="space-y-1.5">
                  {(result.homemadeAlternative.ingredients || []).map((ing: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2.5 text-sm">Instructions</h5>
                <ol className="space-y-2">
                  {(result.homemadeAlternative.instructions || []).map((step: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5 min-w-5 flex items-center justify-center shrink-0">
                        {i + 1}
                      </Badge>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Smart comparison */}
        {result.comparison && (
          <Card className="bg-background border-2 border-primary/20 p-6" id="comparison">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-full bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Smart Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2.5">Metric</th>
                    <th className="text-center p-2.5">{result.comparison.productA}</th>
                    <th className="text-center p-2.5">{result.comparison.productB}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-2.5 font-medium">Health Score</td>
                    <td className="text-center p-2.5 font-bold" style={{ color: getScoreHex(result.comparison.healthScoreA || 0) }}>
                      {result.comparison.healthScoreA}
                    </td>
                    <td className="text-center p-2.5 font-bold" style={{ color: getScoreHex(result.comparison.healthScoreB || 0) }}>
                      {result.comparison.healthScoreB}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2.5 font-medium">Calories</td>
                    <td className="text-center p-2.5">{result.comparison.caloriesA}</td>
                    <td className="text-center p-2.5">{result.comparison.caloriesB}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2.5 font-medium">Sugar</td>
                    <td className="text-center p-2.5">{result.comparison.sugarA}g</td>
                    <td className="text-center p-2.5">{result.comparison.sugarB}g</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2.5 font-medium">Protein</td>
                    <td className="text-center p-2.5">{result.comparison.proteinA}g</td>
                    <td className="text-center p-2.5">{result.comparison.proteinB}g</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2.5 font-medium">Quality</td>
                    <td className="text-center p-2.5 text-xs">{result.comparison.ingredientQualityA}</td>
                    <td className="text-center p-2.5 text-xs">{result.comparison.ingredientQualityB}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Cost</td>
                    <td className="text-center p-2.5">{result.comparison.costA}</td>
                    <td className="text-center p-2.5">{result.comparison.costB}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Alternatives */}
        {result.alternatives?.length > 0 && (
          <Card className="bg-background border-2 border-primary/20 p-6" id="alternatives">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-full bg-primary/10">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Healthy Alternatives</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.alternatives.map((alt: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 bg-card/40 rounded-lg border border-border/60 hover:border-primary/40 transition-colors flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground text-sm leading-snug">{alt.name}</h4>
                    <Badge className="shrink-0">{alt.score}/100</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{alt.whyBetter}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                    <span className="text-sm font-bold text-primary">{alt.price}</span>
                    {alt.purchaseLink && alt.purchaseLink !== "#" && (
                      <a
                        href={alt.purchaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Buy <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
});

ResultsDisplay.displayName = "ResultsDisplay";
