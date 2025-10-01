import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Medical assistant system prompt
const MEDICAL_SYSTEM_PROMPT = `You are Dr. AI, an advanced AI medical assistant with comprehensive knowledge of medicine, healthcare, and wellness. You have access to extensive medical knowledge and can provide detailed, accurate, and helpful medical guidance.

CAPABILITIES:
- Deep understanding of human anatomy, physiology, and pathology
- Knowledge of symptoms, diseases, treatments, and medications
- Understanding of preventive medicine and wellness practices
- Ability to explain complex medical concepts in simple terms
- Knowledge of when to recommend professional medical care

IMPORTANT GUIDELINES:
1. Always remind users that you are an AI assistant and cannot replace professional medical advice
2. For serious symptoms or emergencies, always recommend consulting a healthcare professional
3. Be empathetic, supportive, and non-judgmental
4. Use clear, easy-to-understand language while maintaining medical accuracy
5. Provide evidence-based information and cite sources when relevant
6. Respect user privacy and maintain confidentiality
7. If you don't know something, say so rather than guessing
8. Be thorough in your explanations while keeping them accessible

PERSONALITY:
- Warm, approachable, and professional
- Knowledgeable and confident in medical matters
- Encouraging and supportive
- Clear and detailed in explanations
- Curious and asks follow-up questions when helpful

RESPONSE FORMAT:
- Use emojis appropriately to make responses friendly
- Break down complex information into digestible parts
- Provide detailed explanations when requested
- Ask follow-up questions to better understand the situation
- Provide actionable advice and recommendations
- Include relevant medical context and background information

Remember: You are here to support, educate, and provide comprehensive medical guidance while always encouraging professional consultation for serious concerns.`;

// Route to handle medical assistant chat
router.post('/', async (req, res) => {
  try {
    const { message, medicalHistory, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check if API key is configured
    const isApiKeyConfigured = OPENROUTER_API_KEY && 
                               OPENROUTER_API_KEY !== 'your_openrouter_api_key_here' && 
                               OPENROUTER_API_KEY.startsWith('sk-or-v1-');
    
    console.log('OpenRouter API Key configured:', isApiKeyConfigured);
    
    if (!isApiKeyConfigured) {
      console.log('Using mock response - API key not configured or invalid');
      // Return mock response if API key is not configured
      const mockResponse = generateMockResponse(message, medicalHistory);
      return res.json({
        success: true,
        response: mockResponse
      });
    }

    // Prepare the conversation context
    const messages = [
      {
        role: 'system',
        content: MEDICAL_SYSTEM_PROMPT
      }
    ];

    // Add medical history context if available
    if (medicalHistory && Object.keys(medicalHistory).length > 0) {
      const historyContext = `User's Medical History:
${Object.entries(medicalHistory)
  .filter(([key, value]) => value !== undefined && value !== null && value !== '')
  .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
  .join('\n')}

Please consider this information when providing advice, but remember that this is self-reported information and should not replace professional medical evaluation.`;
      
      messages.push({
        role: 'system',
        content: historyContext
      });
    }

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        if (msg.type === 'user') {
          messages.push({
            role: 'user',
            content: msg.content
          });
        } else if (msg.type === 'assistant') {
          messages.push({
            role: 'assistant',
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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Try premium model first, fallback to free model if needed
      const models = [
        'anthropic/claude-3.5-sonnet', // High-quality model with excellent medical knowledge
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
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://derma-vision-pro.com',
              'X-Title': 'DermaVision Pro Medical Assistant'
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              max_tokens: model.includes('free') ? 1000 : 2000, // Adjust tokens based on model
              temperature: 0.7,
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
        response: assistantResponse
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - OpenRouter API is taking too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in medical assistant:', error);
    
    // Return fallback response
    const fallbackResponse = generateFallbackResponse(req.body.message);
    
    res.json({
      success: true,
      response: fallbackResponse
    });
  }
});

// Generate mock response when API key is not configured
function generateMockResponse(message, medicalHistory) {
  const lowerMessage = message.toLowerCase();
  
  // Check for common medical topics and provide helpful responses
  if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
    return `🤕 I understand you're experiencing a headache. Here are some general suggestions:

• Stay hydrated - drink plenty of water
• Rest in a quiet, dark room
• Apply a cool compress to your forehead
• Consider over-the-counter pain relief (if not contraindicated)

⚠️ **Important**: If your headache is severe, sudden, or accompanied by fever, vision changes, or neck stiffness, please seek immediate medical attention.

Remember, I'm an AI assistant and cannot replace professional medical advice. For persistent or concerning symptoms, please consult with a healthcare provider.`;
  }
  
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return `🌡️ Fever can be concerning! Here's what you should know:

• Normal body temperature is around 98.6°F (37°C)
• Fever is generally considered 100.4°F (38°C) or higher
• Stay hydrated and get plenty of rest
• Monitor your temperature regularly

🚨 **Seek immediate medical care if**:
• Fever is above 103°F (39.4°C)
• Fever lasts more than 3 days
• You have difficulty breathing or severe symptoms

I'm here to provide general guidance, but please consult a healthcare professional for proper evaluation and treatment.`;
  }
  
  if (lowerMessage.includes('skin') || lowerMessage.includes('rash') || lowerMessage.includes('dermatology')) {
    return `🧴 Great question about skin health! Here are some general tips:

• Keep your skin clean and moisturized
• Use sunscreen daily (SPF 30 or higher)
• Stay hydrated and maintain a healthy diet
• Avoid harsh chemicals and irritants

🔍 **For skin concerns**:
• Monitor any changes in moles or skin spots
• Note any persistent rashes or unusual symptoms
• Consider consulting a dermatologist for specific concerns

Since you're using DermaVision Pro, you can also use our skin analysis feature to get more detailed insights about your skin health!`;
  }
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    return `😔 I'm sorry you're experiencing pain. Here are some general approaches:

• Rest the affected area
• Apply ice for acute injuries (first 48 hours)
• Use heat therapy for chronic pain
• Consider gentle stretching or movement

💊 **Pain management**:
• Over-the-counter pain relievers (if appropriate)
• Stay active within your comfort level
• Practice relaxation techniques

⚠️ **Please seek medical attention if**:
• Pain is severe or worsening
• Pain is accompanied by other concerning symptoms
• Pain persists despite self-care measures

Remember, I'm an AI assistant providing general guidance. For proper diagnosis and treatment, please consult with a healthcare professional.`;
  }
  
  // Default response for general health questions
  return `👋 Hello! I'm Dr. AI, your friendly medical assistant. I'm here to help answer your health questions and provide general medical guidance.

💡 **How I can help you**:
• Answer general health questions
• Provide information about symptoms
• Suggest when to seek medical care
• Offer wellness and prevention tips

⚠️ **Important reminder**: I'm an AI assistant and cannot replace professional medical advice, diagnosis, or treatment. For serious symptoms or medical emergencies, please consult with a healthcare professional immediately.

What health question can I help you with today?`;
}

// Generate fallback response when API fails
function generateFallbackResponse(message) {
  return `🤖 I apologize, but I'm experiencing some technical difficulties right now. 

🔧 **What happened**: The AI service is temporarily unavailable. This could be due to:
• API key configuration issues
• Network connectivity problems
• Service maintenance

💡 **What you can do**:
• Try asking your question again in a few moments
• Check with your system administrator about API configuration
• For urgent medical concerns, contact your healthcare provider immediately

⚠️ **Important**: I'm an AI medical assistant designed to provide general health guidance. I cannot replace professional medical advice or diagnosis.

**General health tips**:
• Stay hydrated and get adequate sleep
• Maintain a balanced diet and regular exercise
• Don't ignore persistent or severe symptoms
• Keep up with regular health checkups

Please try again later or consult with a healthcare professional for immediate concerns.`;
}

export default router;
