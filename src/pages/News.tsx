import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ExternalLink, 
  Calendar, 
  User, 
  TrendingUp,
  RefreshCw,
  Newspaper
} from "lucide-react";
import { getHealthSkincareNews, getTrendingNews, searchNews, NewsArticle } from "@/lib/api";
import BackButton from "@/components/BackButton";

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10;

  const loadHealthSkincareNews = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHealthSkincareNews(page, pageSize);
      setArticles(response.articles);
      setTotalResults(response.totalResults || 0);
      setCurrentPage(page);
      
      // Show info message if using fallback data
      if (response.note) {
        console.info('News API:', response.note);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingNews = async () => {
    try {
      const response = await getTrendingNews();
      setTrendingArticles(response.articles);
      
      // Show info message if using fallback data
      if (response.note) {
        console.info('Trending News API:', response.note);
      }
    } catch (err) {
      console.error("Failed to load trending news:", err);
    }
  };

  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      loadHealthSkincareNews(page);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const response = await searchNews(query, page, pageSize);
      setArticles(response.articles);
      setTotalResults(response.totalResults || 0);
      setCurrentPage(page);
      
      // Show info message if using fallback data
      if (response.note) {
        console.info('Search API:', response.note);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search news");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openArticle = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    loadHealthSkincareNews();
    loadTrendingNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <BackButton />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Health & Skincare News
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Stay updated with the latest health and skincare insights
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search Bar */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6">
                  <form onSubmit={handleSearchSubmit} className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search for health and skincare news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={searchLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {searchLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* API Status Notice */}
              <Card className="bg-green-50 border border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Live Medical News</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Fetching real-time medical and healthcare news from News API.
                      </p>
                      <p className="text-xs text-green-600">
                        Showing latest medical research, clinical trials, and healthcare innovations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Card className="bg-red-50 border border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-700">
                      <span className="font-medium">Error:</span>
                      <span>{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Articles */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-20 bg-gray-200 rounded mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {articles.map((article) => (
                    <Card key={article.id} className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-32 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                {article.title}
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openArticle(article.url)}
                                className="ml-4 flex-shrink-0"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {article.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{article.source}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(article.publishedAt)}</span>
                              </div>
                              {article.author && (
                                <div className="flex items-center gap-1">
                                  <span>By {article.author}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalResults > pageSize && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      if (searchQuery) {
                        handleSearch(searchQuery, newPage);
                      } else {
                        loadHealthSkincareNews(newPage);
                      }
                    }}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(totalResults / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      if (searchQuery) {
                        handleSearch(searchQuery, newPage);
                      } else {
                        loadHealthSkincareNews(newPage);
                      }
                    }}
                    disabled={currentPage >= Math.ceil(totalResults / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending News */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trendingArticles.map((article, index) => (
                    <div key={article.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                              onClick={() => openArticle(article.url)}>
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {article.source} • {formatDate(article.publishedAt)}
                          </p>
                        </div>
                      </div>
                      {index < trendingArticles.length - 1 && (
                        <div className="border-b border-gray-100"></div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle>Quick Medical Searches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSearchQuery("");
                      loadHealthSkincareNews(1);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh News
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSearch("skin cancer", 1)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Skin Cancer Research
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSearch("medical AI", 1)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Medical AI
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSearch("clinical trials", 1)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Clinical Trials
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSearch("telemedicine", 1)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Telemedicine
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSearch("dermatology", 1)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Dermatology News
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
