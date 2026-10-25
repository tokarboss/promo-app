import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus, StudioConfig } from '../types/studio';
import { allocateBoxForBooking, getAvailableSlotsForDate } from '../lib/scheduler';

interface CreateBookingInput {
  serviceId: string;
  date: string;
  startHour: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  carModel: string;
}

interface StudioContextValue {
  config: StudioConfig;
  bookings: Booking[];
  myBookingIds: string[];
  adminToken: string | null;
  isOffline: boolean;
  updateConfig: (partial: Partial<StudioConfig>) => Promise<void>;
  createBooking: (input: CreateBookingInput) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  askAiAssistant: (message: string, date?: string) => Promise<{
    reply: string;
    suggestedServiceId?: string;
    suggestedHour?: number;
  }>;
}

const DEFAULT_CONFIG: StudioConfig = {
  name: 'SGX Detailing',
  shortName: 'SGX',
  tagline: 'Детейлинг, который возвращает кузову глубину, а салону — чистоту',
  phone: '+79990000000',
  address: 'Москва, Примерная улица, 12',
  boxesCount: 3,
  workStartHour: 9,
  workEndHour: 18,
  closedDates: [],
  heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85',
  logoType: 'bars',
  logoLetter: 'S',
  logoColor: '#4F7DF3',
  showcaseTitle: 'Свежий вид для вашего авто',
  showcaseSubtitle: 'Выберите услугу и удобное время — остальное возьмём на себя.',
  services: [
    {
      id: 'srv-wash',
      title: 'Комплексная мойка',
      description: 'Двухфазная бережная мойка кузова, ковриков, проёмов и уборка салона пылесосом.',
      durationHours: 2,
      price: 3500,
      pricePrefix: false,
      category: 'Мойка и уход'
    },
    {
      id: 'srv-interior',
      title: 'Химчистка салона',
      description: 'Глубокая очистка кожи, алькантары, текстиля и пластика с консервацией поверхностей.',
      durationHours: 6,
      price: 12000,
      pricePrefix: true,
      category: 'Интерьер'
    },
    {
      id: 'srv-polish',
      title: 'Полировка и керамика',
      description: 'Восстановительная полировка ЛКП до зеркального блеска и нанесение защитного керамического состава.',
      durationHours: 8,
      price: 18000,
      pricePrefix: true,
      category: 'Кузов'
    },
    {
      id: 'srv-ppf',
      title: 'Оклейка зон риска плёнкой',
      description: 'Бронирование передней части авто антигравийной полиуретановой плёнкой.',
      durationHours: 8,
      price: 45000,
      pricePrefix: true,
      category: 'Бронеплёнка'
    }
  ],
  portfolio: [
    {
      id: 'pf-1',
      title: 'Детали кузова — Porsche 911',
      category: 'Полировка + Керамика',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'pf-2',
      title: 'Общий вид — защита полиуретаном',
      category: 'Антигравийная плёнка',
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'pf-3',
      title: 'Детейлинг салона и кожи',
      category: 'Химчистка салона',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80'
    }
  ]
};

const STORAGE_CONFIG_KEY = 'sgx_studio_config_v1';
const STORAGE_BOOKINGS_KEY = 'sgx_studio_bookings_v1';
const STORAGE_MY_BOOKINGS_KEY = 'sgx_my_booking_ids_v1';
const STORAGE_ADMIN_TOKEN_KEY = 'sgx_admin_token_v1';

const StudioContext = createContext<StudioContextValue | null>(null);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<StudioConfig>(() => {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [myBookingIds, setMyBookingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_MY_BOOKINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_ADMIN_TOKEN_KEY)
  );

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetch('/api/studio')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.config) {
          setConfig(data.config);
          localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(data.config));
        }
        if (data?.bookings) {
          setBookings(data.bookings);
          localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(data.bookings));
        }
      })
      .catch(() => {
        // Работаем с локальным кэшем при отсутствии backend-сервера
      });
  }, []);

  const updateConfig = async (partial: Partial<StudioConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(updated));

    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: adminToken ? `Bearer ${adminToken}` : ''
        },
        body: JSON.stringify(partial)
      });
    } catch {
      // Сохранено в localStorage
    }
  };

  const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    const service = config.services.find((s) => s.id === input.serviceId);
    if (!service) {
      throw new Error('Выбранная услуга не найдена');
    }

    const allocatedBox = allocateBoxForBooking(
      input.date,
      input.startHour,
      service.durationHours,
      config,
      bookings
    );

    if (!allocatedBox) {
      throw new Error('Все боксы на это время уже заняты. Выберите другой слот.');
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        const created: Booking = await response.json();
        const nextBookings = [created, ...bookings];
        setBookings(nextBookings);
        localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(nextBookings));
        const nextMy = [created.id, ...myBookingIds];
        setMyBookingIds(nextMy);
        localStorage.setItem(STORAGE_MY_BOOKINGS_KEY, JSON.stringify(nextMy));
        return created;
      }
    } catch {
      // Переход к автономному созданию записи
    }

    const localBooking: Booking = {
      id: `bk-${Date.now()}`,
      serviceId: service.id,
      serviceTitle: service.title,
      durationHours: service.durationHours,
      price: service.price,
      date: input.date,
      startHour: input.startHour,
      endHour: input.startHour + service.durationHours,
      boxNumber: allocatedBox,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      clientEmail: input.clientEmail,
      carModel: input.carModel,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    const nextBookings = [localBooking, ...bookings];
    setBookings(nextBookings);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(nextBookings));

    const nextMy = [localBooking.id, ...myBookingIds];
    setMyBookingIds(nextMy);
    localStorage.setItem(STORAGE_MY_BOOKINGS_KEY, JSON.stringify(nextMy));

    return localBooking;
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    setBookings(updated);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));

    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch {
      // Локальное обновление применено
    }
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.token);
        localStorage.setItem(STORAGE_ADMIN_TOKEN_KEY, data.token);
        return true;
      }
    } catch {
      // Проверка пароля в автономном режиме (по умолчанию admin2026)
      if (password === 'admin2026') {
        const token = 'local_admin_session';
        setAdminToken(token);
        localStorage.setItem(STORAGE_ADMIN_TOKEN_KEY, token);
        return true;
      }
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem(STORAGE_ADMIN_TOKEN_KEY);
  };

  const askAiAssistant = async (message: string, date?: string) => {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, date: targetDate })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback к клиентскому расчету по реальному расписанию
    }

    const q = message.toLowerCase();
    const firstService = config.services[0];
    const freeSlots = firstService
      ? getAvailableSlotsForDate(targetDate, firstService.durationHours, config, bookings).filter((s) => s.available)
      : [];

    if (q.includes('услуг') || q.includes('цен') || q.includes('сколько')) {
      const list = config.services
        .map((s) => `• ${s.title} (${s.durationHours} ч) — ${s.pricePrefix ? 'от ' : ''}${s.price.toLocaleString('ru-RU')} ₽`)
        .join('\n');
      return {
        reply: `Услуги и цены студии ${config.name}:\n${list}\n\nКакую услугу выберем для записи?`,
        suggestedServiceId: firstService?.id
      };
    }

    if (q.includes('найти') || q.includes('адрес') || q.includes('где')) {
      return {
        reply: `Наш адрес: ${config.address}.\nГрафик работы: ${String(config.workStartHour).padStart(2, '0')}:00 – ${String(config.workEndHour).padStart(2, '0')}:00. Телефон: ${config.phone}.`
      };
    }

    const serviceNames = config.services.map((s) => s.title.toLowerCase()).join(', ');
    const nearest = freeSlots.slice(0, 4).map((s) => s.timeLabel).join(', ');
    return {
      reply: `Записать могу, но сначала уточните, пожалуйста, услугу: ${serviceNames}?\n\nСвободные окна по боксам: ${nearest || 'на сегодня свободных окон нет'}.`,
      suggestedServiceId: firstService?.id,
      suggestedHour: freeSlots[0]?.hour
    };
  };

  return (
    <StudioContext.Provider
      value={{
        config,
        bookings,
        myBookingIds,
        adminToken,
        isOffline,
        updateConfig,
        createBooking,
        updateBookingStatus,
        loginAdmin,
        logoutAdmin,
        askAiAssistant
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
};
