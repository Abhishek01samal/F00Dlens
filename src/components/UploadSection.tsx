import { useCallback, useState, memo, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Trash2, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadSectionProps {
  onUpload: (files: File[]) => void;
  uploadedImages: string[];
  onClearHistory: () => void;
  isAnalyzing?: boolean;
}

const COLLAPSED_HEIGHT = 72;
const EXPANDED_HEIGHT = 480;

export const UploadSection = memo(({ onUpload, uploadedImages, onClearHistory, isAnalyzing }: UploadSectionProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 10));
    if (acceptedFiles.length > 0) {
      setIsExpanded(true);
    }
  }, []);

  const dropzoneConfig = useMemo(() => ({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 10,
  }), []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...dropzoneConfig,
  });

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setIsExpanded(false);
      }
      return newFiles;
    });
  }, []);

  const handleAnalyze = useCallback(() => {
    if (files.length > 0) {
      onUpload(files);
    }
  }, [files, onUpload]);

  const handleClearHistory = useCallback(() => {
    setFiles([]);
    setIsExpanded(false);
    onClearHistory();
  }, [onClearHistory]);

  const previewUrls = useMemo(() => 
    files.map(file => URL.createObjectURL(file)), 
    [files]
  );

  return (
    <section className="py-12 px-4 flex items-center justify-center">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>
      
      <motion.div
        layout
        className={cn(
          "w-full max-w-2xl rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden",
          isDragActive && "animate-pulse-ring"
        )}
        animate={{ height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      >
        <div {...getRootProps()} className="h-full flex flex-col">
          <input {...getInputProps()} />
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground drop-shadow-sm">
                  {files.length > 0 ? `${files.length} image(s) selected` : "Upload Images"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDragActive ? "Drop images here..." : "Drag & drop or click to select"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handleClearHistory(); }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  >
                    <ChevronUp className={cn("w-4 h-4 transition-transform", !isExpanded && "rotate-180")} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-4 overflow-auto flex flex-col justify-between"
              >
                {/* Drop Zone with Images Inside */}
                <div className={cn(
                  "border-2 border-dashed rounded-xl p-4 text-center transition-colors flex-1 flex flex-col justify-center items-center min-h-[200px]",
                  isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                )}>
                  {previewUrls.length > 0 ? (
                    <div className="w-full space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto p-1">
                        {previewUrls.map((url, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative aspect-square rounded-lg overflow-hidden bg-muted group border border-border shadow-sm"
                          >
                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        ))}
                        {files.length < 10 && (
                          <div className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/60 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50">
                            <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground font-medium">Add More</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isDragActive ? "Drop images to add" : "Click or drag & drop to add more images (Max 10)"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-foreground mb-2 drop-shadow-sm font-medium">
                        {isDragActive ? "Drop images here" : "Drag & drop images here"}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 drop-shadow-sm">or click to browse</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG, WEBP • Max 10 images
                      </p>
                    </div>
                  )}
                </div>

                {/* Analyze Button — No Star */}
                {files.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      size="lg"
                      onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                      disabled={isAnalyzing}
                      className="px-8 font-semibold text-base shadow-md"
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Images"}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
});

UploadSection.displayName = "UploadSection";
