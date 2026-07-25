import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialText?: string;
}

export default function ChatInput({ onSend, disabled = false, placeholder = "Ask a question about your data...", initialText }: ChatInputProps) {
  const [input, setInput] = useState(() => {
    return sessionStorage.getItem('chat_draft') || '';
  });

  // Save draft to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('chat_draft', input);
  }, [input]);

  // Append initialText if provided
  useEffect(() => {
    if (initialText) {
      setInput(prev => (prev ? `${prev} ${initialText}` : initialText));
    }
  }, [initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center border border-gray-300 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-main focus-within:border-primary-main transition-shadow">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full py-4 pl-4 pr-12 bg-transparent outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="absolute right-2 p-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary-main transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
