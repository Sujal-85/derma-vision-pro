# DermaVision Pro - AI-Powered Skin Analysis

## Project info

**URL**: https://lovable.dev/projects/140d5a86-0cb2-4b04-941a-6d1a6cdef16b

## Features

- 🎯 **AI Skin Analysis**: Advanced camera capture with face detection
- 📊 **Comprehensive Dashboard**: Detailed skin health metrics and insights
- 🧴 **Personalized Routines**: Custom skincare recommendations
- 📰 **Health News**: Latest health and skincare news integration
- 👤 **User Profiles**: Save questionnaire answers and routines
- 🔐 **Authentication**: Secure user management system

## News API Setup ✅

Real-time medical news functionality is now active!

- **Live Medical News**: Fetches real-time medical and healthcare news
- **Enhanced Search**: Intelligent medical query enhancement
- **Multiple Sources**: Comprehensive medical content from various sources
- **Quick Searches**: Pre-configured medical topic searches

**Features**:
- 🏥 **Medical Focus**: Dermatology, skin cancer, clinical trials
- 🤖 **AI & Technology**: Medical AI, healthcare technology
- 🩺 **Clinical Research**: Latest medical research and studies
- 📱 **Telemedicine**: Digital health and remote care
- 🔬 **Precision Medicine**: Personalized treatment approaches

## AI Medical Assistant 🤖

Advanced AI-powered medical assistant with OpenRouter API integration:

- **Smart Chat Interface**: Friendly, conversational medical guidance
- **Medical History Questionnaire**: Personalized advice based on health background
- **Floating Widget**: Always accessible in bottom-right corner
- **Attractive Tooltip**: Hover to see assistant capabilities
- **OpenRouter Integration**: Powered by advanced AI models
- **Fallback Responses**: Works even without API key configuration

**Features**:
- 🩺 **Medical Guidance**: General health advice and symptom information
- 📋 **Health History**: Comprehensive medical questionnaire
- 💬 **Conversational AI**: Natural, empathetic responses
- 🚨 **Safety First**: Always recommends professional medical care when needed
- 🔒 **Privacy Focused**: Secure handling of medical information

### OpenRouter API Setup

To enable the AI medical assistant:

1. **Get OpenRouter API Key**: Visit [OpenRouter.ai](https://openrouter.ai/)
2. **Add to Environment Variables**:
   ```bash
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. **Restart the Server**: Changes take effect immediately

**Note**: The assistant works with intelligent fallback responses even without an API key.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/140d5a86-0cb2-4b04-941a-6d1a6cdef16b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express (server)
- MongoDB via Mongoose

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/140d5a86-0cb2-4b04-941a-6d1a6cdef16b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Development

Install deps and start client:

```bash
npm i
npm run dev
```

Start backend API (needs local MongoDB at `mongodb://127.0.0.1:27017`):

```bash
npm run server
```

Run both concurrently:

```bash
npm run dev:full
```

Environment files:

Create `.env` at project root for server:

```
MONGO_URI=mongodb://127.0.0.1:27017/derma_vision_pro
PORT=5000
```

Optional frontend `.env`:

```
VITE_API_BASE_URL=http://localhost:5000
```
