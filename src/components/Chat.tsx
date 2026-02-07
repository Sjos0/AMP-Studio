'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import InputArea from './InputArea';
import Sidebar from './Sidebar';
import { useMemory } from '@/lib/memory';
import { UUID } from '@/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Mock user ID - em produção, viria do auth
const MOCK_USER_ID: UUID = '00000000-0000-0000-0000-000000000000';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Integração com sistema de memória
  const { 
    isLoading: memoryLoading, 
    error: memoryError,
    search,
    createEphemeralMemory,
    recentMemories 
  } = useMemory(MOCK_USER_ID);

  // Inicializar mensagens apenas no cliente para evitar erro de hidratação
  useEffect(() => {
    setIsClient(true);
    // Mensagem inicial
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: 'Olá! Sou seu assistente com memória. Posso lembrar de preferências e contexto das nossas conversas.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Busca memórias relevantes antes de responder
   */
  const searchRelevantMemories = useCallback(async (query: string) => {
    try {
      const result = await search(query);
      if (result && result.results.length > 0) {
        console.log(`[Memory] Found ${result.results.length} relevant memories`);
        return result.results.slice(0, 3).map(r => r.content).join('\n');
      }
      return null;
    } catch (error) {
      console.error('[Memory] Search error:', error);
      return null;
    }
  }, [search]);

  /**
   * Salva mensagem na memória efêmera
   */
  const saveToMemory = useCallback(async (message: string, isUser: boolean) => {
    try {
      await createEphemeralMemory({
        userId: MOCK_USER_ID,
        date: new Date(),
        title: isUser ? 'User message' : 'Bot response',
        content: message,
      });
    } catch (error) {
      console.error('[Memory] Save error:', error);
    }
  }, [createEphemeralMemory]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    try {
      // Busca memórias relevantes
      const relevantMemories = await searchRelevantMemories(text);
      
      // Simula processamento com memória (futuro: chamaria LLM aqui)
      const contextInfo = relevantMemories 
        ? `\n\n[Memória relevante encontrada: ${relevantMemories}]`
        : '';
      
      // Salva mensagem do usuário na memória
      await saveToMemory(text, true);

      // Simular resposta do bot com contexto de memória
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: relevantMemories
            ? `Entendi! Com base nas nossas conversas anteriores: "${relevantMemories.substring(0, 100)}...". ${text}`
            : `Recebi sua mensagem: "${text}". ${contextInfo}`,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
        
        // Salva resposta do bot
        saveToMemory(botResponse.text, false);
      }, 1000 + Math.random() * 500);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Estado do indicador de memória
  const memoryStatus = memoryLoading ? 'loading' : memoryError ? 'error' : 'active';
  
  // Mostrar contador de memórias recentes
  const recentCount = recentMemories?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">AMP Chat</h1>
            <div className="flex items-center gap-1.5">
              <span 
                className={`w-2 h-2 rounded-full animate-pulse ${
                  memoryStatus === 'loading' ? 'bg-yellow-500' :
                  memoryStatus === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`} 
              />
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {memoryStatus === 'loading' ? 'Carregando memória...' :
                 memoryStatus === 'error' ? 'Erro na memória' : 'Memória Ativa'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sidebar Trigger Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-blue-600 rounded-2xl transition-all duration-300 active:scale-90 border border-transparent hover:border-blue-100 group relative"
        >
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          </span>
          <svg
            className="w-6 h-6 transition-transform duration-500 group-hover:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Componente separado (fixed para não mover no scroll) */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <InputArea onSendMessage={handleSendMessage} />
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        messages={messages}
      />
    </div>
  );
}
