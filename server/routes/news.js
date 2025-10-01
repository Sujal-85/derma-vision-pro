import express from 'express';
const router = express.Router();

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'ef404fcb178b438b82b78bbf81fe1bba';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Get health and skincare related news
router.get('/health-skincare', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    // Check if API key is configured
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
      // Return mock data if API key is not configured
      const mockArticles = [
        {
          id: 'mock-1',
          title: 'Revolutionary AI Technology in Medical Diagnosis',
          description: 'New artificial intelligence systems are transforming how doctors diagnose skin conditions and other medical issues with unprecedented accuracy.',
          url: 'https://example.com/ai-medical-diagnosis',
          imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date().toISOString(),
          source: 'Medical Technology Today',
          author: 'Dr. Sarah Johnson'
        },
        {
          id: 'mock-2',
          title: 'Breakthrough in Skin Cancer Detection Methods',
          description: 'Researchers develop new non-invasive techniques for early detection of melanoma and other skin cancers using advanced imaging technology.',
          url: 'https://example.com/skin-cancer-detection',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'Oncology Research Journal',
          author: 'Dr. Michael Chen'
        },
        {
          id: 'mock-3',
          title: 'Telemedicine Revolution in Dermatology',
          description: 'How remote consultations are making dermatological care more accessible, especially for patients in rural areas.',
          url: 'https://example.com/telemedicine-dermatology',
          imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: 'Digital Health Weekly',
          author: 'Dr. Emily Rodriguez'
        },
        {
          id: 'mock-4',
          title: 'New Treatment Options for Psoriasis Patients',
          description: 'Latest developments in biologic therapies and their effectiveness in managing severe psoriasis cases.',
          url: 'https://example.com/psoriasis-treatment',
          imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          source: 'Dermatology Today',
          author: 'Dr. James Wilson'
        },
        {
          id: 'mock-5',
          title: 'Precision Medicine in Skin Care',
          description: 'How genetic testing and personalized medicine are revolutionizing treatment approaches for various skin conditions.',
          url: 'https://example.com/precision-medicine-skin',
          imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          source: 'Genomics in Medicine',
          author: 'Dr. Lisa Martinez'
        },
        {
          id: 'mock-6',
          title: 'Medical Device Innovation for Skin Analysis',
          description: 'Cutting-edge devices that use spectroscopy and AI to analyze skin health and detect early signs of disease.',
          url: 'https://example.com/skin-analysis-devices',
          imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 18000000).toISOString(),
          source: 'Medical Device Innovation',
          author: 'Dr. Robert Kim'
        },
        {
          id: 'mock-7',
          title: 'Global Health: Skin Disease Prevention Strategies',
          description: 'International efforts to prevent and treat common skin diseases in developing countries through education and access to care.',
          url: 'https://example.com/global-skin-health',
          imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 21600000).toISOString(),
          source: 'Global Health Initiative',
          author: 'Dr. Maria Santos'
        },
        {
          id: 'mock-8',
          title: 'Clinical Trials: New Hope for Eczema Treatment',
          description: 'Promising results from Phase III clinical trials testing novel therapies for atopic dermatitis and severe eczema.',
          url: 'https://example.com/eczema-clinical-trials',
          imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 25200000).toISOString(),
          source: 'Clinical Research Weekly',
          author: 'Dr. David Thompson'
        }
      ];

      return res.json({
        success: true,
        articles: mockArticles,
        totalResults: mockArticles.length,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        note: 'Using mock data - configure NEWS_API_KEY for real news'
      });
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Fetch news from News API with enhanced medical focus
      // Try multiple medical queries to get comprehensive results
      const medicalQueries = [
        'dermatology OR skin cancer OR melanoma',
        'medical AI OR healthcare technology',
        'clinical trials OR medical research',
        'telemedicine OR digital health',
        'precision medicine OR immunotherapy'
      ];
      
      // Use the first query for now, but we can enhance this to combine results
      const response = await fetch(
        `${NEWS_API_BASE_URL}/everything?` +
        `q=${encodeURIComponent(medicalQueries[0])}&` +
        `language=en&` +
        `sortBy=publishedAt&` +
        `page=${page}&` +
        `pageSize=${pageSize}&` +
        `apiKey=${NEWS_API_KEY}`,
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'DermaVision-Pro/1.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`Health-skincare news API returned ${data.articles?.length || 0} articles`);
      
      // Filter and format the news articles
      const formattedArticles = data.articles
        .filter(article => article.title && article.description)
        .map(article => ({
          id: article.url,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
          publishedAt: article.publishedAt,
          source: article.source.name,
          author: article.author
        }));

      res.json({
        success: true,
        articles: formattedArticles,
        totalResults: data.totalResults,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize)
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - News API is taking too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return mock data as fallback
    const fallbackArticles = [
      {
        id: 'fallback-1',
        title: 'Advanced Medical Imaging in Dermatology',
        description: 'Latest developments in medical imaging technology for early detection and treatment of skin conditions.',
        url: 'https://example.com/medical-imaging-dermatology',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date().toISOString(),
        source: 'Medical Imaging Today',
        author: 'Dr. Emily Watson'
      },
      {
        id: 'fallback-2',
        title: 'Immunotherapy Breakthroughs in Skin Cancer Treatment',
        description: 'Revolutionary immunotherapy treatments showing promising results in advanced melanoma cases.',
        url: 'https://example.com/immunotherapy-skin-cancer',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Oncology Advances',
        author: 'Dr. Robert Kim'
      },
      {
        id: 'fallback-3',
        title: 'Regenerative Medicine for Skin Repair',
        description: 'Cutting-edge stem cell therapies and tissue engineering approaches for treating severe skin damage.',
        url: 'https://example.com/regenerative-medicine-skin',
        imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: 'Regenerative Medicine Journal',
        author: 'Dr. Maria Garcia'
      }
    ];

    res.json({
      success: true,
      articles: fallbackArticles,
      totalResults: fallbackArticles.length,
      currentPage: parseInt(req.query.page || 1),
      pageSize: parseInt(req.query.pageSize || 10),
      note: 'Using fallback data due to API connectivity issues'
    });
  }
});

// Get trending health news
router.get('/trending', async (req, res) => {
  try {
    // Check if API key is configured
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
      // Return mock trending data
      const mockTrending = [
        {
          id: 'trending-1',
          title: 'AI-Powered Medical Diagnosis Revolution',
          description: 'Artificial intelligence is transforming medical diagnosis with 95% accuracy in detecting skin conditions and diseases.',
          url: 'https://example.com/ai-medical-diagnosis-trending',
          imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date().toISOString(),
          source: 'Medical AI Weekly'
        },
        {
          id: 'trending-2',
          title: 'Breakthrough in Skin Cancer Early Detection',
          description: 'New non-invasive screening methods can detect melanoma 6 months earlier than traditional methods.',
          url: 'https://example.com/skin-cancer-early-detection',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 1800000).toISOString(),
          source: 'Cancer Research Today'
        },
        {
          id: 'trending-3',
          title: 'Telemedicine Transforming Healthcare Access',
          description: 'Remote dermatology consultations increase patient access by 300% in rural and underserved areas.',
          url: 'https://example.com/telemedicine-healthcare-access',
          imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'Digital Health Trends'
        },
        {
          id: 'trending-4',
          title: 'Precision Medicine in Dermatology',
          description: 'Genetic testing enables personalized treatment plans with 40% better outcomes for skin conditions.',
          url: 'https://example.com/precision-medicine-dermatology',
          imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 5400000).toISOString(),
          source: 'Genomics Medicine'
        },
        {
          id: 'trending-5',
          title: 'Medical Device Innovation for Skin Analysis',
          description: 'Portable devices using spectroscopy can analyze skin health in real-time with clinical-grade accuracy.',
          url: 'https://example.com/medical-device-skin-analysis',
          imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop&crop=center',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: 'Medical Device Innovation'
        }
      ];

      return res.json({
        success: true,
        articles: mockTrending,
        note: 'Using mock data - configure NEWS_API_KEY for real news'
      });
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      // Try to get health headlines first, then fallback to medical search
      let response = await fetch(
        `${NEWS_API_BASE_URL}/top-headlines?` +
        `category=health&` +
        `language=en&` +
        `pageSize=5&` +
        `apiKey=${NEWS_API_KEY}`,
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'DermaVision-Pro/1.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      // If health category doesn't return enough results, try medical search
      if (!data.articles || data.articles.length < 3) {
        console.log(`Health headlines returned ${data.articles?.length || 0} articles, trying medical search...`);
        
        try {
          const medicalResponse = await fetch(
            `${NEWS_API_BASE_URL}/everything?` +
            `q=medical OR healthcare OR dermatology OR skin cancer&` +
            `language=en&` +
            `sortBy=publishedAt&` +
            `pageSize=5&` +
            `apiKey=${NEWS_API_KEY}`,
            { 
              signal: controller.signal,
              headers: {
                'User-Agent': 'DermaVision-Pro/1.0'
              }
            }
          );
          
          if (medicalResponse.ok) {
            const medicalData = await medicalResponse.json();
            if (medicalData.articles && medicalData.articles.length > 0) {
              console.log(`Medical search returned ${medicalData.articles.length} articles`);
              data.articles = medicalData.articles;
            }
          } else {
            console.log(`Medical search failed with status: ${medicalResponse.status}`);
          }
        } catch (medicalError) {
          console.log('Medical search error:', medicalError.message);
        }
      }
      
      const formattedArticles = data.articles
        .filter(article => article.title && article.description)
        .map(article => ({
          id: article.url,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
          publishedAt: article.publishedAt,
          source: article.source.name
        }));

      res.json({
        success: true,
        articles: formattedArticles
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - News API is taking too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error fetching trending news:', error);
    
    // Return fallback trending data
    const fallbackTrending = [
      {
        id: 'fallback-trending-1',
        title: 'Medical Breakthrough: AI Detects Skin Cancer',
        description: 'Revolutionary AI system achieves 99% accuracy in detecting early-stage melanoma from medical images.',
        url: 'https://example.com/ai-skin-cancer-detection',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date().toISOString(),
        source: 'Medical AI Research'
      },
      {
        id: 'fallback-trending-2',
        title: 'New Treatment Protocol for Severe Eczema',
        description: 'Clinical trials show 80% improvement in severe atopic dermatitis with new biologic therapy.',
        url: 'https://example.com/eczema-biologic-treatment',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        source: 'Dermatology Clinical Trials'
      }
    ];

    res.json({
      success: true,
      articles: fallbackTrending,
      note: 'Using fallback data due to API connectivity issues'
    });
  }
});

// Search news by keyword
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, pageSize = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Check if API key is configured
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
      // Return mock search results
      const mockSearchResults = [
        {
          id: `search-${q}-1`,
          title: `Search Results for "${q}" - Skincare Insights`,
          description: `Discover the latest information about ${q} in the context of skincare and health.`,
          url: `https://example.com/search-${q}`,
          imageUrl: '/placeholder.svg',
          publishedAt: new Date().toISOString(),
          source: 'Health Search Results',
          author: 'Search Bot'
        }
      ];

      return res.json({
        success: true,
        articles: mockSearchResults,
        totalResults: mockSearchResults.length,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        query: q,
        note: 'Using mock data - configure NEWS_API_KEY for real search'
      });
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Enhance search query with medical terms based on the search query
      let enhancedQuery = q;
      
      // If the query doesn't contain medical terms, enhance it
      const medicalTerms = ['medical', 'healthcare', 'dermatology', 'clinical', 'treatment', 'diagnosis', 'research', 'medicine', 'health', 'doctor', 'patient'];
      const hasMedicalTerms = medicalTerms.some(term => q.toLowerCase().includes(term));
      
      if (!hasMedicalTerms) {
        enhancedQuery = `${q} AND (medical OR healthcare OR dermatology OR clinical OR treatment OR diagnosis OR research)`;
      }
      
      const response = await fetch(
        `${NEWS_API_BASE_URL}/everything?` +
        `q=${encodeURIComponent(enhancedQuery)}&` +
        `language=en&` +
        `sortBy=publishedAt&` +
        `page=${page}&` +
        `pageSize=${pageSize}&` +
        `apiKey=${NEWS_API_KEY}`,
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'DermaVision-Pro/1.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      const formattedArticles = data.articles
        .filter(article => article.title && article.description)
        .map(article => ({
          id: article.url,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
          publishedAt: article.publishedAt,
          source: article.source.name,
          author: article.author
        }));

      res.json({
        success: true,
        articles: formattedArticles,
        totalResults: data.totalResults,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        query: q
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - News API is taking too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error searching news:', error);
    
    // Return fallback search results
    const fallbackSearchResults = [
      {
        id: `fallback-search-${req.query.q}-1`,
        title: `Medical Research: "${req.query.q}" in Healthcare`,
        description: `Latest medical research and clinical findings related to ${req.query.q} in dermatology and healthcare.`,
        url: `https://example.com/medical-research-${req.query.q}`,
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date().toISOString(),
        source: 'Medical Research Database',
        author: 'Dr. Research Team'
      },
      {
        id: `fallback-search-${req.query.q}-2`,
        title: `Clinical Studies on "${req.query.q}" Treatment`,
        description: `Comprehensive analysis of clinical trials and treatment protocols for ${req.query.q} in medical practice.`,
        url: `https://example.com/clinical-studies-${req.query.q}`,
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Clinical Research Journal',
        author: 'Dr. Clinical Research'
      }
    ];

    res.json({
      success: true,
      articles: fallbackSearchResults,
      totalResults: fallbackSearchResults.length,
      currentPage: parseInt(req.query.page || 1),
      pageSize: parseInt(req.query.pageSize || 10),
      query: req.query.q,
      note: 'Using fallback data due to API connectivity issues'
    });
  }
});

export default router;
