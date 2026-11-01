import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Calendar, BookOpen, Globe, Sparkles, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FoodHistoryData {
  dishName: string;
  origin: {
    country: string;
    region: string;
    century: string;
  };
  creator: {
    who: string;
    why: string;
  };
  story: string;
  authenticIngredients: string[];
  popularCities: string[];
  culturalSignificance: string;
  variations: string[];
  funFacts: string[];
  cityImages?: { city: string; imageUrl: string }[];
}

// City image gallery with famous landmark images
const cityImageMap: Record<string, string> = {
  "kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800",
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
  "mumbai": "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800",
  "chennai": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
  "hyderabad": "https://images.unsplash.com/photo-1626014305289-8e3e7f9c0e0c?w=800",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
  "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
  "lucknow": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
  "amritsar": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
  "bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
  "udaipur": "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800",
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
  "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
  "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
  "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
};

const getCityImage = (city: string): string => {
  const lowerCity = city.toLowerCase();
  for (const [key, url] of Object.entries(cityImageMap)) {
    if (lowerCity.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800";
};

export const FoodHistoryDisplay = memo(({ data }: { data: FoodHistoryData }) => {
  return (
    <div className="space-y-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
          <h2 className="text-3xl font-bold text-foreground mb-2">{data.dishName}</h2>
          <p className="text-muted-foreground">Complete Origin & History Profile</p>
        </Card>
      </motion.div>

      {/* Origin Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Origin Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Country</div>
              <div className="font-medium">{data.origin.country}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Region/City</div>
              <div className="font-medium">{data.origin.region}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Time Period</div>
              <div className="font-medium">{data.origin.century}</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Creator Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Creator Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Who Created It</div>
              <div className="font-medium">{data.creator.who}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Why It Was Created</div>
              <div>{data.creator.why}</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Story Behind the Dish */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Story Behind the Dish</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{data.story}</p>
        </Card>
      </motion.div>

      {/* Authentic Ingredients */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Traditional Ingredients</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.authenticIngredients.map((ingredient, idx) => (
              <Badge key={idx} variant="outline" className="bg-primary/10 border-primary/30">
                {ingredient}
              </Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Popular Cities with Images */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Famous In These Cities</h3>
          </div>
          
          {/* City Image Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {data.popularCities.slice(0, 4).map((city, idx) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="relative group overflow-hidden rounded-lg aspect-[4/3]"
              >
                <img
                  src={getCityImage(city)}
                  alt={city}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white font-medium text-sm">{city}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {data.popularCities.map((city, idx) => (
              <Badge key={idx} variant="secondary">{city}</Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Cultural Significance */}
      {data.culturalSignificance && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Cultural & Modern Significance</h3>
            <p className="text-muted-foreground">{data.culturalSignificance}</p>
          </Card>
        </motion.div>
      )}

      {/* Variations */}
      {data.variations?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Regional Variations</h3>
            <ul className="space-y-2">
              {data.variations.map((variation, idx) => (
                <li key={idx} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {typeof variation === 'string' ? variation : (variation as any)?.name || (variation as any)?.description || JSON.stringify(variation)}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* Fun Facts */}
      {data.funFacts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Fun Facts</h3>
            </div>
            <ul className="space-y-2">
              {data.funFacts.map((fact, idx) => (
                <li key={idx} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-500">✨</span>
                  {typeof fact === 'string' ? fact : (fact as any)?.name || (fact as any)?.description || JSON.stringify(fact)}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}
    </div>
  );
});

FoodHistoryDisplay.displayName = "FoodHistoryDisplay";
