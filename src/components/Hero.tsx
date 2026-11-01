import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from "framer-motion";
import { memo } from "react";

export const Hero = memo(() => {
  return (
    <div className="relative w-full py-8 md:py-12 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full absolute inset-0 overflow-hidden">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={50}
          className="w-full h-full"
          particleColor="hsl(var(--primary))"
          speed={0.5}
        />
      </div>
      
      <div className="relative z-20 text-center px-4 w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="w-full max-w-5xl mx-auto px-4">
            <h1 className="font-pacifico text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none">
              <span 
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent"
                style={{ 
                  filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2)) drop-shadow(0 0 40px hsl(var(--primary)/0.3))" 
                }}
              >
                FoodLens
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-4 text-sm md:text-base font-medium drop-shadow-sm shadow-black/50">By:-Abhishek Samal</p>
        </motion.div>
      </div>
    </div>
  );
});

Hero.displayName = "Hero";
