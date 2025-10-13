import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Resolve project root .env explicitly so env vars are available even when server starts from different CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/medical';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|dcm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, PNG, and DICOM files are allowed'));
    }
  }
});

// API Keys and Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
// Read OpenRouter API key per-request to avoid stale values.
// Mock mode for chat is deprecated: require a valid key for real LLM responses.

// Medical AI System Prompt
const MEDICAL_AI_PROMPT = `You are Dr. Sarah, an advanced AI medical assistant with comprehensive knowledge of medicine, healthcare, and medical imaging. You specialize in:

MEDICAL EXPERTISE:
- Medical image analysis (X-rays, MRI, CT scans, skin conditions)
- PDF medical report interpretation
- Patient history analysis and synthesis
- Medical terminology and diagnosis support
- Treatment recommendations and follow-up care

CAPABILITIES:
- Analyze medical images for abnormalities, conditions, and patterns
- Extract and interpret information from medical PDFs and reports
- Provide structured medical summaries
- Identify potential health concerns and recommend next steps
- Maintain comprehensive patient medical history

IMPORTANT GUIDELINES:
1. Always emphasize that you are an AI assistant and cannot replace professional medical diagnosis
2. For serious findings, always recommend immediate consultation with healthcare professionals
3. Provide detailed explanations of medical terms and conditions
4. Be thorough in your analysis while maintaining clarity
5. Focus on patient safety and appropriate medical care escalation
6. Maintain patient privacy and confidentiality

RESPONSE FORMAT:
- Use **markdown formatting** for better readability
- Structure responses with **headers** (# ## ###)
- Use **bullet points** (-) and **numbered lists** (1. 2. 3.)
- Highlight important information with **bold text**
- Use \`inline code\` for medical terms and measurements
- Include code blocks for structured data when relevant
- Use > blockquotes for important warnings or notes
- Separate sections with --- horizontal rules
- Provide structured analysis with clear sections
- Use medical terminology appropriately with explanations
- Include confidence levels for findings
- Suggest next steps and follow-up actions
- Ask clarifying questions when needed

Remember: You are a supportive medical AI that enhances healthcare delivery while maintaining appropriate boundaries.`;

// Sample medical questions
const MEDICAL_SAMPLE_QUESTIONS = [
  "Analyze this X-ray for any abnormalities",
  "What does this blood test report indicate?",
  "Review my medical history and suggest follow-up care",
  "What are the symptoms of diabetes I should watch for?",
  "How can I improve my sleep quality naturally?",
  "What's the difference between a cold and the flu?",
  "How often should I get a health checkup?",
  "What are some simple exercises I can do at home?",
  "How can I manage stress and anxiety?",
  "What foods should I eat for better heart health?",
  "How do I know if my child's fever needs medical attention?",
  "What are the benefits of regular exercise?",
  "How can I boost my immune system naturally?",
  "What are the early signs of skin cancer?",
  "How to read and understand my lab results?"
];

// PDF Text Extraction
async function extractPDFText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    // Defer importing pdf-parse to avoid module-load side effects
    const { default: pdfParse } = await import('pdf-parse');
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Image preprocessing for medical analysis
async function preprocessImage(filePath) {
  try {
    const processedPath = filePath.replace(/\.[^/.]+$/, '_processed.jpg');
    await sharp(filePath)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(processedPath);
    return processedPath;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return filePath; // Return original if processing fails
  }
}

// Convert image to base64 for API calls
function imageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
}

// Analyze medical image using Hugging Face models
async function analyzeMedicalImage(imageBase64, imageType = 'general') {
  try {
    let modelEndpoint;
    
    // Select appropriate model based on image type
    switch (imageType.toLowerCase()) {
      case 'xray':
      case 'chest':
        modelEndpoint = 'microsoft/resnet-50';
        break;
      case 'skin':
      case 'dermatology':
        modelEndpoint = 'microsoft/resnet-50'; // Can be replaced with skin-specific model
        break;
      case 'mri':
      case 'ct':
        modelEndpoint = 'microsoft/resnet-50';
        break;
      default:
        modelEndpoint = 'microsoft/resnet-50';
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${modelEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `data:image/jpeg;base64,${imageBase64}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing medical image:', error);
    throw error;
  }
}

// Analyze using Google Gemini (multimodal)
async function analyzeWithGemini(imageBase64, textPrompt = '') {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: textPrompt || 'Analyze this medical image and provide detailed findings, potential conditions, and recommendations.' },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error with Gemini analysis:', error);
    throw error;
  }
}

// Extract structured medical information from text
function extractMedicalInfo(text) {
  const medicalInfo = {
    diagnoses: [],
    medications: [],
    allergies: [],
    symptoms: [],
    vitalSigns: {},
    labResults: {},
    procedures: [],
    recommendations: []
  };

  // Simple regex patterns for medical information extraction
  const patterns = {
    diagnoses: /(?:diagnosis|diagnosed with|condition):\s*([^.\n]+)/gi,
    medications: /(?:medication|medicine|drug|prescribed):\s*([^.\n]+)/gi,
    allergies: /(?:allergy|allergic to):\s*([^.\n]+)/gi,
    symptoms: /(?:symptom|complaint|presents with):\s*([^.\n]+)/gi,
    bloodPressure: /(?:blood pressure|bp):\s*(\d+\/\d+)/gi,
    heartRate: /(?:heart rate|pulse|hr):\s*(\d+)/gi,
    temperature: /(?:temperature|temp|fever):\s*(\d+\.?\d*)/gi,
    weight: /(?:weight):\s*(\d+\.?\d*)/gi,
    height: /(?:height):\s*(\d+\.?\d*)/gi
  };

  // Extract information using patterns
  Object.entries(patterns).forEach(([key, pattern]) => {
    const matches = text.match(pattern);
    if (matches) {
      if (key.includes('vital') || key === 'bloodPressure' || key === 'heartRate' || key === 'temperature' || key === 'weight' || key === 'height') {
        medicalInfo.vitalSigns[key] = matches[0];
      } else {
        medicalInfo[key] = matches.map(match => match.replace(/^[^:]+:\s*/, ''));
      }
    }
  });

  return medicalInfo;
}

// Route to get sample questions
router.get('/sample-questions', (req, res) => {
  res.json({
    success: true,
    questions: MEDICAL_SAMPLE_QUESTIONS
  });
});
// Health status for Medical AI
router.get('/health', (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const hasKey = !!(apiKey && apiKey !== 'your_openrouter_api_key_here' && apiKey.startsWith('sk-or-v1-'));
  res.json({
    success: true,
    nodeVersion: process.version,
    fetchAvailable: typeof fetch === 'function',
    hasOpenRouterKey: hasKey,
    routes: { chat: true, upload: true, sampleQuestions: true, health: true }
  });
});

// Route to upload and analyze files
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    let analysisResult = {};

    if (fileType === 'application/pdf') {
      // PDF Analysis
      const extractedText = await extractPDFText(filePath);
      const medicalInfo = extractMedicalInfo(extractedText);
      
      analysisResult = {
        type: 'pdf',
        extractedText: extractedText.substring(0, 2000), // Limit for response
        fullText: extractedText,
        medicalInfo: medicalInfo,
        fileName: fileName,
        fileSize: fileSize
      };

    } else if (fileType.startsWith('image/')) {
      // Image Analysis
      const processedImagePath = await preprocessImage(filePath);
      const imageBase64 = imageToBase64(processedImagePath);
      
      let imageAnalysis = {};
      let geminiAnalysis = '';

      try {
        // Try Hugging Face analysis first
        if (HUGGINGFACE_API_KEY) {
          imageAnalysis = await analyzeMedicalImage(imageBase64, 'general');
        }
      } catch (error) {
        console.log('Hugging Face analysis failed, trying Gemini:', error.message);
      }

      try {
        // Try Gemini analysis
        if (GEMINI_API_KEY) {
          geminiAnalysis = await analyzeWithGemini(imageBase64, 'Analyze this medical image for any abnormalities, conditions, or findings. Provide detailed medical insights.');
        }
      } catch (error) {
        console.log('Gemini analysis failed:', error.message);
      }

      analysisResult = {
        type: 'image',
        fileName: fileName,
        fileSize: fileSize,
        imageAnalysis: imageAnalysis,
        geminiAnalysis: geminiAnalysis,
        recommendations: generateImageRecommendations(imageAnalysis, geminiAnalysis)
      };

      // Clean up processed image
      if (processedImagePath !== filePath) {
        fs.unlinkSync(processedImagePath);
      }
    }

    // Clean up uploaded file after processing
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      result: analysisResult
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process file'
    });
  }
});

// Generate recommendations based on image analysis
function generateImageRecommendations(hfAnalysis, geminiAnalysis) {
  const recommendations = [];

  if (geminiAnalysis) {
    recommendations.push({
      source: 'Gemini AI',
      analysis: geminiAnalysis,
      confidence: 'High'
    });
  }

  if (hfAnalysis && hfAnalysis.length > 0) {
    recommendations.push({
      source: 'Hugging Face AI',
      analysis: hfAnalysis,
      confidence: 'Medium'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      source: 'General Medical Advice',
      analysis: 'Image analysis completed. Please consult with a healthcare professional for detailed interpretation.',
      confidence: 'Low'
    });
  }

  return recommendations;
}

// Route to handle medical AI chat with context
router.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory = [], userId, medicalContext = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Require a valid OpenRouter API key for real LLM responses
    const apiKey = process.env.OPENROUTER_API_KEY;
    const isApiKeyConfigured = apiKey &&
                               apiKey !== 'your_openrouter_api_key_here' &&
                               apiKey.startsWith('sk-or-v1-');
    if (!isApiKeyConfigured) {
      console.log('OpenRouter API key not configured or invalid.');
      return res.status(401).json({
        success: false,
        error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in your .env.'
      });
    }

    // Prepare the conversation context
    const messages = [
      {
        role: 'system',
        content: MEDICAL_AI_PROMPT
      }
    ];

    // Add medical context if available
    if (medicalContext && Object.keys(medicalContext).length > 0) {
      const contextMessage = `MEDICAL CONTEXT:
${JSON.stringify(medicalContext, null, 2)}

Please consider this medical context when providing responses.`;
      
      messages.push({
        role: 'system',
        content: contextMessage
      });
    }

    // Add chat history for context
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.slice(-10).forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Try working models with proper fallbacks
      const models = [
        'google/gemini-pro',
        'openai/gpt-3.5-turbo',
        'meta-llama/llama-3.1-8b-instruct:free'
      ];
      
      let response;
      let lastError;
      
      for (const model of models) {
        try {
          console.log(`Making OpenRouter API call with model: ${model}`);
          
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://derma-vision-pro.com',
              'X-Title': 'DermaVision Pro Medical AI'
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              max_tokens: model.includes('free') ? 500 : 1000,
              temperature: 0.7,
              top_p: 0.9,
              frequency_penalty: 0.1,
              presence_penalty: 0.1
            }),
            signal: controller.signal
          });
          
          if (response.ok) {
            console.log(`Successfully used model: ${model}`);
            break;
          } else {
            const errorData = await response.text();
            console.log(`Model ${model} failed with status ${response.status}: ${errorData}`);
            lastError = new Error(`Model ${model} failed: ${response.status}`);
            continue;
          }
        } catch (modelError) {
          console.log(`Model ${model} error:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All models failed');
      }

      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      const assistantResponse = data.choices[0].message.content;

      res.json({
        success: true,
        response: assistantResponse
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - API is taking too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in medical AI chat:', error);
    return res.status(502).json({
      success: false,
      error: error.message || 'Failed to get response from LLM provider'
    });
  }
});

// Generate mock medical response
function generateMockMedicalResponse(message, medicalContext) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('xray') || lowerMessage.includes('chest')) {
    return `🔍 **X-Ray Analysis (Mock Response)**

Based on the image analysis, here are my observations:

**Findings:**
• Lung fields appear clear bilaterally
• Heart size appears normal
• No obvious fractures or abnormalities detected
• Soft tissues appear unremarkable

**Recommendations:**
• Continue monitoring if symptoms persist
• Consider follow-up imaging if symptoms worsen
• Consult with a radiologist for detailed interpretation

⚠️ **Important**: This is a mock analysis. For accurate medical interpretation, please consult with a qualified radiologist or healthcare provider.

**Next Steps:**
• Schedule follow-up with your primary care physician
• Discuss any symptoms or concerns
• Consider additional imaging if recommended by your doctor`;
  }
  
  if (lowerMessage.includes('blood test') || lowerMessage.includes('lab')) {
    return `🧪 **Blood Test Analysis (Mock Response)**

Here's a general interpretation of common blood test parameters:

**Complete Blood Count (CBC):**
• White Blood Cells: Monitor for infection
• Red Blood Cells: Check for anemia
• Platelets: Assess clotting function

**Basic Metabolic Panel:**
• Glucose: Diabetes screening
• Electrolytes: Kidney and heart function
• Kidney function markers

**Recommendations:**
• Review results with your healthcare provider
• Discuss any abnormal values
• Consider lifestyle modifications if needed

⚠️ **Important**: Blood test interpretation requires clinical context. Please discuss your specific results with your doctor.`;
  }
  
  // Default medical response
  return `🏥 **Dr. Sarah - Medical AI Assistant**

Hello! I'm Dr. Sarah, your advanced medical AI assistant. I'm here to help with:

**My Capabilities:**
• Medical image analysis (X-rays, MRI, skin conditions)
• PDF medical report interpretation
• Patient history analysis
• Medical terminology explanations
• Treatment recommendations

**How I can help:**
• Upload medical images for analysis
• Share PDF reports for interpretation
• Ask medical questions
• Review your health history

**Important Reminder:**
I'm an AI assistant designed to support healthcare decisions. I cannot replace professional medical diagnosis or treatment. Always consult with qualified healthcare providers for medical decisions.

What medical question or concern can I help you with today?`;
}

// Generate fallback medical response
function generateFallbackMedicalResponse(message) {
  return `# 🏥 Technical Difficulties

I apologize, but I'm experiencing technical difficulties with the AI service right now.

## **What happened:**
- The medical AI service is temporarily unavailable
- This could be due to API configuration or network issues

## **What you can do:**
- Try asking your question again in a few moments
- For urgent medical concerns, contact your healthcare provider immediately
- Upload medical files when the service is restored

## **General Medical Guidance:**
- Don't ignore persistent or severe symptoms
- Keep up with regular health checkups
- Maintain a healthy lifestyle
- Follow your doctor's recommendations

---

> **Important**: I'm an AI medical assistant providing general guidance. For proper medical diagnosis and treatment, please consult with healthcare professionals.

Please try again later, and remember - your health and safety are the top priority! ❤️`;
}

export default router;
