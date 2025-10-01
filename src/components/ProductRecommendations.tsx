import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Star,
  Heart,
  Filter,
  Search,
  Package,
  Shield,
  Truck
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  benefits: string[];
  ingredients: string[];
  size: string;
  inStock: boolean;
}

interface ProductRecommendationsProps {
  skinConcerns: any[];
  userProfile: any;
  onBack: () => void;
  onNext: () => void;
}

const ProductRecommendations = ({ skinConcerns, userProfile, onBack, onNext }: ProductRecommendationsProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Mock product data based on skin concerns
  const products: Product[] = [
    {
      id: "1",
      name: "Bright Mineral Sunscreen SPF 30",
      brand: "EltaMD",
      price: 35,
      image: "/api/placeholder/300/300",
      rating: 4.8,
      reviews: 1247,
      tags: ["Eye Bags", "Eye Wrinkles", "Deep Wrinkles"],
      description: "Broad-spectrum mineral sunscreen with zinc oxide for sensitive skin",
      benefits: ["UV Protection", "Anti-aging", "Gentle Formula"],
      ingredients: ["Zinc Oxide", "Niacinamide", "Hyaluronic Acid"],
      size: "3.0 oz",
      inStock: true
    },
    {
      id: "2",
      name: "Anti-Pigment Combi Bundle",
      brand: "The Ordinary",
      price: 88,
      originalPrice: 120,
      image: "/api/placeholder/300/300",
      rating: 4.6,
      reviews: 892,
      tags: ["Pigmentation", "Dark Circles", "Redness"],
      description: "Complete anti-pigmentation routine with proven ingredients",
      benefits: ["Brightening", "Even Skin Tone", "Reduces Dark Spots"],
      ingredients: ["Vitamin C", "Alpha Arbutin", "Azelaic Acid"],
      size: "Bundle",
      inStock: true
    },
    {
      id: "3",
      name: "Clean 24-Hr Cream Eyeshadow",
      brand: "Glossier",
      price: 20,
      image: "/api/placeholder/300/300",
      rating: 4.4,
      reviews: 567,
      tags: ["Eye Bags", "Eye Wrinkles", "Acne"],
      description: "Long-wearing cream eyeshadow with skincare benefits",
      benefits: ["Hydrating", "Long-lasting", "Non-comedogenic"],
      ingredients: ["Hyaluronic Acid", "Vitamin E", "Jojoba Oil"],
      size: "0.2 oz",
      inStock: true
    },
    {
      id: "4",
      name: "Anti-Aging Serum with Peptides",
      brand: "Olay",
      price: 125,
      image: "/api/placeholder/300/300",
      rating: 4.7,
      reviews: 2103,
      tags: ["Fine Wrinkles", "Deep Wrinkles"],
      description: "Advanced peptide serum for visible wrinkle reduction",
      benefits: ["Wrinkle Reduction", "Firming", "Hydrating"],
      ingredients: ["Peptides", "Retinol", "Niacinamide"],
      size: "1.0 oz",
      inStock: true
    },
    {
      id: "5",
      name: "Clean Skin Gel Cleanser",
      brand: "CeraVe",
      price: 12,
      image: "/api/placeholder/300/300",
      rating: 4.5,
      reviews: 3456,
      tags: ["Eye Bags", "Eye Wrinkles", "Acne", "Oiliness"],
      description: "Gentle gel cleanser that removes dirt and oil without stripping",
      benefits: ["Gentle Cleansing", "Oil Control", "Non-drying"],
      ingredients: ["Ceramides", "Hyaluronic Acid", "Niacinamide"],
      size: "8.0 oz",
      inStock: true
    },
    {
      id: "6",
      name: "Glowscreen Sunscreen SPF 40",
      brand: "Supergoop!",
      price: 40,
      image: "/api/placeholder/300/300",
      rating: 4.3,
      reviews: 1890,
      tags: ["Eye Bags", "Eye Wrinkles", "Deep Wrinkles"],
      description: "Illuminating sunscreen with blue light protection",
      benefits: ["UV Protection", "Blue Light Protection", "Glowing Finish"],
      ingredients: ["Zinc Oxide", "Red Algae", "Coconut Water"],
      size: "1.7 oz",
      inStock: true
    },
    {
      id: "7",
      name: "Blending Brush Set",
      brand: "Real Techniques",
      price: 25,
      image: "/api/placeholder/300/300",
      rating: 4.6,
      reviews: 743,
      tags: ["Tools"],
      description: "Professional blending brushes for flawless application",
      benefits: ["Professional Quality", "Easy to Clean", "Durable"],
      ingredients: ["Synthetic Bristles", "Aluminum Ferrule"],
      size: "Set of 3",
      inStock: true
    },
    {
      id: "8",
      name: "Active Eye Cream",
      brand: "Kiehl's",
      price: 32,
      originalPrice: 38,
      image: "/api/placeholder/300/300",
      rating: 4.4,
      reviews: 1124,
      tags: ["Eye Wrinkles", "Dark Circles"],
      description: "Intensive eye cream for dark circles and fine lines",
      benefits: ["Dark Circle Reduction", "Anti-aging", "Hydrating"],
      ingredients: ["Caffeine", "Vitamin C", "Hyaluronic Acid"],
      size: "0.5 oz",
      inStock: true
    }
  ];

  const filteredProducts = filterTag 
    ? products.filter(product => product.tags.includes(filterTag))
    : products;

  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getTotalPrice = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0);
    }, 0);
  };

  const getConcernStats = () => {
    const stats = [
      { name: "Fine Wrinkles", percentage: 4, color: "bg-green-500" },
      { name: "Eye Wrinkles", percentage: 16, color: "bg-blue-500" },
      { name: "Deep Wrinkles", percentage: 76, color: "bg-red-500" },
      { name: "Dark Circles", percentage: 2, color: "bg-purple-500" },
      { name: "Eye Bags", percentage: 5, color: "bg-yellow-500" },
      { name: "Pores", percentage: 4, color: "bg-cyan-500" },
      { name: "Pigmentation", percentage: 5, color: "bg-lime-500" },
      { name: "Redness", percentage: 96, color: "bg-orange-500" },
      { name: "Oiliness", percentage: 28, color: "bg-pink-500" }
    ];
    return stats;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Recommended Products</h1>
                <p className="text-muted-foreground">
                  Personalized product recommendations based on your skin analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Skin Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Skin Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getConcernStats().map((stat) => (
                        <div key={stat.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                            <span className="text-sm">{stat.name}</span>
                          </div>
                          <span className="text-sm font-medium">{stat.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Filter by Concern */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filter by Concern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={filterTag === null ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFilterTag(null)}
                      >
                        All Products
                      </Button>
                      {allTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={filterTag === tag ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setFilterTag(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Summary */}
                {selectedProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {selectedProducts.length} products selected
                        </div>
                        <div className="text-lg font-bold">
                          Total: ${getTotalPrice()}
                        </div>
                        <Button className="w-full bg-gradient-primary">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Products That Work For You</h2>
                  <p className="text-muted-foreground">
                    {filteredProducts.length} products found
                  </p>
                </div>
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Routine
                </Button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          Save ${product.originalPrice - product.price}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => toggleProduct(product.id)}
                      >
                        <Heart className={`w-4 h-4 ${
                          selectedProducts.includes(product.id) ? 'fill-red-500 text-red-500' : ''
                        }`} />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                            onClick={() => toggleProduct(product.id)}
                          >
                            {selectedProducts.includes(product.id) ? "Added" : "Add to Cart"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Free shipping over $50</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onBack}>
                Back to Analysis
              </Button>
              <Button onClick={onNext} className="bg-gradient-primary">
                Generate Routine
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;
