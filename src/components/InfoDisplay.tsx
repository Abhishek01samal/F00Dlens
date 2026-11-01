import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Info, Flame, Droplet, Wheat, Apple, Leaf, Shield, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

interface InfoData {
  productName: string;
  healthScore: number;
  scoreCategory: string;
  ingredients: {
    all: string[];
    natural: string[];
    artificial: string[];
    harmful: string[];
    preservatives: string[];
    allergens: string[];
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
  };
  ingredientExplainer?: Array<{
    name: string;
    purpose: string;
    healthImpact: string;
    details: string;
  }>;
  redFlags: string[];
  dietCompatibility: {
    weightLoss: string;
    diabetic: string;
    keto: string;
    highProtein: string;
    lowFat: string;
    glutenFree: string;
  };
  processingLevel: string;
  environmentalScore: number;
  portionAdvice: string;
  tastePrediction: string;
  texturePrediction: string;
}

// Health Score Gauge Component
const HealthGauge = memo(({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#84cc16";
    if (s >= 40) return "#eab308";
    if (s >= 20) return "#f97316";
    return "#ef4444";
  };

  const gaugeData = [{ value: score, fill: getColor(score) }];

  return (
    <div className="relative w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
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
        <span className="text-3xl font-bold" style={{ color: getColor(score) }}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
});

HealthGauge.displayName = "HealthGauge";

export const InfoDisplay = memo(({ data }: { data: InfoData }) => {
  const nutrition = data?.nutrition ?? {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0
  };
  const ingredients = data?.ingredients ?? {
    all: [], natural: [], artificial: [], harmful: [], preservatives: [], allergens: []
  };

  // Check if we have actual nutrition data
  const hasNutritionData = useMemo(() => {
    return (nutrition.protein || 0) > 0 || (nutrition.carbs || 0) > 0 || (nutrition.fat || 0) > 0;
  }, [nutrition]);

  const hasNutrientData = useMemo(() => {
    return (nutrition.fiber || 0) > 0 || (nutrition.sugar || 0) > 0 || 
           (nutrition.sodium || 0) > 0 || (nutrition.cholesterol || 0) > 0;
  }, [nutrition]);

  const hasIngredientData = useMemo(() => {
    return (ingredients.natural?.length || 0) > 0 || (ingredients.artificial?.length || 0) > 0 ||
           (ingredients.preservatives?.length || 0) > 0 || (ingredients.allergens?.length || 0) > 0;
  }, [ingredients]);

  // Macro pie chart data
  const macroData = useMemo(() => [
    { name: "Protein", value: nutrition.protein || 0, fill: "#22c55e" },
    { name: "Carbs", value: nutrition.carbs || 0, fill: "#3b82f6" },
    { name: "Fat", value: nutrition.fat || 0, fill: "#f97316" },
  ], [nutrition.protein, nutrition.carbs, nutrition.fat]);

  // Nutrition bar chart data
  const nutritionBarData = useMemo(() => [
    { name: "Fiber", value: nutrition.fiber || 0, fill: "#22c55e" },
    { name: "Sugar", value: nutrition.sugar || 0, fill: "#ef4444" },
    { name: "Sodium", value: (nutrition.sodium || 0) / 10, fill: "#f97316" },
    { name: "Cholesterol", value: (nutrition.cholesterol || 0) / 5, fill: "#a855f7" },
  ], [nutrition.fiber, nutrition.sugar, nutrition.sodium, nutrition.cholesterol]);

  // Ingredient breakdown
  const ingredientData = useMemo(() => [
    { name: "Natural", value: (ingredients.natural || []).length, fill: "#22c55e" },
    { name: "Artificial", value: (ingredients.artificial || []).length, fill: "#ef4444" },
    { name: "Preservatives", value: (ingredients.preservatives || []).length, fill: "#f97316" },
    { name: "Allergens", value: (ingredients.allergens || []).length, fill: "#eab308" },
  ].filter(d => d.value > 0), [ingredients]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 py-6"
    >
      {/* Modern Product Header Card */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Health Score */}
              <div className="flex-shrink-0">
                <HealthGauge score={data.healthScore || 0} />
                <p className="text-center text-sm font-medium text-muted-foreground mt-2">
                  {data.scoreCategory || 'Health Score'}
                </p>
              </div>
              
              {/* Product Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {data.productName || 'Product Analysis'}
                </h2>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <Badge variant="outline" className="px-3 py-1.5 text-sm bg-primary/10 border-primary/30">
                    <Flame className="w-3.5 h-3.5 mr-1.5" />
                    {nutrition.calories || 0} kcal
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1.5 text-sm bg-green-500/10 border-green-500/30 text-green-600">
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    {data.processingLevel || 'Unknown'}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1.5 text-sm bg-blue-500/10 border-blue-500/30 text-blue-600">
                    <Leaf className="w-3.5 h-3.5 mr-1.5" />
                    Eco: {data.environmentalScore || 0}/100
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Red Flags - Alert Card */}
      {data.redFlags && data.redFlags.length > 0 && (
        <motion.div variants={item}>
          <Card className="p-5 border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-500">Health Warnings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.redFlags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-red-500/5">
                  <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{flag}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Charts Section - Only show if data exists */}
      {(hasNutritionData || hasNutrientData || hasIngredientData) && (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Macro Distribution */}
          {hasNutritionData && (
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                Macro Split
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}g`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                {macroData.map((m, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.fill }} />
                    <span>{m.name}: {m.value}g</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Nutrients Bar */}
          {hasNutrientData && (
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Apple className="h-4 w-4 text-primary" />
                Key Nutrients
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nutritionBarData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={65} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {nutritionBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Ingredient Breakdown */}
          {ingredientData.length > 0 && (
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Wheat className="h-4 w-4 text-primary" />
                Ingredients
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ingredientData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ingredientData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {ingredientData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Nutrition Facts Grid - Only if has data */}
      {hasNutritionData && (
        <motion.div variants={item}>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Nutrition Facts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(nutrition).filter(([_, value]) => value > 0).map(([key, value]) => (
              <Card key={key} className="p-4 text-center hover:border-primary/50 transition-all hover:shadow-md">
                <div className="text-xl font-bold text-primary">{typeof value === 'number' ? value : 0}</div>
                <div className="text-xs text-muted-foreground capitalize">{key}</div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ingredients Analysis - Modern Cards */}
      {((ingredients.natural?.length || 0) > 0 || (ingredients.artificial?.length || 0) > 0 || (ingredients.harmful?.length || 0) > 0) && (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(ingredients.natural?.length || 0) > 0 && (
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-full bg-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <h3 className="font-semibold">Natural Ingredients</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(ingredients.natural || []).map((ing, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    {ing}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {((ingredients.artificial?.length || 0) > 0 || (ingredients.harmful?.length || 0) > 0) && (
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-full bg-red-500/20">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <h3 className="font-semibold">Artificial/Harmful</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...(ingredients.artificial || []), ...(ingredients.harmful || [])].map((ing, idx) => (
                  <Badge key={idx} variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                    {ing}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Allergens */}
      {(ingredients.allergens?.length || 0) > 0 && (
        <motion.div variants={item}>
          <Card className="p-5 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-full bg-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-yellow-600">Allergen Alert</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(ingredients.allergens || []).map((allergen, idx) => (
                <Badge key={idx} className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                  {allergen}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Ingredient Explainer */}
      {data.ingredientExplainer && data.ingredientExplainer.length > 0 && (
        <motion.div variants={item}>
          <h3 className="text-lg font-bold mb-3">Ingredient Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.ingredientExplainer.map((ing, idx) => (
              <Card key={idx} className="p-4 hover:border-primary/50 transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <Info className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{ing.name}</h4>
                      <Badge variant="outline" className={
                        ing.healthImpact === "good" ? "bg-green-500/10 text-green-600 border-green-500/30 text-xs" :
                        ing.healthImpact === "bad" ? "bg-red-500/10 text-red-600 border-red-500/30 text-xs" :
                        "bg-muted text-muted-foreground text-xs"
                      }>
                        {ing.healthImpact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ing.purpose}</p>
                    <p className="text-xs mt-1.5 text-foreground/70">{ing.details}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Diet Compatibility */}
      {data.dietCompatibility && Object.keys(data.dietCompatibility).length > 0 && (
        <motion.div variants={item}>
          <h3 className="text-lg font-bold mb-3">Diet Compatibility</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(data.dietCompatibility || {}).map(([diet, status]) => {
              const isGood = (status || '').toLowerCase().includes("suitable") || (status || '').toLowerCase().includes("yes");
              return (
                <Card key={diet} className={`p-3 text-center transition-all hover:shadow-md ${isGood ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <div className="text-xs font-medium capitalize mb-1.5 text-muted-foreground">
                    {diet.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <Badge variant="outline" className={
                    isGood
                      ? "bg-green-500/10 text-green-600 border-green-500/30"
                      : "bg-red-500/10 text-red-600 border-red-500/30"
                  }>
                    {isGood ? '✓' : '✗'}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Additional Info Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.processingLevel && (
          <Card className="p-4 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Processing</h4>
            <p className="text-sm font-semibold">{data.processingLevel}</p>
          </Card>
        )}
        {data.environmentalScore > 0 && (
          <Card className="p-4 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Leaf className="h-3 w-3" /> Eco Score
            </h4>
            <p className="text-lg font-bold text-primary">{data.environmentalScore}/100</p>
          </Card>
        )}
        {data.tastePrediction && (
          <Card className="p-4 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Taste</h4>
            <p className="text-sm font-semibold capitalize">{data.tastePrediction}</p>
          </Card>
        )}
        {data.texturePrediction && (
          <Card className="p-4 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Texture</h4>
            <p className="text-sm font-semibold capitalize">{data.texturePrediction}</p>
          </Card>
        )}
      </motion.div>

      {/* Portion Advice */}
      {data.portionAdvice && (
        <motion.div variants={item}>
          <Card className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <h3 className="text-base font-bold mb-2 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              Portion Advice
            </h3>
            <p className="text-sm text-muted-foreground">{data.portionAdvice}</p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
});

InfoDisplay.displayName = "InfoDisplay";
