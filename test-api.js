// Test script to verify OpenRouter API configuration
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

async function testAPI() {
  console.log('🔍 Testing OpenRouter API Configuration...\n');
  
  // Check if API key is configured
  const isApiKeyConfigured = OPENROUTER_API_KEY && 
                             OPENROUTER_API_KEY !== 'your_openrouter_api_key_here' && 
                             OPENROUTER_API_KEY.startsWith('sk-or-v1-');
  
  console.log(`API Key Configured: ${isApiKeyConfigured ? '✅ Yes' : '❌ No'}`);
  
  if (!isApiKeyConfigured) {
    console.log('\n❌ API key not configured properly.');
    console.log('Please update your .env file with a valid OpenRouter API key.');
    console.log('See OPENROUTER_SETUP.md for detailed instructions.');
    return;
  }
  
  console.log(`API Key: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  
  // Test with free model first
  console.log('\n🧪 Testing with free model (Llama 3.1)...');
  
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://derma-vision-pro.com',
        'X-Title': 'DermaVision Pro Medical Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant. Provide a brief response.'
          },
          {
            role: 'user',
            content: 'What is a headache?'
          }
        ],
        max_tokens: 100
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Free model test successful!');
      console.log(`Response: ${data.choices[0].message.content.substring(0, 100)}...`);
    } else {
      const errorData = await response.text();
      console.log(`❌ Free model test failed: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.log(`❌ Free model test error: ${error.message}`);
  }
  
  // Test with premium model
  console.log('\n🧪 Testing with premium model (Claude 3.5 Sonnet)...');
  
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://derma-vision-pro.com',
        'X-Title': 'DermaVision Pro Medical Assistant'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant. Provide a brief response.'
          },
          {
            role: 'user',
            content: 'What is a headache?'
          }
        ],
        max_tokens: 100
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Premium model test successful!');
      console.log(`Response: ${data.choices[0].message.content.substring(0, 100)}...`);
    } else {
      const errorData = await response.text();
      console.log(`❌ Premium model test failed: ${response.status} - ${errorData}`);
      
      if (response.status === 402) {
        console.log('💡 This usually means insufficient credits. Add credits to your OpenRouter account.');
      }
    }
  } catch (error) {
    console.log(`❌ Premium model test error: ${error.message}`);
  }
  
  console.log('\n🎉 API testing complete!');
  console.log('\nNext steps:');
  console.log('1. If tests passed, restart your server');
  console.log('2. Test the medical assistant in your app');
  console.log('3. If premium model failed, add credits to OpenRouter account');
}

testAPI().catch(console.error);
