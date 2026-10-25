import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  SlidersHorizontal,
  Wrench,
  Sparkles,
  Image as ImageIcon,
  Camera,
  X,
  Car,
  Trash2,
  Check
} from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStudio } from '../context/StudioContext';
import { Booking, ServiceItem } from '../types/studio';
import { BookingModal } from '../components/BookingModal';

type AdminModalType =
  | null
  | 'hours'
  | 'contacts'
  | 'showcase'
  | 'services'
  | 'logo'
  | 'hero'
  | 'portfolio';

export const OwnerAdminPage: React.FC = () => {
  const { config, bookings, updateConfig, updateBookingStatus, logoutAdmin } = useStudio();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    format(new Date(), 'yyyy-MM-dd')
  );
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);
  const [addBookingOpen, setAddBookingOpen] = useState(false);
  const [configModal, setConfigModal] = useState<AdminModalType>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Локальные состояния для редактирования секций
  const [workStart, setWorkStart] = useState(config.workStartHour);
  const [workEnd, setWorkEnd] = useState(config.workEndHour);
  const [boxesCount, setBoxesCount] = useState(config.boxesCount);

  const [studioName, setStudioName] = useState(config.name);
  const [shortName, setShortName] = useState(config.shortName);
  const [phone, setPhone] = useState(config.phone);
  const [address, setAddress] = useState(config.address);

  const [tagline, setTagline] = useState(config.tagline);
  const [showcaseTitle, setShowcaseTitle] = useState(config.showcaseTitle);
  const [showcaseSubtitle, setShowcaseSubtitle] = useState(config.showcaseSubtitle);

  const [servicesDraft, setServicesDraft] = useState<ServiceItem[]>(config.services);

  const [logoType, setLogoType] = useState<'bars' | 'letter'>(config.logoType);
  const [logoLetter, setLogoLetter] = useState(config.logoLetter);
  const [logoColor, setLogoColor] = useState(config.logoColor);

  const [heroUrl, setHeroUrl] = useState(config.heroImage);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioCategory, setNewPortfolioCategory] = useState('Полировка + Керамика');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  const notifySaved = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3000);
  };

  // Фильтрация записей по выбранному режиму (День / Неделя)
  const filteredBookings = bookings.filter((b) => {
    if (viewMode === 'day') {
      return b.date === selectedDate;
    }
    return true;
  });

  const activeBookingsCount = filteredBookings.filter((b) => b.status !== 'cancelled').length;
  const completedBookings = filteredBookings.filter((b) => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((acc, b) => acc + b.price, 0);

  const shiftDate = (days: number) => {
    try {
      const next = addDays(parseISO(selectedDate), days);
      setSelectedDate(format(next, 'yyyy-MM-dd'));
    } catch {
      // ignore
    }
  };

  const formattedDateLabel = (() => {
    try {
      return format(parseISO(selectedDate), 'd MMM yyyy г.', { locale: ru });
    } catch {
      return selectedDate;
    }
  })();

  const isDayClosed = config.closedDates.includes(selectedDate);

  const toggleCloseDay = async () => {
    const nextClosed = isDayClosed
      ? config.closedDates.filter((d) => d !== selectedDate)
      : [...config.closedDates, selectedDate];
    await updateConfig({ closedDates: nextClosed });
    notifySaved(isDayClosed ? 'День открыт для онлайн-записи' : 'День закрыт для записи');
  };

  // Быстрый пресет смены бренда (как в видеоролике: SGX / CarBase / TRIADA)
  const applyBrandPreset = async (preset: 'sgx' | 'carbase' | 'triada') => {
    if (preset === 'sgx') {
      await updateConfig({
        name: 'SGX Detailing',
        shortName: 'SGX',
        logoType: 'bars',
        logoLetter: 'S',
        logoColor: '#4F7DF3',
        heroImage:
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85'
      });
    } else if (preset === 'carbase') {
      await updateConfig({
        name: 'CarBase DETAILING',
        shortName: 'CarBase',
        logoType: 'letter',
        logoLetter: 'B',
        logoColor: '#D97706',
        heroImage:
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=85'
      });
    } else {
      await updateConfig({
        name: 'TRIADA DETAILING',
        shortName: 'TRIADA',
        logoType: 'letter',
        logoLetter: 'T',
        logoColor: '#E11D48',
        heroImage:
          'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=85'
      });
    }
    notifySaved('Вывеска и оформление студии мгновенно обновлены');
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5">
      {/* Шапка Расписание + Выход точно как на кадре 00:05:41 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Расписание</h1>
          <p className="text-xs text-[#8E95A5]">{config.shortName}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logoutAdmin();
            navigate('/');
          }}
          title="Выйти из кабинета владельца"
          className="w-10 h-10 rounded-full bg-[#13161B] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {savedBanner && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Навигатор даты (< 25 сент. 2026 г. >) */}
      <div className="space-y-2">
        <div className="text-xs text-[#8E95A5]">Дата</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            aria-label="Предыдущий день"
            className="w-12 h-11 rounded-2xl bg-[#13161B] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 h-11 rounded-2xl bg-[#13161B] border border-white/[0.08] flex items-center justify-center text-sm font-medium text-white">
            {formattedDateLabel}
          </div>

          <button
            type="button"
            onClick={() => shiftDate(1)}
            aria-label="Следующий день"
            className="w-12 h-11 rounded-2xl bg-[#13161B] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Переключатель День / Неделя */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`h-10 rounded-2xl text-xs font-semibold border transition-all ${
              viewMode === 'day'
                ? 'bg-[#4F7DF3] border-[#4F7DF3] text-white'
                : 'bg-[#13161B] border-white/[0.08] text-gray-300'
            }`}
          >
            День
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`h-10 rounded-2xl text-xs font-semibold border transition-all ${
              viewMode === 'week'
                ? 'bg-[#4F7DF3] border-[#4F7DF3] text-white'
                : 'bg-[#13161B] border-white/[0.08] text-gray-300'
            }`}
          >
            Неделя
          </button>
        </div>
      </div>

      {/* 3 карточки KPI: Заезды | Выполнено | Получено */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#13161B] border border-white/[0.08]">
          <div className="text-[11px] text-[#8E95A5]">Заезды</div>
          <div className="text-xl font-bold text-white mt-1">{activeBookingsCount}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#13161B] border border-white/[0.08]">
          <div className="text-[11px] text-[#8E95A5]">Выполнено</div>
          <div className="text-xl font-bold text-white mt-1">{completedBookings.length}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#13161B] border border-white/[0.08]">
          <div className="text-[11px] text-[#8E95A5]">Получено</div>
          <div className="text-xl font-bold text-white mt-1">
            {totalRevenue.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {/* Сетка 8 кнопок быстрого управления студией как на 00:05:42 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setAddBookingOpen(true)}
          className="h-12 px-4 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7DF3]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить запись</span>
        </button>

        <button
          type="button"
          onClick={() => setConfigModal('hours')}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4 text-[#8E95A5]" />
          <span>Часы работы</span>
        </button>

        <button
          type="button"
          onClick={() => setConfigModal('contacts')}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4 text-[#8E95A5]" />
          <span>Контакты</span>
        </button>

        <button
          type="button"
          onClick={() => setConfigModal('showcase')}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#8E95A5]" />
          <span>Карточки витрины</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setServicesDraft(config.services);
            setConfigModal('services');
          }}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4 text-[#8E95A5]" />
          <span>Услуги</span>
        </button>

        <button
          type="button"
          onClick={() => setConfigModal('logo')}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#8E95A5]" />
          <span>Логотип</span>
        </button>

        <button
          type="button"
          onClick={() => setConfigModal('hero')}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <ImageIcon className="w-4 h-4 text-[#8E95A5]" />
          <span>Главное фото</span>
        </button>

        <button
          type="button"
          onClick={() => setConfigModal('portfolio')}
          className="h-12 px-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4 text-[#8E95A5]" />
          <span>Работы</span>
        </button>
      </div>

      {/* Быстрое переключение демо-вывесок из видео (00:06:34: CarBase / SGX / TRIADA) */}
      <div className="p-4 rounded-2xl bg-[#13161B] border border-white/[0.07] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            Быстрая смена вывески (конвейер из видео)
          </span>
          <button
            type="button"
            onClick={toggleCloseDay}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
              isDayClosed
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-white/[0.05] border-white/10 text-gray-300'
            }`}
          >
            {isDayClosed ? 'День закрыт (открыть)' : 'Закрыть этот день'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => applyBrandPreset('sgx')}
            className="py-2 px-2.5 rounded-xl bg-[#181C24] border border-white/10 text-xs font-medium text-white hover:border-[#4F7DF3]"
          >
            SGX Detailing
          </button>
          <button
            type="button"
            onClick={() => applyBrandPreset('carbase')}
            className="py-2 px-2.5 rounded-xl bg-[#181C24] border border-white/10 text-xs font-medium text-amber-400 hover:border-amber-400"
          >
            CarBase
          </button>
          <button
            type="button"
            onClick={() => applyBrandPreset('triada')}
            className="py-2 px-2.5 rounded-xl bg-[#181C24] border border-white/10 text-xs font-medium text-rose-400 hover:border-rose-400"
          >
            TRIADA
          </button>
        </div>
      </div>

      {/* СПИСОК ЗАПИСЕЙ В РАСПИСАНИИ */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-semibold text-[#8E95A5]">
          Записи в расписании ({filteredBookings.length})
        </h2>

        {filteredBookings.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#13161B] border border-white/[0.07] text-center text-xs text-[#8E95A5]">
            На выбранный период записей пока нет. Нажмите «+ Добавить запись», чтобы занять слот.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBookingModal(b)}
              className="w-full text-left p-4 rounded-2xl bg-[#13161B] border border-white/[0.08] hover:border-[#4F7DF3]/50 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{b.carModel}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8E95A5]">
                    Бокс №{b.boxNumber}
                  </span>
                </div>
                <div className="text-xs text-gray-300">{b.serviceTitle}</div>
                <div className="text-[11px] text-[#8E95A5]">
                  {b.date} • {String(b.startHour).padStart(2, '0')}:00 →{' '}
                  {String(b.endHour).padStart(2, '0')}:00 • {b.clientName} ({b.clientPhone})
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {b.price.toLocaleString('ru-RU')} ₽
                </div>
                <span
                  className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    b.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : b.status === 'in_progress'
                      ? 'bg-[#4F7DF3]/20 text-[#4F7DF3]'
                      : b.status === 'cancelled'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-white/10 text-gray-200'
                  }`}
                >
                  {b.status === 'completed'
                    ? 'Выполнена'
                    : b.status === 'in_progress'
                    ? 'В работе'
                    : b.status === 'cancelled'
                    ? 'Отменена'
                    : 'Подтверждена'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* МОДАЛКА КАРТОЧКИ ЗАКАЗА (как на 00:05:45 "Бугатти — Комплексная мойка") */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#13161B] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{activeBookingModal.carModel}</h3>
              <button
                type="button"
                onClick={() => setActiveBookingModal(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-300">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {activeBookingModal.serviceTitle}
                </div>
                <div className="text-xs text-[#8E95A5]">
                  {activeBookingModal.status === 'in_progress'
                    ? 'Автомобиль в работе'
                    : activeBookingModal.status === 'completed'
                    ? 'Выполнена'
                    : activeBookingModal.status === 'cancelled'
                    ? 'Отменена'
                    : 'Подтверждена'}{' '}
                  • Бокс №{activeBookingModal.boxNumber}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-sm border-t border-white/[0.07] pt-3">
              <div className="text-white font-medium">
                {activeBookingModal.clientName}{' '}
                <a
                  href={`tel:${activeBookingModal.clientPhone}`}
                  className="text-[#4F7DF3] hover:underline"
                >
                  {activeBookingModal.clientPhone}
                </a>
              </div>
              <div className="text-xs text-[#8E95A5]">
                {activeBookingModal.date} в {String(activeBookingModal.startHour).padStart(2, '0')}
                :00 → {activeBookingModal.date} в{' '}
                {String(activeBookingModal.endHour).padStart(2, '0')}:00
              </div>
              <div className="text-base font-bold text-white pt-1">
                {activeBookingModal.price.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await updateBookingStatus(activeBookingModal.id, 'in_progress');
                  setActiveBookingModal(null);
                  notifySaved('Статус изменён: Автомобиль в работе');
                }}
                className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-sm transition-all"
              >
                Автомобиль в работе
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updateBookingStatus(activeBookingModal.id, 'completed');
                    setActiveBookingModal(null);
                    notifySaved('Заказ завершён и добавлен в выручку');
                  }}
                  className="h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                >
                  Выполнено
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateBookingStatus(activeBookingModal.id, 'cancelled');
                    setActiveBookingModal(null);
                    notifySaved('Запись отменена, бокс освобождён');
                  }}
                  className="h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold"
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЫЕ ОКНА НАСТРОЕК СТУДИИ (Услуги, Часы, Контакты, Витрина, Лого, Фото) */}
      {configModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#13161B] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] p-5 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {configModal === 'hours' && 'Часы работы и боксы'}
                {configModal === 'contacts' && 'Контакты и вывеска'}
                {configModal === 'showcase' && 'Карточки витрины'}
                {configModal === 'services' && 'Услуги и прайс-лист'}
                {configModal === 'logo' && 'Логотип студии'}
                {configModal === 'hero' && 'Главное фото студии'}
                {configModal === 'portfolio' && 'Примеры работ'}
              </h3>
              <button
                type="button"
                onClick={() => setConfigModal(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {configModal === 'hours' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Час открытия (0–23)</label>
                  <input
                    type="number"
                    min={0}
                    max={22}
                    value={workStart}
                    onChange={(e) => setWorkStart(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Час закрытия (1–24)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={workEnd}
                    onChange={(e) => setWorkEnd(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">
                    Количество боксов в работе
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={boxesCount}
                    onChange={(e) => setBoxesCount(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await updateConfig({
                      workStartHour: workStart,
                      workEndHour: workEnd,
                      boxesCount
                    });
                    setConfigModal(null);
                    notifySaved('Часы работы и количество боксов сохранены');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm"
                >
                  Сохранить
                </button>
              </div>
            )}

            {configModal === 'contacts' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Название студии</label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">
                    Короткое название (в шапке и иконке)
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Телефон</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Адрес студии</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await updateConfig({ name: studioName, shortName, phone, address });
                    setConfigModal(null);
                    notifySaved('Контактные данные студии обновлены');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm"
                >
                  Сохранить
                </button>
              </div>
            )}

            {configModal === 'showcase' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Описание под заголовком</label>
                  <textarea
                    rows={2}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Заголовок карточки записи</label>
                  <input
                    type="text"
                    value={showcaseTitle}
                    onChange={(e) => setShowcaseTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">Подзаголовок карточки</label>
                  <textarea
                    rows={2}
                    value={showcaseSubtitle}
                    onChange={(e) => setShowcaseSubtitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await updateConfig({ tagline, showcaseTitle, showcaseSubtitle });
                    setConfigModal(null);
                    notifySaved('Тексты витрины обновлены');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm"
                >
                  Сохранить
                </button>
              </div>
            )}

            {configModal === 'services' && (
              <div className="space-y-4">
                {servicesDraft.map((srv, idx) => (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-2xl bg-[#171A21] border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={srv.title}
                        onChange={(e) => {
                          const next = [...servicesDraft];
                          next[idx] = { ...srv, title: e.target.value };
                          setServicesDraft(next);
                        }}
                        className="flex-1 h-9 px-3 rounded-lg bg-[#13161B] border border-white/10 text-xs font-bold text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setServicesDraft(servicesDraft.filter((_, i) => i !== idx))
                        }
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#8E95A5]">Цена (₽)</label>
                        <input
                          type="number"
                          value={srv.price}
                          onChange={(e) => {
                            const next = [...servicesDraft];
                            next[idx] = { ...srv, price: Number(e.target.value) };
                            setServicesDraft(next);
                          }}
                          className="w-full h-9 px-3 rounded-lg bg-[#13161B] border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8E95A5]">Длительность (ч)</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={srv.durationHours}
                          onChange={(e) => {
                            const next = [...servicesDraft];
                            next[idx] = { ...srv, durationHours: Number(e.target.value) };
                            setServicesDraft(next);
                          }}
                          className="w-full h-9 px-3 rounded-lg bg-[#13161B] border border-white/10 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setServicesDraft([
                      ...servicesDraft,
                      {
                        id: `srv-${Date.now()}`,
                        title: 'Новая услуга',
                        description: 'Профессиональный уход за автомобилем в студии.',
                        durationHours: 2,
                        price: 5000,
                        pricePrefix: false,
                        category: 'Уход'
                      }
                    ])
                  }
                  className="w-full h-10 rounded-xl bg-white/[0.06] text-xs font-medium text-gray-200 hover:bg-white/10"
                >
                  + Добавить услугу
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await updateConfig({ services: servicesDraft });
                    setConfigModal(null);
                    notifySaved('Прайс-лист и длительность услуг обновлены');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm"
                >
                  Сохранить прайс
                </button>
              </div>
            )}

            {configModal === 'logo' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoType('bars')}
                    className={`py-2.5 rounded-xl border text-xs font-medium ${
                      logoType === 'bars'
                        ? 'bg-[#4F7DF3]/20 border-[#4F7DF3] text-white'
                        : 'bg-[#171A21] border-white/10 text-gray-400'
                    }`}
                  >
                    Фирменные полосы SGX
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoType('letter')}
                    className={`py-2.5 rounded-xl border text-xs font-medium ${
                      logoType === 'letter'
                        ? 'bg-[#4F7DF3]/20 border-[#4F7DF3] text-white'
                        : 'bg-[#171A21] border-white/10 text-gray-400'
                    }`}
                  >
                    Монограмма (Буква)
                  </button>
                </div>

                {logoType === 'letter' && (
                  <>
                    <div>
                      <label className="block text-xs text-[#8E95A5] mb-1">Буква логотипа</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={logoLetter}
                        onChange={(e) => setLogoLetter(e.target.value.toUpperCase())}
                        className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8E95A5] mb-1">Цвет значка</label>
                      <input
                        type="color"
                        value={logoColor}
                        onChange={(e) => setLogoColor(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#171A21] border border-white/10 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    await updateConfig({ logoType, logoLetter, logoColor });
                    setConfigModal(null);
                    notifySaved('Логотип студии обновлён');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm"
                >
                  Сохранить
                </button>
              </div>
            )}

            {configModal === 'hero' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1">
                    URL главного фото автомобиля
                  </label>
                  <input
                    type="url"
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-black">
                  <img src={heroUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await updateConfig({ heroImage: heroUrl });
                    setConfigModal(null);
                    notifySaved('Главное фото витрины обновлено');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm"
                >
                  Сохранить фото
                </button>
              </div>
            )}

            {configModal === 'portfolio' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {config.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-[#171A21] border border-white/10 flex items-center justify-between gap-2"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#8E95A5]">{item.category}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateConfig({
                            portfolio: config.portfolio.filter((p) => p.id !== item.id)
                          })
                        }
                        className="p-1.5 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="text-xs font-semibold text-white">Добавить фото работы</div>
                  <input
                    type="text"
                    placeholder="Подпись (например, Полировка BMW M4)"
                    value={newPortfolioTitle}
                    onChange={(e) => setNewPortfolioTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#171A21] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Категория (Кузов / Салон / Плёнка)"
                    value={newPortfolioCategory}
                    onChange={(e) => setNewPortfolioCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#171A21] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Ссылка на фото (https://...)"
                    value={newPortfolioUrl}
                    onChange={(e) => setNewPortfolioUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#171A21] border border-white/10 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newPortfolioTitle || !newPortfolioUrl) return;
                      await updateConfig({
                        portfolio: [
                          ...config.portfolio,
                          {
                            id: `pf-${Date.now()}`,
                            title: newPortfolioTitle,
                            category: newPortfolioCategory,
                            imageUrl: newPortfolioUrl
                          }
                        ]
                      });
                      setNewPortfolioTitle('');
                      setNewPortfolioUrl('');
                      notifySaved('Фото работы добавлено в галерею');
                    }}
                    className="w-full h-10 rounded-xl bg-[#4F7DF3] text-white font-semibold text-xs"
                  >
                    Добавить в галерею
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BookingModal isOpen={addBookingOpen} onClose={() => setAddBookingOpen(false)} />
    </div>
  );
};
