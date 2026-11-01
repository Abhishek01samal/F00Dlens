import { useState, useCallback, lazy, Suspense, memo, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { UploadSection } from "@/components/UploadSection";
import { UserDropdown } from "@/components/ui/user-dropdown";
import { FolderModeSelector } from "@/components/ui/3d-folder";
import { ComparisonSkeleton, DietPlanSkeleton, InfoSkeleton } from "@/components/ui/result-skeleton";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageCompressor";
import { useHistoryStore } from "@/hooks/useHistoryStore";
import type { DietAnswers } from "@/components/DietPlanInput";

// Lazy load heavy components
const SplashCursor = lazy(() => import("@/components/SplashCursor"));
const AnimatedShaderBackground = lazy(() => import("@/components/ui/animated-shader-background"));
const ResultsDisplay = lazy(() => import("@/components/ResultsDisplay").then(m => ({ default: m.ResultsDisplay })));
const ComparisonDisplay = lazy(() => import("@/components/ComparisonDisplay").then(m => ({ default: m.ComparisonDisplay })));
const ComparisonInput = lazy(() => import("@/components/ComparisonInput").then(m => ({ default: m.ComparisonInput })));
const InfoInput = lazy(() => import("@/components/InfoInput").then(m => ({ default: m.InfoInput })));
const InfoDisplay = lazy(() => import("@/components/InfoDisplay").then(m => ({ default: m.InfoDisplay })));
const FoodHistoryDisplay = lazy(() => import("@/components/FoodHistoryDisplay").then(m => ({ default: m.FoodHistoryDisplay })));
const DietPlanDisplay = lazy(() => import("@/components/DietPlanDisplay").then(m => ({ default: m.DietPlanDisplay })));
const DietPlanInput = lazy(() => import("@/components/DietPlanInput").then(m => ({ default: m.DietPlanInput })));

interface IndexProps {
  user: {
    name: string;
    email: string;
    initials: string;
    avatar?: string;
  } | null;
  onLogout: () => void;
}

import { analyzeProduct, chatWithAI } from "@/services/geminiService";

// ── Component ────────────────────────────────────────────────────────────────

const Index = memo(({ user, onLogout }: IndexProps) => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showInfoInput, setShowInfoInput] = useState(false);
  const [showDietInput, setShowDietInput] = useState(false);
  const [infoType, setInfoType] = useState<'product' | 'food' | null>(null);
  const [aiMode, setAiMode] = useState<'comparison' | 'info' | 'diet' | 'food' | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showComparisonInput, setShowComparisonInput] = useState(false);

  const { history, hasInteracted, addToHistory, clearHistory, markInteracted } = useHistoryStore();

  const isSplashCursorActive =
    !showComparisonInput &&
    !showInfoInput &&
    !showDietInput &&
    uploadedImages.length === 0 &&
    !aiResult &&
    !analysisResult &&
    !isAnalyzing;

  const handleUpload = useCallback(async (files: File[]) => {
    markInteracted();
    setIsAnalyzing(true);
    toast.loading("Analyzing your products with AI...", { id: "analysis" });

    try {
      const base64Images = await Promise.all(
        files.map(file => compressImage(file, 1280, 0.82))
      );

      const displayImages = await Promise.all(
        files.map(file => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }))
      );
      setUploadedImages(prev => [...prev, ...displayImages]);

      const data = await analyzeProduct(base64Images);

      if (!data) {
        toast.error("Failed to analyze products.", { id: "analysis" });
        setIsAnalyzing(false);
        return;
      }

      setAnalysisResult(data);

      addToHistory({
        mode: 'product',
        title: 'Product Analysis',
        description: `Analyzed ${files.length} product image(s)`,
        data: data,
      });
      toast.success("Analysis complete!", { id: "analysis" });
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const message = err instanceof Error ? err.message : "Failed to process images.";
      toast.error(message, { id: "analysis" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [addToHistory, markInteracted]);

  const handleClearAllImages = useCallback(() => {
    setUploadedImages([]);
    setAnalysisResult(null);
  }, []);

  const clearAllResults = useCallback(() => {
    setAiResult(null);
    setAnalysisResult(null);
    setAiMode(null);
    setInfoType(null);
    setLoadingProgress(0);
  }, []);

  const handleModeSelect = useCallback((mode: string) => {
    markInteracted();
    clearAllResults();
    if (mode === "comparison") {
      setShowComparisonInput(true);
      setShowInfoInput(false);
      setShowDietInput(false);
    } else if (mode === "info") {
      setShowInfoInput(true);
      setShowComparisonInput(false);
      setShowDietInput(false);
    } else if (mode === "diet") {
      setShowDietInput(true);
      setShowComparisonInput(false);
      setShowInfoInput(false);
    }
  }, [clearAllResults, markInteracted]);

  const handleHistorySelect = useCallback((item: { mode: string; data: unknown }) => {
    clearAllResults();
    setShowComparisonInput(false);
    setShowInfoInput(false);
    setShowDietInput(false);

    setAiResult(item.data);
    setAiMode(item.mode as 'comparison' | 'info' | 'diet' | 'food' | null);
    if (item.mode === 'product' || item.mode === 'food') {
      setInfoType(item.mode as 'product' | 'food');
    }
  }, [clearAllResults]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    clearAllResults();
    setShowComparisonInput(false);
    setShowInfoInput(false);
    setShowDietInput(false);
    setUploadedImages([]);
    toast.success("History cleared!");
  }, [clearHistory, clearAllResults]);

  const simulateProgress = useCallback(() => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleComparisonRequest = useCallback(async (productA: string, productB: string, imageA?: File, imageB?: File) => {
    clearAllResults();
    setAiMode("comparison");
    setIsAnalyzing(true);
    setShowComparisonInput(false);
    const cleanup = simulateProgress();

    try {
      let base64Images: string[] = [];
      if (imageA || imageB) {
        const imagesToProcess = [imageA, imageB].filter(Boolean) as File[];
        base64Images = await Promise.all(
          imagesToProcess.map(file => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }))
        );
      }

      const data = await chatWithAI({
        mode: 'comparison',
        message: 'Compare these products',
        productA,
        productB,
        images: base64Images.length > 0 ? base64Images : undefined,
      });

      if (!data) { toast.error("Failed to compare products."); setIsAnalyzing(false); return; }

      setLoadingProgress(100);
      setAiResult(data);

      addToHistory({
        mode: 'comparison',
        title: `${productA} vs ${productB}`,
        description: `Comparison analysis between two products`,
        data: data,
      });

      toast.success("Comparison complete!");
    } catch {
      toast.error("Failed to compare products.");
    } finally {
      cleanup();
      setIsAnalyzing(false);
    }
  }, [clearAllResults, simulateProgress, addToHistory]);

  const handleInfoRequest = useCallback(async (type: 'product' | 'food', query: string, image?: File) => {
    clearAllResults();
    setAiMode(type === 'product' ? 'info' : 'food');
    setInfoType(type);
    setIsAnalyzing(true);
    setShowInfoInput(false);
    const cleanup = simulateProgress();

    try {
      let base64Images: string[] = [];
      if (image) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
        base64Images = [base64];
      }

      const data = await chatWithAI({
        mode: type === 'product' ? 'product-info' : 'food-history',
        message: query,
        images: base64Images.length > 0 ? base64Images : undefined,
      });

      if (!data) { toast.error("Failed to analyze."); setIsAnalyzing(false); return; }

      setLoadingProgress(100);
      setAiResult(data);

      addToHistory({
        mode: type,
        title: query,
        description: type === 'product' ? 'Product information analysis' : 'Food origin and history',
        data: data,
      });

      toast.success("Analysis complete!");
    } catch {
      toast.error("Failed to analyze.");
    } finally {
      cleanup();
      setIsAnalyzing(false);
    }
  }, [clearAllResults, simulateProgress, addToHistory]);

  const handleDietPlanSubmit = useCallback(async (answers: DietAnswers) => {
    clearAllResults();
    setAiMode("diet");
    setIsAnalyzing(true);
    setShowDietInput(false);
    const cleanup = simulateProgress();

    try {
      const message = `Create a complete personalized diet plan with all calculations. User info: Age ${answers.age}, Gender: ${answers.gender}, Height: ${answers.height}cm, Weight: ${answers.weight}kg. Goal: ${answers.goal}. Activity Level: ${answers.activityLevel}. Diet Type: ${answers.dietType}. Medical Conditions: ${answers.medicalConditions.join(", ") || "None"}. Wake Time: ${answers.wakeTime}, Sleep Time: ${answers.sleepTime}. Fitness Goal: ${answers.fitnessGoal}. Extra Goals: ${answers.extraGoals.join(", ") || "None"}. 
      
      IMPORTANT: Return a COMPLETE diet plan with BMR, TDEE, target calories, macro breakdown (protein, carbs, fats in grams), and full Indian meal plan for breakfast, lunch, dinner, and snacks. Include gym workout nutrition if applicable. Return as structured JSON.`;

      const data = await chatWithAI({ mode: 'diet', message });

      if (!data) { toast.error("Failed to create diet plan."); setIsAnalyzing(false); return; }

      setLoadingProgress(100);
      setAiResult(data);

      addToHistory({
        mode: 'diet',
        title: `Diet Plan - ${answers.goal}`,
        description: `${answers.dietType} diet for ${answers.fitnessGoal}`,
        data: data,
      });

      toast.success("Diet plan created!");
    } catch {
      toast.error("Failed to create diet plan.");
    } finally {
      cleanup();
      setIsAnalyzing(false);
    }
  }, [clearAllResults, simulateProgress, addToHistory]);

  const handleBack = useCallback(() => {
    setShowComparisonInput(false);
    setShowInfoInput(false);
    setShowDietInput(false);
  }, []);

  const showMainUI = !showComparisonInput && !showInfoInput && !showDietInput;

  const aiResultObj = aiResult as Record<string, any> | null;
  const showProductInfo = Boolean(aiResult && !isAnalyzing && (aiMode === 'info' || infoType === 'product') && aiResultObj?.productName);
  const showFoodHistory = Boolean(aiResult && !isAnalyzing && (aiMode === 'food' || infoType === 'food') && aiResultObj?.dishName);
  const showComparison = Boolean(aiResult && !isAnalyzing && aiMode === 'comparison' && aiResultObj?.comparison);
  const showDietPlan = Boolean(aiResult && !isAnalyzing && aiMode === 'diet');

  useEffect(() => {
    if (showProductInfo || showFoodHistory || showComparison || showDietPlan || analysisResult) {
      setTimeout(() => {
        const resultsEl = document.getElementById('ai-results') || document.getElementById('results');
        if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showProductInfo, showFoodHistory, showComparison, showDietPlan, analysisResult]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated shader background */}
      <Suspense fallback={null}>
        <AnimatedShaderBackground />
      </Suspense>

      {/* Splash cursor */}
      {isSplashCursorActive && (
        <Suspense fallback={null}>
          <SplashCursor />
        </Suspense>
      )}

      {/* User Profile Dropdown */}
      {user && (
        <div className="fixed top-4 left-4 z-50">
          <UserDropdown
            user={user}
            history={history}
            onSelectHistoryItem={handleHistorySelect}
            onClearHistory={handleClearHistory}
            onLogout={onLogout}
          />
        </div>
      )}

      <div className="relative z-10">
        <Hero />
      </div>

      {showMainUI && (
        <div className="container mx-auto px-4 py-4 max-w-5xl relative z-10">
          <FolderModeSelector onSelect={handleModeSelect} isLoading={isAnalyzing} />
        </div>
      )}

      {showComparisonInput && (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Suspense fallback={<ComparisonSkeleton />}>
            <ComparisonInput onCompare={handleComparisonRequest} isLoading={isAnalyzing} onBack={handleBack} />
          </Suspense>
        </div>
      )}

      {showInfoInput && (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Suspense fallback={<InfoSkeleton />}>
            <InfoInput onAnalyze={handleInfoRequest} isLoading={isAnalyzing} onBack={handleBack} />
          </Suspense>
        </div>
      )}

      {showDietInput && (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Suspense fallback={<DietPlanSkeleton />}>
            <DietPlanInput onSubmit={handleDietPlanSubmit} isLoading={isAnalyzing} onBack={handleBack} />
          </Suspense>
        </div>
      )}

      {showMainUI && (
        <div className="relative z-10">
          <UploadSection onUpload={handleUpload} uploadedImages={uploadedImages} onClearHistory={handleClearAllImages} isAnalyzing={isAnalyzing} />
        </div>
      )}

      {analysisResult && (
        <div id="results" className="relative mt-2 z-10">
          <Suspense fallback={<InfoSkeleton />}>
            <ResultsDisplay result={analysisResult as any} />
          </Suspense>
        </div>
      )}

      {(showComparison || showProductInfo || showFoodHistory || showDietPlan) && (
        <div id="ai-results" className="relative mt-8 container mx-auto px-4 max-w-6xl z-10 pb-24">
          <Suspense fallback={aiMode === 'diet' ? <DietPlanSkeleton /> : aiMode === 'comparison' ? <ComparisonSkeleton /> : <InfoSkeleton />}>
            {showComparison && <ComparisonDisplay data={aiResultObj!.comparison as any} />}
            {showProductInfo && <InfoDisplay data={aiResult as any} />}
            {showFoodHistory && <FoodHistoryDisplay data={aiResult as any} />}
            {showDietPlan && <DietPlanDisplay data={aiResult as any} />}
          </Suspense>
        </div>
      )}
    </div>
  );
});

Index.displayName = "Index";
export default Index;
