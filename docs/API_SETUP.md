# API Setup Instructions

## Medical Assistant Chatbot Configuration

The medical assistant chatbot uses OpenRouter API to provide AI-powered medical guidance. To get it working properly, you need to configure the API key.

### Step 1: Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to the [API Keys section](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the API key (it should start with `sk-or-v1-`)

### Step 2: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace `your_openrouter_api_key_here` with your actual API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

### Step 3: Restart the Server

After updating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
# or
node server/index.js
```

### Step 4: Test the Chatbot

1. Open your application in the browser
2. Click on the medical assistant floating button (stethoscope icon)
3. Try asking a health-related question
4. The chatbot should now provide AI-powered responses instead of mock responses

### Troubleshooting

#### If you're still getting "I apologize" messages:

1. **Check API Key Format**: Make sure your API key starts with `sk-or-v1-`
2. **Verify Environment Variables**: Ensure the `.env` file is in the project root and the server is restarted
3. **Check Console Logs**: Look at the server console for error messages
4. **Test API Key**: You can test your API key directly using curl:

```bash
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/llama-3.1-8b-instruct:free",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

#### Common Error Messages:

- **"Invalid API key"**: Check that your API key is correct and properly set in `.env`
- **"API rate limit exceeded"**: You've hit the rate limit, wait a moment and try again
- **"Request timeout"**: The API is taking too long to respond, try again later

### Mock Responses

If the API key is not configured or there are issues, the chatbot will fall back to mock responses that provide general health guidance. These responses are still helpful but not as personalized as the AI-powered ones.

### Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and don't share it publicly
- Consider using environment-specific API keys for production vs development
