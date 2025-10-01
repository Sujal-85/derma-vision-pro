import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Stethoscope, 
  Heart,
  Brain,
  Activity,
  Shield,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Move,
  GripVertical
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../lib/api';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface MedicalHistory {
  age?: number;
  gender?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  symptoms?: string[];
  familyHistory?: string[];
}

interface Position {
  x: number;
  y: number;
}

const DraggableMedicalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({});
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [positionInitialized, setPositionInitialized] = useState(false);
  
  const { user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const medicalQuestions = [
    {
      id: 'age',
      question: 'What is your age?',
      type: 'number',
      placeholder: 'Enter your age'
    },
    {
      id: 'gender',
      question: 'What is your gender?',
      type: 'select',
      options: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    {
      id: 'allergies',
      question: 'Do you have any known allergies?',
      type: 'text',
      placeholder: 'List any allergies (e.g., peanuts, penicillin)'
    },
    {
      id: 'medications',
      question: 'Are you currently taking any medications?',
      type: 'text',
      placeholder: 'List current medications'
    },
    {
      id: 'conditions',
      question: 'Do you have any existing medical conditions?',
      type: 'text',
      placeholder: 'List any chronic conditions (e.g., diabetes, hypertension)'
    },
    {
      id: 'familyHistory',
      question: 'Any relevant family medical history?',
      type: 'text',
      placeholder: 'List relevant family medical history'
    }
  ];

  // Check if we should hide the floating AI (on AI Assistant route)
  const shouldHide = location.pathname === '/ai-assistant';
  console.log('Current route:', location.pathname, 'Should hide:', shouldHide, 'Position initialized:', positionInitialized);

  // Load saved position from localStorage or set default to bottom right
  useEffect(() => {
    // Force clear any old positioning data for testing
    // localStorage.removeItem('medical-assistant-position');
    
    const savedPosition = localStorage.getItem('medical-assistant-position');
    console.log('Setting initial position. Window size:', window.innerWidth, 'x', window.innerHeight);
    
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        console.log('Loaded saved position:', pos);
        setPosition(pos);
      } catch (error) {
        console.error('Error loading saved position:', error);
        // Set default position to bottom right if saved position is invalid
        const defaultPos = { x: 20, y: 20 }; // 20px from right and bottom edges
        console.log('Setting default position:', defaultPos);
        setPosition(defaultPos);
      }
    } else {
      // Set default position to bottom right
      const defaultPos = { x: 20, y: 20 }; // 20px from right and bottom edges
      console.log('No saved position, setting default:', defaultPos);
      setPosition(defaultPos);
    }
    setPositionInitialized(true);
  }, []);

  // Save position to localStorage
  const savePosition = (newPosition: Position) => {
    localStorage.setItem('medical-assistant-position', JSON.stringify(newPosition));
  };

  // Reset position to bottom right
  const resetToBottomRight = () => {
    const newPosition = { 
      x: 20, // 20px from right edge
      y: 20  // 20px from bottom edge
    };
    setPosition(newPosition);
    savePosition(newPosition);
  };

  // Force reset to bottom right (clears localStorage)
  const forceResetToBottomRight = () => {
    localStorage.removeItem('medical-assistant-position');
    const newPosition = { 
      x: 20, // 20px from right edge
      y: 20  // 20px from bottom edge
    };
    setPosition(newPosition);
    setPositionInitialized(true);
    console.log('Force reset to bottom right:', newPosition);
  };

  // Handle window resize to keep position within bounds
  useEffect(() => {
    const handleResize = () => {
      const buttonSize = 56;
      const chatWidth = 384;
      const chatHeight = 500;
      
      const maxX = window.innerWidth - (isOpen ? chatWidth : buttonSize);
      const maxY = window.innerHeight - (isOpen ? chatHeight : buttonSize);
      
      // If current position is outside bounds, adjust it
      if (position.x > maxX || position.y > maxY) {
        const newPosition = {
          x: Math.min(position.x, maxX),
          y: Math.min(position.y, maxY)
        };
        setPosition(newPosition);
        savePosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      const rect = dragRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - (window.innerWidth - position.x),
          y: e.clientY - (window.innerHeight - position.y)
        });
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Calculate position relative to bottom-right corner
      const newPosition = {
        x: window.innerWidth - e.clientX + dragOffset.x,
        y: window.innerHeight - e.clientY + dragOffset.y
      };
      
      // Keep within viewport bounds - ensure it stays within the window frame
      const buttonSize = 56; // 14 * 4 = 56px (w-14 h-14)
      const chatWidth = 384; // w-96 = 384px
      const chatHeight = 500; // approximate chat height
      
      const maxX = window.innerWidth - (isOpen ? chatWidth : buttonSize);
      const maxY = window.innerHeight - (isOpen ? chatHeight : buttonSize);
      
      // Ensure minimum position to keep it visible (distance from edges)
      const minX = 0;
      const minY = 0;
      
      newPosition.x = Math.max(minX, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(minY, Math.min(newPosition.y, maxY));
      
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      savePosition(position);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, dragOffset]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `👋 Hello! I'm your AI Medical Assistant. I'm here to help answer your medical questions and provide health guidance.\n\nTo give you the most accurate and personalized advice, I'd like to ask you a few questions about your medical history. This information will help me provide better recommendations.\n\nWould you like to start with a quick medical history questionnaire?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
    setCurrentQuestion(0);
    setQuestionnaireAnswers({});
  };

  const handleQuestionnaireAnswer = (questionId: string, answer: any) => {
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < medicalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Questionnaire completed
      setMedicalHistory(questionnaireAnswers);
      setShowQuestionnaire(false);
      
      const completionMessage: Message = {
        id: 'questionnaire-complete',
        type: 'assistant',
        content: '✅ Thank you for completing the medical history questionnaire! I now have a better understanding of your health background. Feel free to ask me any medical questions, and I\'ll provide personalized advice based on your information.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completionMessage]);
    }
  };

  const skipQuestionnaire = () => {
    setShowQuestionnaire(false);
    const skipMessage: Message = {
      id: 'questionnaire-skipped',
      type: 'assistant',
      content: 'No problem! You can always provide your medical history later or ask specific questions. How can I help you today?',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, skipMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          medicalContext: medicalHistory,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || data.message || 'I apologize, but I could not process your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I apologize, but I'm experiencing technical difficulties. 

🔧 **What happened**: ${error instanceof Error ? error.message : 'Unknown error'}

💡 **What you can do**:
• Try asking your question again
• Check your internet connection
• Contact support if the issue persists

I'm still here to help with general health guidance even during technical issues!`,
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

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const getCurrentQuestion = () => {
    return medicalQuestions[currentQuestion];
  };

  const renderQuestionnaire = () => {
    const question = getCurrentQuestion();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Medical History Questionnaire</h3>
          <Badge variant="secondary">
            {currentQuestion + 1} of {medicalQuestions.length}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{question.question}</p>
          
          {question.type === 'number' && (
            <Input
              type="number"
              placeholder={question.placeholder}
              value={questionnaireAnswers[question.id] || ''}
              onChange={(e) => handleQuestionnaireAnswer(question.id, parseInt(e.target.value))}
              className="w-full"
            />
          )}
          
          {question.type === 'select' && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <Button
                  key={option}
                  variant={questionnaireAnswers[question.id] === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuestionnaireAnswer(question.id, option)}
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          
          {question.type === 'text' && (
            <Input
              type="text"
              placeholder={question.placeholder}
              value={questionnaireAnswers[question.id] || ''}
              onChange={(e) => handleQuestionnaireAnswer(question.id, e.target.value)}
              className="w-full"
            />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={nextQuestion} disabled={!questionnaireAnswers[question.id]}>
            {currentQuestion === medicalQuestions.length - 1 ? 'Complete' : 'Next'}
          </Button>
          <Button variant="outline" onClick={skipQuestionnaire}>
            Skip
          </Button>
        </div>
      </div>
    );
  };

  // Don't render if we should hide it or if position is not initialized
  if (shouldHide || !positionInitialized) {
    console.log('Not rendering floating AI - shouldHide:', shouldHide, 'positionInitialized:', positionInitialized);
    return null;
  }

  console.log('Rendering floating AI at position:', position);
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div 
          ref={dragRef}
          className="fixed z-[9999] cursor-grab active:cursor-grabbing"
          style={{ 
            right: `${position.x}px`, 
            bottom: `${position.y}px`,
            transform: isDragging ? 'scale(1.05)' : 'scale(1)',
            transition: isDragging ? 'none' : 'transform 0.2s ease'
          }}
          onMouseDown={handleMouseDown}
          data-drag-handle
        >
          <div className="group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  AI Medical Assistant
                </div>
                <div className="text-xs opacity-90 mt-1">
                  Get instant medical advice & health guidance
                </div>
                <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  Drag to move
                </div>
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
              </div>
            </div>
            
            {/* Drag Handle */}
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="w-2 h-2 text-white" />
            </div>
            
            {/* Floating Button */}
            <Button
              onClick={handleOpen}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Stethoscope className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div 
          ref={dragRef}
          className="fixed z-[9999] w-96 max-w-[calc(100vw-3rem)]"
          style={{ 
            right: `${position.x}px`, 
            bottom: `${position.y}px`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: isDragging ? 'none' : 'transform 0.2s ease'
          }}
          onMouseDown={handleMouseDown}
        >
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm border-2 border-transparent hover:border-blue-200/50 transition-colors">
            <CardHeader 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg cursor-grab active:cursor-grabbing"
              data-drag-handle
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Medical Assistant</CardTitle>
                    <p className="text-xs opacity-90">Always here to help</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs opacity-75">AI Powered</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMinimize}
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                  >
                    {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={forceResetToBottomRight}
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    title="Reset to bottom right"
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Drag indicator */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full opacity-50"></div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0">
                {showQuestionnaire ? (
                  <div className="p-4">
                    {renderQuestionnaire()}
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <ScrollArea className="h-80 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.type === 'user'
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {message.type === 'assistant' && (
                                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                {message.type === 'user' && (
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <User className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm">{formatMessage(message.content)}</p>
                                  <p className="text-xs opacity-70 mt-1">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                  <Bot className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium">Dr. AI is thinking...</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Analyzing your question and medical history
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t">
                      {messages.length === 1 && !showQuestionnaire && (
                        <div className="mb-3 space-y-2">
                          <Button
                            onClick={startQuestionnaire}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Start Medical History Questionnaire
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your health..."
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default DraggableMedicalAssistant;
