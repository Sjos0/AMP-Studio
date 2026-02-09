'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { SendIcon } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
}

export default function InputArea({ onSendMessage }: InputAreaProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    onSendMessage(inputText.trim());
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3 pb-safe">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-800 placeholder-gray-500"
          />
        </div>

        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={inputText.trim() === ''}
          className={`rounded-full transition-all ${
            inputText.trim() === ''
              ? 'bg-gray-200 text-gray-400 hover:bg-gray-200'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
          }`}
        >
          <SendIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
