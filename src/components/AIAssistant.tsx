import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  MessageCircle, 
  Send, 
  Plus,
  Search,
  Upload,
  FileText,
  FileImage,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Brain,
  Stethoscope,
  Heart,
  Zap,
  Lightbulb,
  ArrowUp,
  Mic,
  MicOff,
  Activity,
  BarChart3,
  Pill,
  Thermometer,
  AlertCircle,
  Eye,
  Download,
  Camera
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  analysis?: any;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface MedicalRecord {
  id: string;
  type: 'pdf' | 'image' | 'lab' | 'note';
  name: string;
  date: Date;
  content: any;
  analysis?: any;
}

interface PatientDashboard {
  medicalHistory: MedicalRecord[];
  recentAnalyses: any[];
  healthMetrics: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  medications: string[];
  allergies: string[];
  conditions: string[];
}

const AIAssistant: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'medical'>('chats');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<ChatSession[]>([]);
  const [patientDashboard, setPatientDashboard] = useState<PatientDashboard>({
    medicalHistory: [],
    recentAnalyses: [],
    healthMetrics: {},
    medications: [],
    allergies: [],
    conditions: []
  });
  
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Determine if chat history should be persisted based on OAuth provider
  const getUserProvider = () => {
    try {
      const meta = (user as any)?.app_metadata;
      if (meta?.provider) return String(meta.provider).toLowerCase();
      const ids = (user as any)?.identities;
      if (Array.isArray(ids) && ids[0]?.provider) return String(ids[0].provider).toLowerCase();
    } catch {}
    return null;
  };

  const shouldPersistChat = () => {
    const p = getUserProvider();
    // Do not persist for Google or Microsoft/Azure users
    return !(p === 'google' || p === 'azure' || p === 'microsoft' || p === 'azuread');
  };

  // Load sample questions on component mount
  useEffect(() => {
    loadSampleQuestions();
    loadChatHistory();
    loadPatientDashboard();
  }, []);

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chatHistory);
    } else {
      const filtered = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some(msg => 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chatHistory]);

  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const minWidth = 280;
      const maxWidth = 600;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-complete functionality
  useEffect(() => {
    if (inputValue.length > 1) {
      if (autoCompleteTimeoutRef.current) {
        clearTimeout(autoCompleteTimeoutRef.current);
      }
      
      autoCompleteTimeoutRef.current = setTimeout(() => {
        fetchAutoCompleteSuggestions(inputValue);
      }, 300);
    } else {
      setAutoCompleteSuggestions([]);
      setShowAutoComplete(false);
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSampleQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-ai/sample-questions`);
      const data = await response.json();
      if (data.success) {
        // Use shorter, more concise questions
        const shortQuestions = [
          "Analyze this X-ray",
          "Blood test results?",
          "Review my medical history",
          "Diabetes symptoms?",
          "Improve sleep quality?",
          "Cold vs flu difference?",
          "Heart health tips?",
          "Stress management?",
          "Healthy diet advice?",
          "Exercise recommendations?"
        ];
        setSampleQuestions(shortQuestions);
      }
    } catch (error) {
      console.error('Error loading sample questions:', error);
      // Fallback to default short questions
      const defaultQuestions = [
        "Analyze this X-ray",
        "Blood test results?",
        "Review my medical history",
        "Diabetes symptoms?",
        "Improve sleep quality?",
        "Cold vs flu difference?"
      ];
      setSampleQuestions(defaultQuestions);
    }
  };

  const loadChatHistory = () => {
    // Respect privacy: skip persisting for Google/Microsoft users
    if (!shouldPersistChat()) {
      setChatHistory([]);
      return;
    }
    // Load from localStorage for now
    const savedHistory = localStorage.getItem('ai-assistant-chat-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setChatHistory(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };

  const saveChatHistory = (history: ChatSession[]) => {
    // Respect privacy: do not store chats for Google/Microsoft users
    if (shouldPersistChat()) {
      localStorage.setItem('ai-assistant-chat-history', JSON.stringify(history));
    }
    setChatHistory(history);
  };

  const loadPatientDashboard = () => {
    const savedDashboard = localStorage.getItem('patient-dashboard');
    if (savedDashboard) {
      try {
        const dashboard = JSON.parse(savedDashboard);
        // Convert date strings back to Date objects
        if (dashboard.medicalHistory) {
          dashboard.medicalHistory = dashboard.medicalHistory.map((record: any) => ({
            ...record,
            date: new Date(record.date)
          }));
        }
        setPatientDashboard(dashboard);
      } catch (error) {
        console.error('Error loading patient dashboard:', error);
      }
    }
  };

  const savePatientDashboard = (dashboard: PatientDashboard) => {
    localStorage.setItem('patient-dashboard', JSON.stringify(dashboard));
    setPatientDashboard(dashboard);
  };

  const fetchAutoCompleteSuggestions = async (text: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-assistant/auto-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      if (data.success && data.suggestions.length > 0) {
        setAutoCompleteSuggestions(data.suggestions);
        setShowAutoComplete(true);
      } else {
        setShowAutoComplete(false);
      }
    } catch (error) {
      console.error('Error fetching auto-complete suggestions:', error);
    }
  };

  const autoCorrectText = async (text: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-assistant/auto-correct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      if (data.success && data.hasCorrections) {
        setCorrectedText(data.correctedText);
        return data.correctedText;
      }
    } catch (error) {
      console.error('Error auto-correcting text:', error);
    }
    return text;
  };

  const startNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentChat(newChat);
    setMessages([]);
    setInputValue('');
    setCorrectedText(null);
  };

  const selectChat = (chat: ChatSession) => {
    setCurrentChat(chat);
    setMessages(chat.messages);
    setInputValue('');
    setCorrectedText(null);
  };

  const updateChatTitle = (chatId: string, title: string) => {
    const updatedHistory = chatHistory.map(chat => 
      chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
    );
    saveChatHistory(updatedHistory);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    // Auto-correct the message
    const correctedMessage = await autoCorrectText(textToSend);
    const finalMessage = correctedMessage || textToSend;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setCorrectedText(null);
    setShowAutoComplete(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalMessage,
          chatHistory: newMessages.slice(-10), // Last 10 messages for context
          userId: user?.id,
          medicalContext: patientDashboard
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Debug: Log the AI response to see if it contains markdown
      console.log('AI Response:', data.response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Update or create chat session
      if (currentChat) {
        const updatedChat = {
          ...currentChat,
          messages: finalMessages,
          title: currentChat.title === 'New Chat' ? finalMessage.substring(0, 50) + '...' : currentChat.title,
          updatedAt: new Date()
        };
        
        setCurrentChat(updatedChat);
        
        // Update chat history
        const updatedHistory = chatHistory.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        );
        
        if (!chatHistory.find(chat => chat.id === currentChat.id)) {
          updatedHistory.unshift(updatedChat);
        }
        
        saveChatHistory(updatedHistory);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment. If the issue persists, please contact support.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSampleQuestionClick = (question: string) => {
    setInputValue(question);
    sendMessage(question);
  };

  // Test function to add a formatted message
  const addTestFormattedMessage = () => {
    const testMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `# Bold Text Test

This message tests **bold text formatting** with various patterns.

## Simple Bold Examples:
- **This text should be bold**
- **Another bold example**
- **Bold text with numbers 123**

## Medical Examples:
**Cancer** is a serious condition that requires immediate attention.
**Symptoms** include fatigue, weight loss, and pain.
**Treatment** options vary depending on the type and stage.

## Mixed Content:
This paragraph has **bold text** mixed with regular text and *italic text*.

**Important:** This should be very bold and stand out!

## Test Results:
If you can see **bold text** properly formatted above, then the markdown parsing is working correctly.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, testMessage]);
  };

  const handleAutoCompleteClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowAutoComplete(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/medical-ai/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Add file attachment to current message
        const fileAttachment: FileAttachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          analysis: data.result
        };

        // Create a message with the file analysis
        const analysisMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: generateFileAnalysisMessage(data.result),
          timestamp: new Date(),
          attachments: [fileAttachment]
        };

        setMessages(prev => [...prev, analysisMessage]);

        // Update patient dashboard with new medical record
        const newRecord: MedicalRecord = {
          id: Date.now().toString(),
          type: data.result.type,
          name: file.name,
          date: new Date(),
          content: data.result,
          analysis: data.result
        };

        const updatedDashboard = {
          ...patientDashboard,
          medicalHistory: [newRecord, ...patientDashboard.medicalHistory]
        };
        savePatientDashboard(updatedDashboard);
        setPatientDashboard(updatedDashboard);

        // Update chat with analysis
        if (currentChat) {
          const updatedChat = {
            ...currentChat,
            messages: [...messages, analysisMessage],
            updatedAt: new Date()
          };
          
          setCurrentChat(updatedChat);
          
          const updatedHistory = chatHistory.map(chat => 
            chat.id === currentChat.id ? updatedChat : chat
          );
          
          if (!chatHistory.find(chat => chat.id === currentChat.id)) {
            updatedHistory.unshift(updatedChat);
          }
          
          saveChatHistory(updatedHistory);
        }
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I apologize, but there was an error processing your file. Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const generateFileAnalysisMessage = (result: any) => {
    if (result.type === 'pdf') {
      return `📄 **PDF Medical Report Analysis**

**File:** ${result.fileName}
**Size:** ${(result.fileSize / 1024).toFixed(1)} KB

**Extracted Information:**
${result.medicalInfo.diagnoses.length > 0 ? `• **Diagnoses:** ${result.medicalInfo.diagnoses.join(', ')}` : ''}
${result.medicalInfo.medications.length > 0 ? `• **Medications:** ${result.medicalInfo.medications.join(', ')}` : ''}
${result.medicalInfo.allergies.length > 0 ? `• **Allergies:** ${result.medicalInfo.allergies.join(', ')}` : ''}
${result.medicalInfo.symptoms.length > 0 ? `• **Symptoms:** ${result.medicalInfo.symptoms.join(', ')}` : ''}

**Vital Signs:**
${Object.entries(result.medicalInfo.vitalSigns).map(([key, value]) => `• **${key}:** ${value}`).join('\n')}

**Summary:**
${result.extractedText.substring(0, 500)}...

**Recommendations:**
• Review the extracted information with your healthcare provider
• Discuss any concerns or questions about the findings
• Consider scheduling follow-up appointments as needed

⚠️ **Important**: This is an AI-assisted analysis. Please consult with qualified healthcare professionals for medical decisions.`;
    } else if (result.type === 'image') {
      return `🖼️ **Medical Image Analysis**

**File:** ${result.fileName}
**Size:** ${(result.fileSize / 1024).toFixed(1)} KB

**AI Analysis Results:**
${result.recommendations.map((rec: any, index: number) => `
**Analysis ${index + 1} (${rec.source}):**
${rec.analysis}
**Confidence:** ${rec.confidence}
`).join('\n')}

**Recommendations:**
• Review the analysis with a qualified radiologist or specialist
• Discuss any findings with your healthcare provider
• Consider additional imaging if recommended
• Follow up on any concerning findings

⚠️ **Important**: This is an AI-assisted analysis. Professional medical interpretation is required for accurate diagnosis.`;
    }
    
    return 'File processed successfully. Please review the analysis with your healthcare provider.';
  };

  const formatMessage = (content: string, isUserMessage: boolean = false) => {
    // Debug: Log the content to see what we're receiving
    console.log('=== FORMATTING MESSAGE ===');
    console.log('Raw content:', content);
    console.log('Content includes **:', content.includes('**'));
    console.log('Content includes *:', content.includes('*'));
    console.log('Content length:', content.length);
    
    // Pre-process content to convert common patterns to markdown
    let processedContent = content;
    
    // Convert numbered lists that don't use markdown
    processedContent = processedContent.replace(/^(\d+)\.\s+(.+)$/gm, '$1. $2');
    
    // Convert bullet points that don't use markdown
    processedContent = processedContent.replace(/^[-•]\s+(.+)$/gm, '- $1');
    
    // Ensure bold text patterns are properly formatted
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    
    // Ensure italic text patterns are properly formatted (but not if they're part of bold)
    processedContent = processedContent.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '*$1*');
    
    // Convert common patterns to bold
    processedContent = processedContent.replace(/^([A-Z][^:]+):/gm, '**$1:**');
    
    // Convert section headers to bold
    processedContent = processedContent.replace(/^([A-Z][^:]+)$/gm, '**$1**');
    
    // Split content into lines for processing
    const lines = processedContent.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++; // Move to next line
        
        // Collect code lines until closing ```
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        elements.push(
          <pre key={key++} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            <code className={`language-${language}`}>
              {codeLines.join('\n')}
            </code>
          </pre>
        );
        continue;
      }
      
      // Handle inline code
      if (line.includes('`')) {
        const parts = line.split('`');
        const formattedLine = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            // Odd indices are code
            return <code key={partIndex} className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">{part}</code>;
          }
          return part;
        });
        
        elements.push(
          <div key={key++} className="my-2">
            {formattedLine}
          </div>
        );
        continue;
      }
      
      // Handle headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className={`text-lg font-semibold mt-4 mb-2 ${isUserMessage ? 'text-white' : 'text-gray-900'}`}>
            {line.slice(4)}
          </h3>
        );
        continue;
      }
      
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className={`text-xl font-bold mt-4 mb-2 ${isUserMessage ? 'text-white' : 'text-gray-900'}`}>
            {line.slice(3)}
          </h2>
        );
        continue;
      }
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className={`text-2xl font-bold mt-4 mb-2 ${isUserMessage ? 'text-white' : 'text-gray-900'}`}>
            {line.slice(2)}
          </h1>
        );
        continue;
      }
      
      // Handle lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={key++} className="flex items-start my-1">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <span className="flex-1">{line.slice(2)}</span>
          </div>
        );
        continue;
      }
      
      if (line.match(/^\d+\. /)) {
        const match = line.match(/^(\d+)\. (.*)/);
        if (match) {
          elements.push(
            <div key={key++} className="flex items-start my-1">
              <span className="text-blue-500 mr-2 mt-1 font-semibold">{match[1]}.</span>
              <span className="flex-1">{match[2]}</span>
            </div>
          );
          continue;
        }
      }
      
      // Handle bold and italic text (process bold first, then italic)
      if (line.includes('**') || line.includes('*')) {
        let formattedLine: any[] = [];
        
        // First, handle bold text with **
        if (line.includes('**')) {
          console.log('Processing bold text in line:', line);
          const parts = line.split('**');
          console.log('Bold parts:', parts);
          formattedLine = parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              console.log('Creating bold element for:', part);
              return <strong key={`bold-${partIndex}`} className={`font-bold ${isUserMessage ? 'text-white' : 'text-gray-900'}`}>{part}</strong>;
            }
            return part;
          });
          console.log('Formatted line result:', formattedLine);
        } else if (line.includes('*')) {
          // Handle italic text with single * (only if not already processed as bold)
          const parts = line.split('*');
          formattedLine = parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              return <em key={`italic-${partIndex}`} className={`italic ${isUserMessage ? 'text-white/90' : 'text-gray-700'}`}>{part}</em>;
            }
            return part;
          });
        }
        
        elements.push(
          <div key={key++} className="my-2 text-selectable">
            {formattedLine}
          </div>
        );
        continue;
      }
      
      // Handle blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={key++} className={`border-l-4 border-blue-500 pl-4 my-2 italic ${isUserMessage ? 'text-white/90' : 'text-gray-700'}`}>
            {line.slice(2)}
          </blockquote>
        );
        continue;
      }
      
      // Handle horizontal rules
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(
          <hr key={key++} className="my-4 border-gray-300" />
        );
        continue;
      }
      
      // Handle regular paragraphs
      if (line.trim() !== '') {
        elements.push(
          <p key={key++} className={`my-2 leading-relaxed ${isUserMessage ? 'text-white' : ''}`}>
            {line}
          </p>
        );
      } else {
        // Empty line for spacing
        elements.push(
          <div key={key++} className="my-1"></div>
        );
      }
    }
    
    return elements;
  };

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      {/* Health Metrics */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Blood Pressure</div>
              <div className="text-xl font-bold text-gray-900">{patientDashboard.healthMetrics.bloodPressure || '--/--'}</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Heart Rate</div>
              <div className="text-xl font-bold text-gray-900">{patientDashboard.healthMetrics.heartRate || '--'} bpm</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Thermometer className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Temperature</div>
              <div className="text-xl font-bold text-gray-900">{patientDashboard.healthMetrics.temperature || '--'}°F</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Weight</div>
              <div className="text-xl font-bold text-gray-900">{patientDashboard.healthMetrics.weight || '--'} lbs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientDashboard.medicalHistory.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    record.type === 'pdf' 
                      ? 'bg-gradient-to-r from-red-400 to-red-500' 
                      : 'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}>
                    {record.type === 'pdf' ? (
                      <FileText className="w-6 h-6 text-white" />
                    ) : (
                      <FileImage className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{record.name}</div>
                    <div className="text-sm text-gray-500">
                      {record.date instanceof Date ? record.date.toLocaleDateString() : new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {patientDashboard.medicalHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-gray-500 font-medium">No medical records uploaded yet</div>
                <div className="text-sm text-gray-400 mt-1">Upload your first medical file to get started</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications & Allergies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientDashboard.medications.map((med, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Pill className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{med}</span>
                </div>
              ))}
              {patientDashboard.medications.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Pill className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-500 font-medium">No medications recorded</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientDashboard.allergies.map((allergy, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{allergy}</span>
                </div>
              ))}
              {patientDashboard.allergies.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-500 font-medium">No known allergies</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      {sidebarOpen && (
        <div 
          className="bg-gray-50 border-r border-gray-200 flex flex-col relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <Button
              onClick={startNewChat}
              className="w-full justify-start bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* HealthGenius Pro Button */}
          <div className="p-4">
            <div 
              className={`flex items-center text-sm cursor-pointer py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'medical' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('medical')}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                activeTab === 'medical' 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
                <Stethoscope className={`w-4 h-4 ${
                  activeTab === 'medical' ? 'text-white' : 'text-white'
                }`} />
              </div>
              <div>
                <div className="font-semibold">HealthGenius Pro</div>
                <div className={`text-xs ${
                  activeTab === 'medical' ? 'text-white/80' : 'text-gray-500'
                }`}>
                  Medical AI Assistant
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 flex-shrink-0">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chats' | 'medical')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="chats" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chats
                  </TabsTrigger>
                  <TabsTrigger 
                    value="medical" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 font-medium"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    HealthGenius
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 overflow-hidden px-4 pb-4">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chats' | 'medical')} className="w-full h-full">
                <TabsContent value="chats" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-1 pr-2">
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => selectChat(chat)}
                          className={`p-3 rounded-lg cursor-pointer text-sm hover:bg-gray-100 transition-colors ${
                            currentChat?.id === chat.id ? 'bg-gray-100' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900 truncate">
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {chat.updatedAt instanceof Date ? chat.updatedAt.toLocaleDateString() : new Date(chat.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      {filteredChats.length === 0 && chatHistory.length > 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <div className="text-sm">No chats found</div>
                          <div className="text-xs text-gray-400">Try a different search term</div>
                        </div>
                      )}
                      {chatHistory.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <div className="text-sm">No chats yet</div>
                          <div className="text-xs text-gray-400">Start a new conversation</div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="medical" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="pr-2">
                      {renderPatientDashboard()}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.email || 'Guest User'}
                </div>
                <div className="text-xs text-gray-500">Free</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                Upgrade
              </Button>
            </div>
          </div>
          
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            className="absolute top-0 right-0 w-1 h-full bg-transparent hover:bg-blue-500 cursor-col-resize transition-colors"
            onMouseDown={() => setIsResizing(true)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                {activeTab === 'medical' ? (
                  <Stethoscope className="w-4 h-4 text-white" />
                ) : (
                  <Brain className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-semibold text-gray-900">
                {activeTab === 'medical' ? 'HealthGenius Pro' : 'Dr. Sarah AI'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'medical' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload Medical Files"
              >
                <Upload className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={addTestFormattedMessage}
              title="Test Rich Text Formatting"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {activeTab === 'medical' ? 'Welcome to HealthGenius Pro' : 'Welcome to Dr. Sarah AI'}
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  {activeTab === 'medical' 
                    ? 'Your advanced medical AI assistant for image analysis, PDF interpretation, and health guidance.'
                    : 'I\'m Dr. Sarah, your friendly AI family doctor. I\'m here to help with your health questions, provide guidance, and support you on your wellness journey.'
                  }
                </p>
                
                {/* Medical Analysis Options - Only show in Medical tab */}
                {activeTab === 'medical' && (
                  <div className="mb-8 space-y-6">
                    {/* Face Analysis Option */}
                    <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Skin Analysis</h3>
                        <p className="text-gray-600 mb-4">Get medical-grade skin analysis with personalized routine recommendations</p>
                        <Button
                          onClick={() => window.location.href = '/analyze'}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Skin Analysis
                        </Button>
                      </div>
                    </div>

                    {/* Medical File Upload Option */}
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Medical Files</h3>
                        <p className="text-gray-600 mb-4">Upload PDFs, X-rays, MRI scans, or other medical images for AI analysis</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          variant="outline"
                        >
                          {isUploading ? 'Uploading...' : 'Choose Files'}
                        </Button>
                        {isUploading && (
                          <div className="mt-4">
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-sm text-gray-600 mt-2">Processing file...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sample Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl">
                  {sampleQuestions.slice(0, 6).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 text-left justify-start hover:bg-gray-50 text-sm text-selectable"
                      onClick={() => handleSampleQuestionClick(question)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">{question}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {message.role === 'user' && (
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="max-w-none text-selectable">
                            {formatMessage(message.content, message.role === 'user')}
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600">Dr. Sarah is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          {/* Auto-correction notification */}
          {correctedText && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Zap className="w-4 h-4" />
                <span>Auto-corrected: "{correctedText}"</span>
              </div>
            </div>
          )}
          
          {/* Auto-complete suggestions */}
          {showAutoComplete && autoCompleteSuggestions.length > 0 && (
            <div className="mb-3 space-y-1">
              {autoCompleteSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => handleAutoCompleteClick(suggestion)}
                >
                  <ArrowUp className="w-3 h-3 mr-2" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Dr. Sarah anything about your health..."
                disabled={isLoading}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Dr. Sarah can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.dcm"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AIAssistant;
