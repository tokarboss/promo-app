import React, { useState } from 'react';
import { X, Send, Sparkles, CalendarPlus } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface AiAssistantSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlotFromAi: (serviceId?: string, hour?: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedServiceId?: string;
  suggestedHour?: number;
}

export const AiAssistantSheet: React.FC<AiAssistantSheetProps> = ({
  isOpen,
  onClose,
  onSelectSlotFromAi
}) => {
  const { config, askAiAssistant } = useStudio();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Здравствуйте! Я ИИ-помощник студии ${config.name}. Подскажу цены, свободные окна по боксам и запишу ваш автомобиль.`
    }
  ]);

  if (!isOpen) return null;

  const quickChips = ['Услуги', 'Когда ближайшее окно?', 'Как найти студию?'];

  const sendQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAiAssistant(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: res.reply,
          suggestedServiceId: res.suggestedServiceId,
          suggestedHour: res.suggestedHour
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#13161B] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] p-5 flex flex-col max-h-[85vh] shadow-2xl">
        {/* Заголовок */}
        <div className="flex items-start justify-between pb-3 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F7DF3]" />
              <h2 className="text-lg font-bold text-white">Помощник студии</h2>
            </div>
            <p className="text-xs text-[#8E95A5] mt-0.5">Услуги, цены и свободное время.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть помощника"
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Быстрые чипсы из видеореференса */}
        <div className="flex flex-wrap gap-2 py-3">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => sendQuery(chip)}
              className="px-3.5 py-1.5 rounded-full bg-[#1A1E26] border border-white/[0.08] text-xs font-medium text-gray-200 hover:border-[#4F7DF3] hover:text-white transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* История сообщений */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#202634] border border-white/10 text-white'
                    : 'bg-[#171A21] border border-white/[0.06] text-gray-200'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'ai' && m.suggestedServiceId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectSlotFromAi(m.suggestedServiceId, m.suggestedHour);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4F7DF3]/20 border border-[#4F7DF3]/40 text-xs font-semibold text-[#4F7DF3] hover:bg-[#4F7DF3] hover:text-white transition-all"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Перейти к оформлению слота</span>
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-xs text-[#8E95A5] animate-pulse px-2">
              Помощник проверяет свободные боксы...
            </div>
          )}
        </div>

        {/* Поле ввода */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuery(input);
          }}
          className="pt-3 mt-2 border-t border-white/[0.07]"
        >
          <label className="block text-[11px] text-[#8E95A5] mb-1.5">Сообщение</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Хочу мойку завтра после 6"
              className="flex-1 h-11 px-4 rounded-xl bg-[#171A21] border border-white/15 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4F7DF3]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Отправить сообщение"
              className="w-11 h-11 rounded-xl bg-[#4F7DF3] hover:bg-[#3B68DF] disabled:opacity-40 text-white flex items-center justify-center transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
