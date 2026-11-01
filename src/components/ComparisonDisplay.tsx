import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, AlertCircle, TrendingUp, TrendingDown, Zap, Shield, Leaf, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface ComparisonCategory {
  name: string;
  importance: "critical" | "medium" | "optional";
  productA: string;
  productB: string;
  winner: "A" | "B";
  explanation: string;
}

interface ComparisonData {
  productA: string;
  productB: string;
  healthScoreA: number;
  healthScoreB: number;
  winner: string;
  categories: ComparisonCategory[];
}

export const ComparisonDisplay = memo(({ data }: { data: ComparisonData }) => {
  const getImportanceColor = useMemo(() => (importance: string) => {
    switch (importance) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "optional": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  }, []);

  const getScoreColor = useMemo(() => (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-orange-400";
    return "text-red-400";
  }, []);

  const getBarColor = useMemo(() => (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  }, []);

  const { critical, medium, optional, winsA, winsB } = useMemo(() => ({
    critical: data.categories.filter(c => c.importance === "critical"),
    medium: data.categories.filter(c => c.importance === "medium"),
    optional: data.categories.filter(c => c.importance === "optional"),
    winsA: data.categories.filter(c => c.winner === "A").length,
    winsB: data.categories.filter(c => c.winner === "B").length,
  }), [data.categories]);

  // Pie chart data for wins
  const pieData = useMemo(() => [
    { name: data.productA, value: winsA, fill: "#06b6d4" },
    { name: data.productB, value: winsB, fill: "#a855f7" },
  ], [data.productA, data.productB, winsA, winsB]);

  // Bar chart data for scores
  const barData = useMemo(() => [
    { name: "Health Score", [data.productA]: data.healthScoreA, [data.productB]: data.healthScoreB },
  ], [data.productA, data.productB, data.healthScoreA, data.healthScoreB]);

  // Radar chart data for categories
  const radarData = useMemo(() => {
    const categoryScores: Record<string, { A: number; B: number }> = {};
    data.categories.forEach(cat => {
      const key = cat.name.slice(0, 15);
      categoryScores[key] = { A: cat.winner === "A" ? 100 : 50, B: cat.winner === "B" ? 100 : 50 };
    });
    return Object.entries(categoryScores).slice(0, 6).map(([name, scores]) => ({
      category: name,
      [data.productA]: scores.A,
      [data.productB]: scores.B,
    }));
  }, [data.categories, data.productA, data.productB]);

  // Importance distribution bar
  const importanceData = useMemo(() => [
    { name: "Critical", count: critical.length, fill: "#ef4444" },
    { name: "Medium", count: medium.length, fill: "#eab308" },
    { name: "Optional", count: optional.length, fill: "#3b82f6" },
  ], [critical.length, medium.length, optional.length]);

  return (
    <div className="space-y-8 py-8">
      {/* Winner Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-primary/30 relative overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-30 -translate-x-1/2" />
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Winner: {data.winner}</h3>
              <p className="text-muted-foreground">Based on comprehensive health analysis</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Health Score Comparison with Visual Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
      >
        {/* Center Divider */}
        <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center justify-center z-10">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="absolute bg-background border-2 border-primary rounded-full px-3 py-1 text-xs font-bold text-primary">
            VS
          </div>
        </div>

        {/* Product A Score */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">{data.productA}</h4>
            {data.healthScoreA > data.healthScoreB ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                <TrendingUp className="h-3 w-3 mr-1" /> Better
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                <TrendingDown className="h-3 w-3 mr-1" /> Lower
              </Badge>
            )}
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(data.healthScoreA)}`}>
            {data.healthScoreA}<span className="text-lg text-muted-foreground">/100</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Health Score</span>
              <span>{data.healthScoreA}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.healthScoreA}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-full ${getBarColor(data.healthScoreA)} rounded-full`}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Won {winsA} out of {data.categories.length} categories
          </div>
        </Card>

        {/* Product B Score */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">{data.productB}</h4>
            {data.healthScoreB > data.healthScoreA ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                <TrendingUp className="h-3 w-3 mr-1" /> Better
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                <TrendingDown className="h-3 w-3 mr-1" /> Lower
              </Badge>
            )}
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(data.healthScoreB)}`}>
            {data.healthScoreB}<span className="text-lg text-muted-foreground">/100</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Health Score</span>
              <span>{data.healthScoreB}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.healthScoreB}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-full ${getBarColor(data.healthScoreB)} rounded-full`}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Won {winsB} out of {data.categories.length} categories
          </div>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Win Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Win Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-xs">{data.productA}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs">{data.productB}</span>
            </div>
          </div>
        </Card>

        {/* Category Importance Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Category Importance
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importanceData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {importanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Radar Chart for Categories */}
        {radarData.length > 2 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Category Performance
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name={data.productA} dataKey={data.productA} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  <Radar name={data.productB} dataKey={data.productB} stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Category Win Distribution Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Head-to-Head Comparison
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-24 truncate">{data.productA}</span>
            <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(winsA / data.categories.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full bg-cyan-500 flex items-center justify-end pr-2"
              >
                <span className="text-xs font-bold text-white">{winsA}</span>
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(winsB / data.categories.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full bg-purple-500 flex items-center justify-start pl-2"
              >
                <span className="text-xs font-bold text-white">{winsB}</span>
              </motion.div>
            </div>
            <span className="text-sm font-medium w-24 truncate text-right">{data.productB}</span>
          </div>
        </Card>
      </motion.div>

      {/* Critical Comparisons */}
      {critical.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-xl font-bold">Critical Factors</h3>
          </div>
          <div className="space-y-3">
            {critical.map((category, idx) => (
              <Card key={idx} className="p-4 hover:border-primary/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-foreground">{category.name}</h4>
                    <Badge className={getImportanceColor(category.importance)}>Critical</Badge>
                  </div>
                  <Badge variant="outline" className={category.winner === "A" ? "border-cyan-500 text-cyan-500" : "border-purple-500 text-purple-500"}>
                    {category.winner === "A" ? data.productA : data.productB} wins
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className={`p-3 rounded-lg ${category.winner === "A" ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-muted"}`}>
                    <div className="text-xs text-muted-foreground mb-1">{data.productA}</div>
                    <div className={`font-medium ${category.winner === "A" ? "text-cyan-400" : ""}`}>{category.productA}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${category.winner === "B" ? "bg-purple-500/10 border border-purple-500/30" : "bg-muted"}`}>
                    <div className="text-xs text-muted-foreground mb-1">{data.productB}</div>
                    <div className={`font-medium ${category.winner === "B" ? "text-purple-400" : ""}`}>{category.productB}</div>
                  </div>
                </div>
                {category.explanation && (
                  <p className="text-sm text-muted-foreground">{category.explanation}</p>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Medium Importance */}
      {medium.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Important Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medium.map((category, idx) => (
              <Card key={idx} className="p-4 hover:border-primary/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{category.name}</h4>
                  <Badge className={getImportanceColor(category.importance)} variant="outline">Medium</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded text-xs ${category.winner === "A" ? "bg-cyan-500/10 text-cyan-400 font-medium" : "bg-muted text-muted-foreground"}`}>
                    {category.productA}
                  </div>
                  <div className={`p-2 rounded text-xs ${category.winner === "B" ? "bg-purple-500/10 text-purple-400 font-medium" : "bg-muted text-muted-foreground"}`}>
                    {category.productB}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Optional */}
      {optional.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-bold mb-4">Additional Information</h3>
          <div className="flex flex-wrap gap-2">
            {optional.map((category, idx) => (
              <Card key={idx} className="p-3 inline-block">
                <div className="text-xs font-semibold mb-1">{category.name}</div>
                <div className="flex gap-2 text-xs">
                  <span className={category.winner === "A" ? "text-cyan-400 font-medium" : "text-muted-foreground"}>
                    A: {category.productA}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className={category.winner === "B" ? "text-purple-400 font-medium" : "text-muted-foreground"}>
                    B: {category.productB}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
});

ComparisonDisplay.displayName = "ComparisonDisplay";
