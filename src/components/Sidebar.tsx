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
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - design azul consistente com o app */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
              <h2 className="text-lg font-semibold text-white">Histórico</h2>
              <p className="text-xs text-blue-100">
                {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors group"
          >
            <svg
              className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300"
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
        <div className="flex-1 overflow-y-auto h-[calc(100%-80px)]">
          {conversations.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-5 py-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-blue-400"
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
              <h3 className="text-gray-700 font-medium mb-2">Nenhuma conversa ainda</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Suas conversas aparecerão aqui. Comece a conversar para ver o histórico!
              </p>
            </div>
          ) : (
            /* Conversations List */
            <div className="py-3">
              {conversations.map((conversation, index) => (
                <div
                  key={index}
                  className="mx-3 mb-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        conversation.firstMessage.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={conversation.firstMessage.sender === 'user'
                              ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              : "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            }
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {conversation.date}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">
                            {conversation.messageCount} {conversation.messageCount === 1 ? 'mensagem' : 'mensagens'}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.firstMessage.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-800 transition-colors">
                    {conversation.preview}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <button className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-50 hover:to-gray-100 text-gray-600 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group">
            <svg
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Limpar histórico
          </button>
        </div>
      </aside>
    </>
  );
}
