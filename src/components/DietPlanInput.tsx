import { useState, memo, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Loader2, Apple, Target, Utensils, Heart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DietPlanInputProps {
  onSubmit: (answers: DietAnswers) => void;
  isLoading: boolean;
  onBack: () => void;
}

export interface DietAnswers {
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  activityLevel: string;
  wakeTime: string;
  sleepTime: string;
  dietType: string;
  medicalConditions: string[];
  fitnessGoal: string;
  extraGoals: string[];
}

const initialAnswers: DietAnswers = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  goal: "",
  activityLevel: "",
  wakeTime: "07:00",
  sleepTime: "23:00",
  dietType: "",
  medicalConditions: [],
  fitnessGoal: "",
  extraGoals: [],
};

const steps = [
  { id: 1, title: "Basic Info", icon: Apple },
  { id: 2, title: "Health", icon: Heart },
  { id: 3, title: "Lifestyle", icon: Target },
  { id: 4, title: "Goals", icon: Utensils },
];

// Modern chip selector component
const ChipSelector = memo(({ 
  options, 
  selected, 
  onSelect, 
  multiSelect = false,
  columns = 2 
}: { 
  options: { value: string; label: string; icon?: string }[]; 
  selected: string | string[]; 
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  columns?: number;
}) => {
  const isSelected = (value: string) => 
    multiSelect ? (selected as string[]).includes(value) : selected === value;

  return (
    <div className={cn(
      "grid gap-2",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-4"
    )}>
      {options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
            "flex items-center justify-center gap-2",
            isSelected(option.value)
              ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20"
              : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {option.icon && <span>{option.icon}</span>}
          <span>{option.label}</span>
          {isSelected(option.value) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
});

ChipSelector.displayName = "ChipSelector";

// Modern time selector
const ModernTimeSelector = memo(({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => {
  const [hour, minute] = value.split(':');
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2 items-center">
        <select
          value={hour}
          onChange={(e) => onChange(`${e.target.value}:${minute}`)}
          className="flex-1 h-12 rounded-xl border-2 border-border/50 bg-card/50 px-4 text-lg font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <select
          value={minute}
          onChange={(e) => onChange(`${hour}:${e.target.value}`)}
          className="flex-1 h-12 rounded-xl border-2 border-border/50 bg-card/50 px-4 text-lg font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          {['00', '15', '30', '45'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
});

ModernTimeSelector.displayName = "ModernTimeSelector";

export const DietPlanInput = memo(({ onSubmit, isLoading, onBack }: DietPlanInputProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<DietAnswers>(initialAnswers);

  const updateAnswer = useCallback((key: keyof DietAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayValue = useCallback((key: keyof DietAnswers, value: string) => {
    setAnswers((prev) => {
      const currentArray = prev[key] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [key]: currentArray.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...currentArray, value] };
    });
  }, []);

  const nextStep = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, 4)), []);
  const prevStep = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 1)), []);

  const handleSubmit = useCallback(() => {
    onSubmit(answers);
  }, [answers, onSubmit]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Age</Label>
                <Input 
                  type="number" 
                  placeholder="25" 
                  value={answers.age} 
                  onChange={(e) => updateAnswer("age", e.target.value)} 
                  className="h-12 rounded-xl border-2 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender</Label>
                <ChipSelector
                  options={[
                    { value: "male", label: "Male", icon: "👨" },
                    { value: "female", label: "Female", icon: "👩" },
                  ]}
                  selected={answers.gender}
                  onSelect={(v) => updateAnswer("gender", v)}
                  columns={2}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Height (cm)</Label>
                <Input 
                  type="number" 
                  placeholder="170" 
                  value={answers.height} 
                  onChange={(e) => updateAnswer("height", e.target.value)} 
                  className="h-12 rounded-xl border-2 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Weight (kg)</Label>
                <Input 
                  type="number" 
                  placeholder="70" 
                  value={answers.weight} 
                  onChange={(e) => updateAnswer("weight", e.target.value)} 
                  className="h-12 rounded-xl border-2 text-lg"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Health & Activity</h3>
                <p className="text-sm text-muted-foreground">Your lifestyle details</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Activity Level</Label>
              <ChipSelector
                options={[
                  { value: "sedentary", label: "Sedentary", icon: "🪑" },
                  { value: "light", label: "Light", icon: "🚶" },
                  { value: "moderate", label: "Moderate", icon: "🏃" },
                  { value: "heavy", label: "Very Active", icon: "🏋️" },
                ]}
                selected={answers.activityLevel}
                onSelect={(v) => updateAnswer("activityLevel", v)}
                columns={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Medical Conditions (select all that apply)</Label>
              <ChipSelector
                options={[
                  { value: "Diabetes", label: "Diabetes", icon: "💉" },
                  { value: "Thyroid", label: "Thyroid", icon: "🦋" },
                  { value: "PCOS", label: "PCOS", icon: "🩺" },
                  { value: "High BP", label: "High BP", icon: "❤️" },
                  { value: "None", label: "None", icon: "✅" },
                ]}
                selected={answers.medicalConditions}
                onSelect={(v) => toggleArrayValue("medicalConditions", v)}
                multiSelect
                columns={3}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Schedule & Diet</h3>
                <p className="text-sm text-muted-foreground">Your daily routine</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <ModernTimeSelector 
                value={answers.wakeTime} 
                onChange={(v) => updateAnswer("wakeTime", v)} 
                label="Wake-up Time ☀️" 
              />
              <ModernTimeSelector 
                value={answers.sleepTime} 
                onChange={(v) => updateAnswer("sleepTime", v)} 
                label="Sleep Time 🌙" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Diet Type</Label>
              <ChipSelector
                options={[
                  { value: "vegetarian", label: "Vegetarian", icon: "🥗" },
                  { value: "non-veg", label: "Non-Veg", icon: "🍗" },
                  { value: "eggetarian", label: "Eggetarian", icon: "🥚" },
                  { value: "vegan", label: "Vegan", icon: "🌱" },
                ]}
                selected={answers.dietType}
                onSelect={(v) => updateAnswer("dietType", v)}
                columns={4}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your Goals</h3>
                <p className="text-sm text-muted-foreground">What you want to achieve</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primary Goal</Label>
              <ChipSelector
                options={[
                  { value: "fat-loss", label: "Fat Loss", icon: "🔥" },
                  { value: "muscle-gain", label: "Muscle Gain", icon: "💪" },
                  { value: "maintain", label: "Maintain", icon: "⚖️" },
                  { value: "health", label: "Health", icon: "❤️" },
                ]}
                selected={answers.goal}
                onSelect={(v) => updateAnswer("goal", v)}
                columns={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fitness Focus</Label>
              <ChipSelector
                options={[
                  { value: "strength", label: "Strength", icon: "🏋️" },
                  { value: "endurance", label: "Endurance", icon: "🏃" },
                  { value: "flexibility", label: "Flexibility", icon: "🧘" },
                  { value: "general", label: "General", icon: "⭐" },
                ]}
                selected={answers.fitnessGoal}
                onSelect={(v) => updateAnswer("fitnessGoal", v)}
                columns={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Extra Goals (select all that apply)</Label>
              <ChipSelector
                options={[
                  { value: "Better Sleep", label: "Better Sleep", icon: "😴" },
                  { value: "More Energy", label: "More Energy", icon: "⚡" },
                  { value: "Skin Glow", label: "Skin Glow", icon: "✨" },
                  { value: "Gut Health", label: "Gut Health", icon: "🦠" },
                  { value: "Hair Growth", label: "Hair Growth", icon: "💇" },
                  { value: "Focus", label: "Focus", icon: "🧠" },
                ]}
                selected={answers.extraGoals}
                onSelect={(v) => toggleArrayValue("extraGoals", v)}
                multiSelect
                columns={3}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card className="p-6 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border-primary/20 shadow-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    boxShadow: isActive ? "0 0 20px hsl(var(--primary) / 0.5)" : "none"
                  }}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    isActive && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                    isCompleted && "bg-primary/20 text-primary",
                    !isActive && !isCompleted && "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </motion.div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-1 mx-2 rounded-full transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted/30"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border/30">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="rounded-xl px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading} 
              className="rounded-xl px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Generate Diet Plan 🍽️
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
});

DietPlanInput.displayName = "DietPlanInput";
