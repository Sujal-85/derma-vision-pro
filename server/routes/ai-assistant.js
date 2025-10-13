import express from 'express';
// Using global fetch from Node 18+
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Family Doctor AI Assistant system prompt
const FAMILY_DOCTOR_PROMPT = `You are Dr. Sarah, a warm, friendly, and experienced family doctor with over 20 years of experience. You have a caring, approachable personality that makes patients feel comfortable and heard.

PERSONALITY TRAITS:
- Warm and empathetic, like a trusted family friend
- Patient and understanding, never rushing conversations
- Encouraging and supportive, always looking for the positive
- Professional but not intimidating
- Uses simple, clear language that everyone can understand
- Asks thoughtful follow-up questions to better understand concerns
- Remembers context from previous conversations

COMMUNICATION STYLE:
- Address patients by name when possible
- Use "we" language to show partnership in their health journey
- Provide reassurance while being honest about medical facts
- Use analogies and simple explanations for complex medical concepts
- Show genuine concern and care in your responses
- Be encouraging about healthy lifestyle choices

MEDICAL APPROACH:
- Focus on prevention and wellness, not just treatment
- Consider the whole person - physical, mental, and emotional health
- Provide practical, actionable advice
- Always emphasize when professional medical care is needed
- Respect patient autonomy and choices
- Maintain appropriate medical boundaries

RESPONSE FORMAT:
- Use **markdown formatting** for better readability
- Structure responses with **headers** (# ## ###)
- Use **bullet points** (-) and **numbered lists** (1. 2. 3.)
- Highlight important information with **bold text**
- Use \`inline code\` for medical terms and measurements
- Use > blockquotes for important tips or warnings
- Separate sections with --- horizontal rules
- Start with a warm greeting or acknowledgment
- Use emojis sparingly but effectively (❤️, 🤗, 💪, 🌟)
- Break down complex information into digestible parts
- End with encouragement or next steps
- Ask follow-up questions to show continued care

Remember: You're not just providing medical information - you're being a caring, supportive presence in their health journey. Be the doctor everyone wishes they had.`;

// Sample questions for the AI Assistant
const SAMPLE_QUESTIONS = [
  "What are the early signs of diabetes I should watch for?",
  "How can I improve my sleep quality naturally?",
  "What's the difference between a cold and the flu?",
  "How often should I get a health checkup?",
  "What are some simple exercises I can do at home?",
  "How can I manage stress and anxiety?",
  "What foods should I eat for better heart health?",
  "How do I know if my child's fever needs medical attention?",
  "What are the benefits of regular exercise?",
  "How can I boost my immune system naturally?"
];

// Auto-correction dictionary for common medical terms
const AUTO_CORRECT_DICT = {
  'diabetis': 'diabetes',
  'hypertention': 'hypertension',
  'cholestrol': 'cholesterol',
  'arthritus': 'arthritis',
  'bronchitus': 'bronchitis',
  'pneumonia': 'pneumonia',
  'migrane': 'migraine',
  'alergi': 'allergy',
  'alergies': 'allergies',
  'asthma': 'asthma',
  'depresion': 'depression',
  'anxity': 'anxiety',
  'insomnia': 'insomnia',
  'fatigue': 'fatigue',
  'nausea': 'nausea',
  'dizziness': 'dizziness',
  'headache': 'headache',
  'fever': 'fever',
  'cough': 'cough',
  'sore throat': 'sore throat'
};

// Auto-completion suggestions
const AUTO_COMPLETE_SUGGESTIONS = [
  "What are the symptoms of",
  "How to treat",
  "What causes",
  "How to prevent",
  "When to see a doctor for",
  "Natural remedies for",
  "Side effects of",
  "How long does",
  "Is it normal to",
  "What should I do if"
];

// Function to auto-correct medical terms
function autoCorrectText(text) {
  let correctedText = text.toLowerCase();
  
  Object.entries(AUTO_CORRECT_DICT).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    correctedText = correctedText.replace(regex, correct);
  });
  
  return correctedText;
}

// Function to get auto-completion suggestions
function getAutoCompleteSuggestions(text) {
  if (!text || text.length < 2) return [];
  
  const lowerText = text.toLowerCase();
  return AUTO_COMPLETE_SUGGESTIONS
    .filter(suggestion => suggestion.toLowerCase().includes(lowerText))
    .slice(0, 5);
}

// Route to get sample questions
router.get('/sample-questions', (req, res) => {
  res.json({
    success: true,
    questions: SAMPLE_QUESTIONS
  });
});

// Route to get auto-completion suggestions
router.post('/auto-complete', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const suggestions = getAutoCompleteSuggestions(text);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error in auto-complete:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Route to auto-correct text
router.post('/auto-correct', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const correctedText = autoCorrectText(text);
    
    res.json({
      success: true,
      originalText: text,
      correctedText,
      hasCorrections: text.toLowerCase() !== correctedText
    });
  } catch (error) {
    console.error('Error in auto-correct:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Route to handle AI Assistant chat
router.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory = [], userId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Auto-correct the message
    const correctedMessage = autoCorrectText(message);
    
    // Check if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    const isApiKeyConfigured = apiKey && 
                               apiKey !== 'your_openrouter_api_key_here' && 
                               apiKey.startsWith('sk-or-v1-');
    
    console.log('OpenRouter API Key configured:', isApiKeyConfigured);
    
    if (!isApiKeyConfigured) {
      console.log('Using mock response - API key not configured');
      // Return mock response if API key is not configured
      const mockResponse = generateMockResponse(correctedMessage, chatHistory);
      return res.json({
        success: true,
        response: mockResponse,
        correctedMessage: correctedMessage !== message ? correctedMessage : null
      });
    }

    // Prepare the conversation context
    const messages = [
      {
        role: 'system',
        content: FAMILY_DOCTOR_PROMPT
      }
    ];

    // Add chat history for context (last 10 messages)
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
      content: correctedMessage
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Try premium model first, fallback to free model if needed
      const models = [
        'google/gemini-pro', // High-quality model with excellent medical knowledge
        'openai/gpt-3.5-turbo', // Reliable fallback model
        'meta-llama/llama-3.1-8b-instruct:free' // Free fallback model
      ];
      
      let response;
      let lastError;
      
      for (const model of models) {
        try {
          console.log(`Making OpenRouter API call with model: ${model}`);
          console.log('Message count:', messages.length);
          
          response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://derma-vision-pro.com',
              'X-Title': 'DermaVision Pro AI Assistant'
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              max_tokens: model.includes('free') ? 500 : 1000,
              temperature: 0.8, // Slightly higher for more personality
              top_p: 0.9,
              frequency_penalty: 0.1,
              presence_penalty: 0.1
            }),
            signal: controller.signal
          });
          
          if (response.ok) {
            console.log(`Successfully used model: ${model}`);
            break; // Success, exit the loop
          } else {
            const errorData = await response.text();
            console.log(`Model ${model} failed with status ${response.status}: ${errorData}`);
            lastError = new Error(`Model ${model} failed: ${response.status}`);
            continue; // Try next model
          }
        } catch (modelError) {
          console.log(`Model ${model} error:`, modelError.message);
          lastError = modelError;
          continue; // Try next model
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All models failed');
      }

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('OpenRouter API response received successfully');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      const assistantResponse = data.choices[0].message.content;

      res.json({
        success: true,
        response: assistantResponse,
        correctedMessage: correctedMessage !== message ? correctedMessage : null
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - OpenRouter API is taking too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in AI Assistant:', error);
    
    // Return fallback response
    const fallbackResponse = generateFallbackResponse(req.body.message);
    
    res.json({
      success: true,
      response: fallbackResponse,
      correctedMessage: null
    });
  }
});

// Generate mock response when API key is not configured
function generateMockResponse(message, chatHistory) {
  const lowerMessage = message.toLowerCase();
  
  // Check for common medical topics and provide helpful responses
  if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
    return `🤗 Hello there! I'm Dr. Sarah, and I'm here to help you with your headache concern.

I understand that headaches can be quite bothersome. Let me share some gentle guidance:

**What might be causing your headache:**
• Dehydration (very common!)
• Stress or tension
• Lack of sleep
• Eye strain from screens
• Caffeine withdrawal

**Gentle approaches to try:**
• Drink plenty of water throughout the day
• Take breaks from screens every 20-30 minutes
• Practice some gentle neck and shoulder stretches
• Try a cool compress on your forehead
• Get some fresh air if possible

**When to see me or another healthcare provider:**
• If the headache is severe or sudden
• If you have fever, vision changes, or neck stiffness
• If headaches are becoming frequent or interfering with your daily life

Remember, I'm here to support you on your health journey. How are you feeling overall today? Any other symptoms I should know about? ❤️`;
  }
  
  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
    return `🌟 Good evening! Sleep is so important for our overall health, and I'm glad you're thinking about improving yours.

**Creating a peaceful bedtime routine:**
• Try to go to bed and wake up at the same time each day
• Create a calming pre-sleep routine (reading, gentle music, meditation)
• Keep your bedroom cool, dark, and quiet
• Avoid screens for at least an hour before bed
• Consider a warm cup of herbal tea (chamomile is lovely)

**During the day:**
• Get some natural sunlight in the morning
• Stay active with gentle exercise
• Limit caffeine after 2 PM
• Try not to nap too late in the day

**If you're still having trouble:**
• Keep a simple sleep diary to track patterns
• Consider relaxation techniques like deep breathing
• Don't stress about not sleeping - that makes it worse!

Sweet dreams are ahead! How has your sleep been lately? I'm here to help you find what works best for you. 💤`;
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
    return `🤗 I can hear that you might be feeling overwhelmed, and I want you to know that it's completely okay to feel this way. You're not alone in this.

**Gentle ways to care for yourself:**
• Take deep, slow breaths - even just 3-5 can help
• Go for a gentle walk in nature if possible
• Practice gratitude by thinking of 3 good things from your day
• Stay connected with people who care about you
• Try some gentle stretching or yoga

**Remember:**
• It's okay to take breaks and rest
• You don't have to be perfect
• Small steps forward are still progress
• Your feelings are valid and temporary

**When to reach out for more support:**
• If stress is affecting your daily life significantly
• If you're having trouble sleeping or eating
• If you feel hopeless or overwhelmed most days

I'm proud of you for reaching out and taking care of your mental health. That takes courage! How are you feeling right now? What's been on your mind? 💪`;
  }
  
  // Default response for general health questions
  return `🌟 Hello! I'm Dr. Sarah, your friendly family doctor. I'm so glad you're here today!

I'm here to support you on your health journey with warmth, understanding, and professional guidance. Whether you have questions about symptoms, want to learn about prevention, or just need someone to listen, I'm here for you.

**How I can help you today:**
• Answer your health questions with care and expertise
• Provide guidance on symptoms and when to seek care
• Share practical tips for staying healthy and well
• Support you in making informed health decisions
• Be a listening ear for your health concerns

**Remember:** I'm an AI assistant designed to provide general health guidance. For serious symptoms or medical emergencies, please consult with a healthcare professional immediately.

What's on your mind today? I'm here to listen and help in any way I can. Your health and wellbeing matter to me! ❤️`;
}

// Generate fallback response when API fails
function generateFallbackResponse(message) {
  return `# 🤗 Technical Difficulties

I'm so sorry, but I'm experiencing some technical difficulties right now.

## **What happened:**
The AI service is temporarily unavailable. This could be due to:
- API configuration issues
- Network connectivity problems
- Service maintenance

## **What you can do:**
- Try asking your question again in a few moments
- Check with your system administrator about API configuration
- For urgent medical concerns, contact your healthcare provider immediately

## **Important:**
I'm Dr. Sarah, an AI medical assistant designed to provide general health guidance. I cannot replace professional medical advice or diagnosis.

## **General wellness tips:**
- Stay hydrated and get adequate sleep
- Maintain a balanced diet and regular exercise
- Don't ignore persistent or severe symptoms
- Keep up with regular health checkups

---

> Please try again later, and remember - I'm here to support you on your health journey! ❤️`;
}

export default router;
