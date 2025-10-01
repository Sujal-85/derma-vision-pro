# OpenRouter API Setup Guide

## Get Your OpenRouter API Key

### Step 1: Create OpenRouter Account
1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Click "Sign Up" and create your account
3. Verify your email address

### Step 2: Get API Key
1. After logging in, go to [API Keys](https://openrouter.ai/keys)
2. Click "Create Key"
3. Give it a name like "DermaVision Pro Medical Assistant"
4. Copy the API key (it starts with `sk-or-v1-`)

### Step 3: Add Credits (for Premium Models)
1. Go to [Credits](https://openrouter.ai/credits)
2. Add some credits to your account (minimum $5 recommended)
3. This allows you to use premium models like Claude 3.5 Sonnet

### Step 4: Configure Your Environment
1. Open your `.env` file in the project root
2. Replace `your_openrouter_api_key_here` with your actual API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

### Step 5: Restart Your Server
```bash
# Stop your server (Ctrl+C)
# Then restart it
npm run dev
# or
node server/index.js
```

## AI Models Available

The system is configured to use these models in order of preference:

### 1. Claude 3.5 Sonnet (Premium - Recommended)
- **Model**: `anthropic/claude-3.5-sonnet`
- **Cost**: ~$0.003 per 1K tokens
- **Quality**: Excellent medical knowledge, very intelligent responses
- **Best for**: Professional medical advice and detailed explanations

### 2. Llama 3.1 8B (Free Fallback)
- **Model**: `meta-llama/llama-3.1-8b-instruct:free`
- **Cost**: Free
- **Quality**: Good general knowledge, decent medical responses
- **Best for**: Basic medical questions when premium model isn't available

## Testing Your Setup

1. **Start your server** and make sure it's running on port 5000
2. **Open your app** in the browser
3. **Click the medical assistant button** (stethoscope icon)
4. **Ask a complex medical question** like:
   - "What are the symptoms of diabetes and how is it diagnosed?"
   - "Explain the difference between Type 1 and Type 2 diabetes"
   - "What are the side effects of common blood pressure medications?"

## Expected Behavior

### With Premium Model (Claude 3.5 Sonnet):
- Detailed, comprehensive medical explanations
- Professional medical terminology used appropriately
- Follow-up questions to better understand your situation
- Evidence-based recommendations
- Clear guidance on when to see a doctor

### With Free Model (Llama 3.1):
- Good general medical knowledge
- Helpful but less detailed responses
- Basic medical guidance
- Still professional and accurate

### Without API Key (Mock Responses):
- Predefined responses for common topics
- General health tips
- Clear indication that it's a mock response

## Troubleshooting

### "Invalid API key" Error
- Check that your API key starts with `sk-or-v1-`
- Make sure there are no extra spaces in the `.env` file
- Restart your server after updating the `.env` file

### "Insufficient credits" Error
- Add credits to your OpenRouter account
- The system will automatically fall back to the free model

### "Rate limit exceeded" Error
- Wait a few minutes and try again
- Consider upgrading your OpenRouter plan for higher limits

### Still Getting Mock Responses
- Check server console for error messages
- Verify your API key is correctly set in `.env`
- Make sure you restarted the server after updating `.env`

## Cost Estimation

For typical usage:
- **Claude 3.5 Sonnet**: ~$0.003 per 1K tokens
- **Average conversation**: 500-1000 tokens
- **Cost per conversation**: ~$0.0015 - $0.003
- **$5 credit**: ~1,600 - 3,300 conversations

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure
- Consider using different API keys for development and production
- Monitor your usage on OpenRouter dashboard

## Advanced Configuration

You can modify the models used by editing `server/routes/medical-assistant.js`:

```javascript
const models = [
  'anthropic/claude-3.5-sonnet', // Premium model
  'openai/gpt-4o', // Alternative premium model
  'meta-llama/llama-3.1-8b-instruct:free' // Free fallback
];
```

Available premium models:
- `anthropic/claude-3.5-sonnet` (Recommended)
- `openai/gpt-4o`
- `google/gemini-pro-1.5`
- `anthropic/claude-3-haiku` (Cheaper alternative)
