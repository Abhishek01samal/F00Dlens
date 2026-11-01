import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Loader2, Package, Utensils, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAI } from "@/services/geminiService";

interface InfoInputProps {
  onAnalyze: (type: 'product' | 'food', query: string, image?: File) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export const InfoInput = memo(({ onAnalyze, isLoading = false, onBack }: InfoInputProps) => {
  const [selectedType, setSelectedType] = useState<'product' | 'food' | null>(null);
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await chatWithAI({
        data: {
          mode: 'autocomplete',
          message: searchQuery,
        },
      });

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && selectedType && !image) {
        searchProducts(query);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedType, image]);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(file);
      setPreview(reader.result as string);
      setQuery("");
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setImage(null);
    setPreview(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedType && (query.trim() || image)) {
      onAnalyze(selectedType, query, image || undefined);
    }
  }, [selectedType, query, image, onAnalyze]);

  const canAnalyze = selectedType && (query.trim() || image);

  // Type selection view
  if (!selectedType) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
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
        
        <h2 className="text-2xl font-bold text-center mb-2">What would you like to analyze?</h2>
        <p className="text-muted-foreground text-center mb-8">Choose between packaged products or traditional foods/dishes</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-8 cursor-pointer hover:border-purple-500/50 transition-all group"
              onClick={() => setSelectedType('product')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Package className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">Product</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze packaged food products - get nutrition facts, ingredients, health score, safety info, and company details
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>• Nutrition & Ingredients</li>
                  <li>• Health Assessment</li>
                  <li>• Safety & Certifications</li>
                  <li>• Company History</li>
                  <li>• Price Comparison</li>
                </ul>
              </div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-8 cursor-pointer hover:border-emerald-500/50 transition-all group"
              onClick={() => setSelectedType('food')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Utensils className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold">Food / Dish</h3>
                <p className="text-sm text-muted-foreground">
                  Discover origin, history, and cultural significance of traditional dishes from around the world
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>• Origin & History</li>
                  <li>• Creator Story</li>
                  <li>• Traditional Recipe</li>
                  <li>• Cultural Significance</li>
                  <li>• Regional Variations</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Input view for selected type
  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => setSelectedType(null)}
        className="mb-4"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Selection
      </Button>
      
      <Card className={`p-6 border-2 ${selectedType === 'product' ? 'border-purple-500/30' : 'border-emerald-500/30'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedType === 'product' ? 'bg-purple-500/10' : 'bg-emerald-500/10'}`}>
            {selectedType === 'product' ? (
              <Package className="h-6 w-6 text-purple-500" />
            ) : (
              <Utensils className="h-6 w-6 text-emerald-500" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {selectedType === 'product' ? 'Analyze Product' : 'Explore Food History'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedType === 'product' 
                ? 'Enter product name or upload package image'
                : 'Enter the name of a dish to discover its origin and story'
              }
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!preview ? (
            <>
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={
                    selectedType === 'product'
                      ? "Type product name (e.g., Maggi, Parle-G, Amul Butter)..."
                      : "Type dish name (e.g., Biryani, Dal Makhani, Samosa)..."
                  }
                  className="w-full text-lg py-6"
                  disabled={isLoading}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-sm"
                          onMouseDown={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {selectedType === 'product' && (
                <>
                  <div className="text-center text-muted-foreground text-sm">OR</div>

                  <Button
                    variant="outline"
                    className="w-full py-6"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Product Package Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </>
              )}
            </>
          ) : (
            <div className="relative">
              <img src={preview} alt="Product" className="w-full h-64 object-cover rounded-lg" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Product package image uploaded</p>
            </div>
          )}
        </div>

        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={!canAnalyze || isLoading}
          className={`w-full mt-6 ${selectedType === 'product' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {selectedType === 'product' ? 'Analyze Product' : 'Explore History'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </Card>
    </div>
  );
});

InfoInput.displayName = "InfoInput";
