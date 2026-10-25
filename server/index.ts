import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { allocateBoxForBooking, getAvailableSlotsForDate } from '../src/lib/scheduler';
import { Booking, StudioConfig } from '../src/types/studio';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const DATA_FILE = path.resolve(process.cwd(), 'server/db.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';

interface DatabaseSchema {
  config: StudioConfig;
  bookings: Booking[];
  sessions: string[];
}

const defaultDatabase: DatabaseSchema = {
  config: {
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
  },
  bookings: [],
  sessions: []
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDatabase, null, 2), 'utf-8');
      return defaultDatabase;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return defaultDatabase;
  }
}

function writeDb(data: DatabaseSchema) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startHour: z.number().int().min(0).max(23),
  clientName: z.string().min(2),
  clientPhone: z.string().min(6),
  clientEmail: z.string().email().optional().or(z.literal('')),
  carModel: z.string().min(2)
});

app.get('/api/studio', (_req, res) => {
  const db = readDb();
  res.json({
    config: db.config,
    bookings: db.bookings
  });
});

app.post('/api/bookings', (req, res) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверьте правильность заполнения полей', details: parsed.error.flatten() });
  }

  const db = readDb();
  const { serviceId, date, startHour, clientName, clientPhone, clientEmail, carModel } = parsed.data;
  const service = db.config.services.find((s) => s.id === serviceId);

  if (!service) {
    return res.status(404).json({ error: 'Услуга не найдена' });
  }

  const allocatedBox = allocateBoxForBooking(
    date,
    startHour,
    service.durationHours,
    db.config,
    db.bookings
  );

  if (!allocatedBox) {
    return res.status(409).json({
      error: 'Выбранное время уже занято во всех боксах. Пожалуйста, выберите другое окно.'
    });
  }

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    serviceId: service.id,
    serviceTitle: service.title,
    durationHours: service.durationHours,
    price: service.price,
    date,
    startHour,
    endHour: startHour + service.durationHours,
    boxNumber: allocatedBox,
    clientName,
    clientPhone,
    clientEmail: clientEmail || undefined,
    carModel,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  writeDb(db);

  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();
  const booking = db.bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }

  booking.status = status;
  writeDb(db);
  res.json(booking);
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль владельца' });
  }
  const token = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const db = readDb();
  db.sessions.push(token);
  writeDb(db);
  res.json({ token });
});

app.put('/api/admin/config', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const db = readDb();

  if (!token || !db.sessions.includes(token)) {
    return res.status(401).json({ error: 'Требуется авторизация владельца' });
  }

  db.config = { ...db.config, ...req.body };
  writeDb(db);
  res.json(db.config);
});

app.post('/api/ai/chat', async (req, res) => {
  const { message, date } = req.body;
  const db = readDb();
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.clodex.ai/v1';
  const model = process.env.AI_MODEL || 'claude-3-5-sonnet-latest';

  const slotsSummary = db.config.services.map((srv) => {
    const free = getAvailableSlotsForDate(targetDate, srv.durationHours, db.config, db.bookings)
      .filter((s) => s.available)
      .map((s) => s.timeLabel);
    return `${srv.title} (${srv.durationHours} ч, ${srv.pricePrefix ? 'от ' : ''}${srv.price} ₽): свободные окна на ${targetDate} -> ${free.join(', ') || 'нет окон'}`;
  });

  if (apiKey && apiKey !== 'your_api_key_here') {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `Ты вежливый AI-помощник студии детейлинга ${db.config.name}. Адрес: ${db.config.address}, телефон: ${db.config.phone}. График: ${db.config.workStartHour}:00 - ${db.config.workEndHour}:00. Боксов: ${db.config.boxesCount}. Доступные услуги и слоты:\n${slotsSummary.join('\n')}\nОтвечай кратко, по делу, предлагай конкретную услугу и свободное время.`
            },
            { role: 'user', content: String(message) }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.json({ reply, suggestedServiceId: db.config.services[0]?.id });
        }
      }
    } catch (err) {
      console.error('External AI API error, using built-in smart scheduler:', err);
    }
  }

  // Умный локальный разбор запроса по реальному расписанию и прайсу студии
  const q = String(message || '').toLowerCase();
  const firstService = db.config.services[0];
  const freeSlots = firstService
    ? getAvailableSlotsForDate(targetDate, firstService.durationHours, db.config, db.bookings).filter((s) => s.available)
    : [];

  if (q.includes('услуг') || q.includes('цен') || q.includes('прайс') || q.includes('сколько')) {
    const list = db.config.services
      .map((s) => `• ${s.title} (${s.durationHours} ч) — ${s.pricePrefix ? 'от ' : ''}${s.price.toLocaleString('ru-RU')} ₽`)
      .join('\n');
    return res.json({
      reply: `Актуальный прайс студии ${db.config.name}:\n${list}\n\nКакую услугу оформим для вашего авто?`,
      suggestedServiceId: firstService?.id
    });
  }

  if (q.includes('адрес') || q.includes('найти') || q.includes('где') || q.includes('контакт')) {
    return res.json({
      reply: `Мы находимся по адресу: ${db.config.address}.\nРаботаем ежедневно с ${String(db.config.workStartHour).padStart(2, '0')}:00 до ${String(db.config.workEndHour).padStart(2, '0')}:00. Телефон студии: ${db.config.phone}.`
    });
  }

  if (q.includes('мойк') || q.includes('окн') || q.includes('завтра') || q.includes('запис') || q.includes('после')) {
    const serviceNames = db.config.services.map((s) => s.title.toLowerCase()).join(', ');
    const nearest = freeSlots.slice(0, 4).map((s) => s.timeLabel).join(', ');
    return res.json({
      reply: `Записать могу, но сначала уточните, пожалуйста, услугу: ${serviceNames}?\n\nБлижайшие свободные окна по расписанию боксов: ${nearest || 'на выбранную дату все боксы заняты'}. Нажмите кнопку быстрого выбора ниже, чтобы забронировать слот.`,
      suggestedServiceId: firstService?.id,
      suggestedHour: freeSlots[0]?.hour
    });
  }

  return res.json({
    reply: `Я помощник студии ${db.config.name}. Подскажу цены, свободные окна в ${db.config.boxesCount} боксах и помогу записаться без звонков. Напишите, например: «Хочу мойку завтра после 14:00» или выберите быстрый вопрос выше.`,
    suggestedServiceId: firstService?.id
  });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`SGX Studio Server running on http://localhost:${PORT}`);
});
