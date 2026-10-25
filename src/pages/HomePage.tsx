import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Calendar,
  Tag,
  ArrowUpRight,
  Sparkles,
  Download,
  MapPin,
  Phone,
  Clock
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BrandLogo } from '../components/Header';
import { BookingModal } from '../components/BookingModal';
import { AiAssistantSheet } from '../components/AiAssistantSheet';

export const HomePage: React.FC = () => {
  const { config } = useStudio();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [preselectedHour, setPreselectedHour] = useState<number | undefined>(undefined);
  const [aiOpen, setAiOpen] = useState(false);

  const minPrice =
    config.services.length > 0
      ? Math.min(...config.services.map((s) => s.price))
      : 3500;

  const openBookingWith = (serviceId?: string, hour?: number) => {
    setPreselectedServiceId(serviceId);
    setPreselectedHour(hour);
    setBookingOpen(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-28 space-y-6">
      {/* HERO-БЛОК С АВТОМОБИЛЕМ И КНОПКОЙ ЗАПИСАТЬСЯ */}
      <section className="space-y-4">
        <div className="relative rounded-[26px] overflow-hidden bg-[#13161B] border border-white/[0.08] aspect-[16/10] shadow-2xl">
          <img
            src={config.heroImage}
            alt={config.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => openBookingWith()}
              className="px-5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-sm hover:bg-white/25 transition-all"
            >
              Записаться
            </button>
            <button
              type="button"
              onClick={() => openBookingWith()}
              aria-label="Открыть форму записи"
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{config.name}</h1>
          <p className="text-sm text-[#8E95A5] mt-1 leading-relaxed">{config.tagline}</p>
        </div>

        {/* БЕНТО-СЕТКА СТАТИСТИКИ СТУДИИ (2 + 1) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-4 rounded-2xl bg-[#13161B] border border-white/[0.07]">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Wrench className="w-4 h-4 text-[#8E95A5]" />
              <span>{config.services.length}</span>
            </div>
            <div className="text-xs text-[#8E95A5] mt-1">услуг в прайсе</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#13161B] border border-white/[0.07]">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Calendar className="w-4 h-4 text-[#8E95A5]" />
              <span>{config.boxesCount}</span>
            </div>
            <div className="text-xs text-[#8E95A5] mt-1">бокса в работе</div>
          </div>

          <div className="col-span-2 px-4 py-3.5 rounded-2xl bg-[#13161B] border border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Tag className="w-4 h-4 text-[#8E95A5]" />
              <span>от {minPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
            <span className="text-xs text-[#8E95A5]">за услугу</span>
          </div>
        </div>
      </section>

      {/* РАЗДЕЛ: ЗАПИСЬ В СТУДИЮ */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Запись в студию</h2>

        {/* Основная карточка быстрой записи */}
        <div className="p-5 rounded-[24px] bg-[#13161B] border border-white/[0.08] space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">{config.showcaseTitle}</h3>
            <p className="text-xs text-[#8E95A5] mt-1 leading-relaxed">
              {config.showcaseSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openBookingWith()}
            className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4F7DF3]/20 transition-all"
          >
            <span>Выбрать время</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Карточка записи через ИИ-ассистента */}
        <div className="p-5 rounded-[24px] bg-[#13161B] border border-white/[0.08] space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4F7DF3]/15 border border-[#4F7DF3]/30 flex items-center justify-center text-[#4F7DF3] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Запись с ИИ</h3>
              <p className="text-xs text-[#8E95A5] mt-0.5 leading-relaxed">
                Подберёт услугу для автомобиля и покажет актуальное время.
              </p>
            </div>
          </div>

          <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="w-full py-2 flex items-center justify-between text-sm font-semibold text-white hover:text-[#4F7DF3] transition-colors"
            >
              <span>Подобрать услугу</span>
              <ArrowUpRight className="w-4 h-4 text-[#8E95A5]" />
            </button>
          </div>
        </div>
      </section>

      {/* ГАЛЕРЕЯ РАБОТ СТУДИИ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Примеры работ</h2>
          <Link to="/services" className="text-xs text-[#4F7DF3] hover:underline">
            Все услуги →
          </Link>
        </div>

        <div className="space-y-3">
          {config.portfolio.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] overflow-hidden bg-[#13161B] border border-white/[0.07]"
            >
              <div className="aspect-[16/10] bg-[#181C23] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">{item.title}</div>
                  <div className="text-[11px] text-[#8E95A5]">{item.category}</div>
                </div>
                <button
                  type="button"
                  onClick={() => openBookingWith()}
                  className="text-xs text-[#4F7DF3] font-medium hover:underline"
                >
                  Записаться
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* БАННЕР УСТАНОВКИ PWA ("СТУДИЯ ВСЕГДА ПОД РУКОЙ") */}
      <section className="p-5 rounded-[26px] bg-[#13161B] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <div className="font-bold text-white text-sm">{config.shortName}</div>
            <div className="text-xs text-[#8E95A5]">Приложение студии</div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Студия всегда под рукой.</h2>
          <p className="text-xs text-[#8E95A5] mt-1 leading-relaxed">
            Записывайтесь за несколько касаний, без поиска ссылки и звонков.
          </p>
        </div>

        <Link
          to="/install"
          className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4F7DF3]/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Добавить на экран →</span>
        </Link>

        <p className="text-[11px] text-[#8E95A5] text-center">
          Бесплатно. Установка через браузер за несколько секунд.
        </p>
      </section>

      {/* КОНТАКТНЫЙ ФУТЕР СТУДИИ */}
      <section className="p-4 rounded-2xl bg-[#13161B] border border-white/[0.06] space-y-2 text-xs text-[#8E95A5]">
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-[#4F7DF3] shrink-0" />
          <span>{config.address}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-[#4F7DF3] shrink-0" />
          <span>
            Ежедневно с {String(config.workStartHour).padStart(2, '0')}:00 до{' '}
            {String(config.workEndHour).padStart(2, '0')}:00
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Phone className="w-4 h-4 text-[#4F7DF3] shrink-0" />
          <a href={`tel:${config.phone}`} className="hover:text-white">
            {config.phone}
          </a>
        </div>
      </section>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialServiceId={preselectedServiceId}
        initialHour={preselectedHour}
      />

      <AiAssistantSheet
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onSelectSlotFromAi={(srvId, hr) => openBookingWith(srvId, hr)}
      />
    </div>
  );
};
