import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Upload, X, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAI } from "@/services/geminiService";

interface ComparisonInputProps {
  onCompare: (productA: string, productB: string, imageA?: File, imageB?: File) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export const ComparisonInput = memo(({ onCompare, isLoading = false, onBack }: ComparisonInputProps) => {
  const [productA, setProductA] = useState("");
  const [productB, setProductB] = useState("");
  const [imageA, setImageA] = useState<File | null>(null);
  const [imageB, setImageB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [suggestionsA, setSuggestionsA] = useState<string[]>([]);
  const [suggestionsB, setSuggestionsB] = useState<string[]>([]);
  const [showSuggestionsA, setShowSuggestionsA] = useState(false);
  const [showSuggestionsB, setShowSuggestionsB] = useState(false);
  const [isSearchingA, setIsSearchingA] = useState(false);
  const [isSearchingB, setIsSearchingB] = useState(false);

  const inputRefA = useRef<HTMLInputElement>(null);
  const inputRefB = useRef<HTMLInputElement>(null);
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const searchProducts = useCallback(async (query: string, setResults: (results: string[]) => void, setSearching: (val: boolean) => void) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const data = await chatWithAI({
        data: {
          mode: 'autocomplete',
          message: query,
        },
      });

      if (data?.suggestions) {
        setResults(data.suggestions);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productA && !imageA) {
        searchProducts(productA, setSuggestionsA, setIsSearchingA);
      } else {
        setSuggestionsA([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productA, imageA]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productB && !imageB) {
        searchProducts(productB, setSuggestionsB, setIsSearchingB);
      } else {
        setSuggestionsB([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productB, imageB]);

  const handleImageUpload = useCallback((file: File, side: 'A' | 'B') => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'A') {
        setImageA(file);
        setPreviewA(reader.result as string);
        setProductA("");
      } else {
        setImageB(file);
        setPreviewB(reader.result as string);
        setProductB("");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback((side: 'A' | 'B') => {
    if (side === 'A') {
      setImageA(null);
      setPreviewA(null);
    } else {
      setImageB(null);
      setPreviewB(null);
    }
  }, []);

  const handleCompare = useCallback(() => {
    if ((productA || imageA) && (productB || imageB)) {
      onCompare(productA, productB, imageA || undefined, imageB || undefined);
    }
  }, [productA, productB, imageA, imageB, onCompare]);

  const canCompare = (productA.trim() || imageA) && (productB.trim() || imageB);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Main
        </Button>
      )}
      
      <h2 className="text-2xl font-bold text-center mb-6">Compare Two Products</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Product A Panel */}
        <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-primary/20">
          <h3 className="text-lg font-semibold text-foreground">Product A</h3>
          
          {!previewA ? (
            <>
              <div className="relative">
                <Input
                  ref={inputRefA}
                  value={productA}
                  onChange={(e) => {
                    setProductA(e.target.value);
                    setShowSuggestionsA(true);
                  }}
                  onFocus={() => setShowSuggestionsA(true)}
                  onBlur={() => setTimeout(() => setShowSuggestionsA(false), 200)}
                  placeholder="Type product name (e.g., Maggi, Lays, Parle-G)..."
                  className="w-full"
                  disabled={isLoading}
                />
                {isSearchingA && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                
                <AnimatePresence>
                  {showSuggestionsA && suggestionsA.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {suggestionsA.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-sm"
                          onMouseDown={() => {
                            setProductA(suggestion);
                            setShowSuggestionsA(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-center text-muted-foreground text-sm">OR</div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRefA.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Product Image
              </Button>
              <input
                ref={fileInputRefA}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'A')}
              />
            </>
          ) : (
            <div className="relative">
              <img src={previewA} alt="Product A" className="w-full h-48 object-cover rounded-lg" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeImage('A')}
              >
                <X className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Front package photo uploaded</p>
            </div>
          )}
        </Card>

        {/* VS Divider */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg">
            VS
          </div>
        </div>

        {/* Product B Panel */}
        <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-primary/20">
          <h3 className="text-lg font-semibold text-foreground">Product B</h3>
          
          {!previewB ? (
            <>
              <div className="relative">
                <Input
                  ref={inputRefB}
                  value={productB}
                  onChange={(e) => {
                    setProductB(e.target.value);
                    setShowSuggestionsB(true);
                  }}
                  onFocus={() => setShowSuggestionsB(true)}
                  onBlur={() => setTimeout(() => setShowSuggestionsB(false), 200)}
                  placeholder="Type product name (e.g., Yippee, Kurkure, Britannia)..."
                  className="w-full"
                  disabled={isLoading}
                />
                {isSearchingB && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                
                <AnimatePresence>
                  {showSuggestionsB && suggestionsB.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {suggestionsB.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-sm"
                          onMouseDown={() => {
                            setProductB(suggestion);
                            setShowSuggestionsB(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-center text-muted-foreground text-sm">OR</div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRefB.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Product Image
              </Button>
              <input
                ref={fileInputRefB}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'B')}
              />
            </>
          ) : (
            <div className="relative">
              <img src={previewB} alt="Product B" className="w-full h-48 object-cover rounded-lg" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeImage('B')}
              >
                <X className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Front package photo uploaded</p>
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={!canCompare || isLoading}
          className="px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing & Comparing...
            </>
          ) : (
            <>
              Compare Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

ComparisonInput.displayName = "ComparisonInput";
