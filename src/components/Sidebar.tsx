'use client';

import { useEffect, useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

export default function Sidebar({ isOpen, onClose, messages }: SidebarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Pequeno delay para permitir a renderização antes da animação de entrada
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      // Animação de saída primeiro
      setIsAnimating(false);
      // Após a animação de saída, oculta o componente
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen]);

  // Agrupar mensagens por sessão de conversa
  const getConversationGroups = () => {
    if (messages.length === 0) return [];

    const groups: { date: string; preview: string; messageCount: number; firstMessage: Message }[] = [];
    let currentGroup: Message[] = [];
    let lastDate: string | null = null;

    messages.forEach((message) => {
      const messageDate = message.timestamp.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      // Considerar como nova sessão se houver mais de 5 minutos entre mensagens
      const isNewSession = currentGroup.length > 0 && 
        (message.timestamp.getTime() - currentGroup[currentGroup.length - 1].timestamp.getTime()) > 5 * 60 * 1000;

      if (messageDate !== lastDate || isNewSession) {
        if (currentGroup.length > 0) {
          groups.push({
            date: formatGroupDate(currentGroup[0].timestamp),
            preview: currentGroup[0].text.substring(0, 50) + (currentGroup[0].text.length > 50 ? '...' : ''),
            messageCount: currentGroup.length,
            firstMessage: currentGroup[0],
          });
        }
        currentGroup = [message];
        lastDate = messageDate;
      } else {
        currentGroup.push(message);
      }
    });

    // Adicionar último grupo
    if (currentGroup.length > 0) {
      groups.push({
        date: formatGroupDate(currentGroup[0].timestamp),
        preview: currentGroup[0].text.substring(0, 50) + (currentGroup[0].text.length > 50 ? '...' : ''),
        messageCount: currentGroup.length,
        firstMessage: currentGroup[0],
      });
    }

    return groups.reverse(); // Mais recente primeiro
  };

  const formatGroupDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }

    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const conversations = getConversationGroups();

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay backdrop - anima opacity com ease-out para entrada e ease-in para saída */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar - anima translateX com ease-out para entrada e ease-in para saída */}
      <aside
        className={`fixed z-50 transform transition-all duration-500 ease-out 
          /* Mobile: Bottom Sheet */
          bottom-0 left-0 right-0 h-[85vh] w-full rounded-t-[32px] translate-y-full
          /* Desktop: Right Drawer */
          md:top-0 md:right-0 md:left-auto md:h-full md:w-96 md:rounded-l-[32px] md:rounded-tr-none md:translate-y-0 md:translate-x-full
          ${isAnimating 
            ? 'translate-y-0 md:translate-x-0 opacity-100' 
            : 'translate-y-full md:translate-x-full opacity-0 md:opacity-100'
          }
          bg-white/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-blue-100 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] md:shadow-2xl
        `}
      >
        {/* Mobile Handle Bar */}
        <div className="md:hidden flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header - design mais moderno e limpo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Histórico</h2>
              <p className="text-sm text-gray-500 font-medium">
                {conversations.length} {conversations.length === 1 ? 'sessão' : 'sessões'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-2xl transition-all duration-300 active:scale-90"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100%-180px)] custom-scrollbar">
          {conversations.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-8 py-10 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg
                  className="w-12 h-12 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Sem conversas recentes</h3>
              <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                Suas interações aparecerão aqui para você retomar de onde parou.
              </p>
            </div>
          ) : (
            /* Conversations List */
            <div className="py-4 px-4 space-y-3">
              {conversations.map((conversation, index) => (
                <div
                  key={index}
                  className="p-4 bg-white hover:bg-blue-50/50 rounded-[24px] border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_20px_-8px_rgba(59,130,246,0.12)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">
                          {conversation.date}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-gray-400">
                            {formatTime(conversation.firstMessage.timestamp)}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-[11px] font-semibold text-gray-400">
                            {conversation.messageCount} msgs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 bg-gray-50 group-hover:bg-blue-100 rounded-lg transition-colors">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed group-hover:text-gray-900 transition-colors">
                    {conversation.preview}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Botão de Nova Conversa e Limpar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 space-y-3">
          <button className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nova Conversa
          </button>
          
          <button className="w-full py-3 px-4 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group border border-transparent hover:border-red-100">
            <svg
              className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Limpar tudo
          </button>
        </div>
      </aside>
    </>
  );
}
