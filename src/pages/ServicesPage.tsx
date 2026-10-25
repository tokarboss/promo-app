import React, { useState } from 'react';
import { Clock, ArrowUpRight, Sparkles, Search } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BookingModal } from '../components/BookingModal';
import { AiAssistantSheet } from '../components/AiAssistantSheet';

export const ServicesPage: React.FC = () => {
  const { config } = useStudio();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const categories = ['Все', ...Array.from(new Set(config.services.map((s) => s.category)))];

  const filtered = config.services.filter((s) => {
    const matchesCategory = selectedCategory === 'Все' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Услуги и прайс</h1>
        <p className="text-xs text-[#8E95A5] mt-1">Бокс бронируется ровно на длительность выбранной услуги.</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск услуги..." className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#13161B] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4F7DF3]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button key={cat} type="button" onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-[#4F7DF3] border-[#4F7DF3] text-white' : 'bg-[#13161B] border-white/[0.08] text-[#8E95A5] hover:text-white'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#13161B] border border-white/[0.07] text-center text-sm text-[#8E95A5]">По вашему запросу услуг не найдено.</div>
      ) : (
        <div id="tour-services-list" className="space-y-3">
          {filtered.map((srv) => (
            <div key={srv.id} className="p-5 rounded-[24px] bg-[#13161B] border border-white/[0.08] flex flex-col justify-between gap-4 hover:border-white/20 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#8E95A5]">{srv.category}</span><span className="inline-flex items-center gap-1 text-xs text-[#8E95A5]"><Clock className="w-3.5 h-3.5" />{srv.durationHours} ч</span></div>
                <h2 className="text-lg font-bold text-white">{srv.title}</h2>
                <p className="text-xs text-[#8E95A5] leading-relaxed">{srv.description}</p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div><div className="text-[11px] text-[#8E95A5]">Стоимость</div><div className="text-lg font-bold text-white">{srv.pricePrefix ? 'от ' : ''}{srv.price.toLocaleString('ru-RU')} ₽</div></div>
                <button type="button" onClick={() => { setBookingServiceId(srv.id); setBookingOpen(true); }} className="px-4 py-2.5 rounded-xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-all"><span>Выбрать слот</span><ArrowUpRight className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setAiOpen(true)} className="w-full p-4 rounded-2xl bg-[#13161B] border border-[#4F7DF3]/30 flex items-center justify-between text-left">
        <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-[#4F7DF3]" /><div><div className="text-sm font-semibold text-white">Не знаете, что выбрать?</div><div className="text-xs text-[#8E95A5]">Спросите ИИ-помощника студии</div></div></div>
        <ArrowUpRight className="w-4 h-4 text-[#4F7DF3]" />
      </button>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} initialServiceId={bookingServiceId} />
      <AiAssistantSheet isOpen={aiOpen} onClose={() => setAiOpen(false)} onSelectSlotFromAi={(srvId) => { setBookingServiceId(srvId); setBookingOpen(true); }} />
    </div>
  );
};