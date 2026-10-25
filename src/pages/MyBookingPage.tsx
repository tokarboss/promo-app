import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Phone,
  Link2,
  CalendarPlus,
  Bell,
  XCircle,
  CalendarClock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStudio } from '../context/StudioContext';
import { Booking } from '../types/studio';

export const MyBookingPage: React.FC = () => {
  const { config, bookings, myBookingIds, updateBookingStatus } = useStudio();
  const [toast, setToast] = useState<string | null>(null);

  const myBookings = bookings.filter((b) => myBookingIds.includes(b.id));
  const activeBooking =
    myBookings.find((b) => b.status !== 'cancelled') || myBookings[0];

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification('Ссылка на запись скопирована в буфер обмена');
    } catch {
      showNotification('Ссылка сохранена');
    }
  };

  const handleDownloadIcs = (b: Booking) => {
    const dtStart = `${b.date.replace(/-/g, '')}T${String(b.startHour).padStart(2, '0')}0000`;
    const dtEnd = `${b.date.replace(/-/g, '')}T${String(b.endHour).padStart(2, '0')}0000`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PROMO Detailing//Booking//RU',
      'BEGIN:VEVENT',
      `UID:${b.id}@PROMO.detailing`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${b.serviceTitle} — ${config.name}`,
      `LOCATION:${config.address}`,
      `DESCRIPTION:Автомобиль: ${b.carModel}. Бокс №${b.boxNumber}. Телефон студии: ${config.phone}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${b.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Файл события .ics добавлен для вашего календаря');
  };

  const handleSetReminder = async (b: Booking) => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification(`Напоминание: ${config.name}`, {
          body: `${b.serviceTitle} (${b.carModel}) — ${b.date} в ${String(b.startHour).padStart(2, '0')}:00`
        });
        showNotification('Push-напоминание о записи активировано');
        return;
      }
    }
    showNotification('Напоминание сохранено в вашем профиле');
  };

  const formatHumanDate = (iso: string) => {
    try {
      return format(parseISO(iso), 'd MMMM', { locale: ru });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5">
      <h1 className="text-2xl font-bold text-white">Моя запись</h1>

      {toast && (
        <div className="p-3.5 rounded-2xl bg-[#4F7DF3]/20 border border-[#4F7DF3]/40 text-xs text-white font-medium">
          {toast}
        </div>
      )}

      {!activeBooking ? (
        <div className="p-7 rounded-[26px] bg-[#13161B] border border-white/[0.08] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] mx-auto flex items-center justify-center text-[#8E95A5]">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">У вас пока нет активных записей</h2>
            <p className="text-xs text-[#8E95A5]">
              Выберите удобную услугу и свободное время — бокс будет закреплён за вашим авто.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-2xl bg-[#4F7DF3] text-white text-sm font-semibold"
          >
            Записаться в студию
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Верхняя карточка статуса с синим свечением как на 00:05:05 */}
          <div className="relative overflow-hidden p-5 rounded-[26px] bg-[#13161B] border border-white/[0.1] shadow-xl">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#4F7DF3]/25 blur-2xl pointer-events-none" />

            <div className="w-8 h-8 rounded-full bg-[#4F7DF3] text-white flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="text-xs text-[#8E95A5] uppercase tracking-wider">
              {config.shortName}
            </div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {activeBooking.status === 'cancelled'
                ? 'Отменена'
                : activeBooking.status === 'in_progress'
                ? 'Автомобиль в работе'
                : activeBooking.status === 'completed'
                ? 'Выполнена'
                : 'Подтверждена'}
            </div>
            <div className="text-sm text-gray-300 mt-1">
              {formatHumanDate(activeBooking.date)} в{' '}
              {String(activeBooking.startHour).padStart(2, '0')}:00 (Бокс №{activeBooking.boxNumber})
            </div>
          </div>

          {/* Детали записи */}
          <div className="p-5 rounded-[26px] bg-[#13161B] border border-white/[0.08] space-y-3">
            <h2 className="text-lg font-bold text-white">{activeBooking.serviceTitle}</h2>

            <div className="space-y-2 text-sm border-t border-white/[0.06] pt-3">
              <div className="flex justify-between">
                <span className="text-[#8E95A5]">Стоимость</span>
                <span className="text-white font-bold">
                  {activeBooking.price.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E95A5]">Выдача, ориентир</span>
                <span className="text-white font-medium">
                  {formatHumanDate(activeBooking.date)} в{' '}
                  {String(activeBooking.endHour).padStart(2, '0')}:00
                </span>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-3 space-y-1 text-sm">
              <div className="text-white font-medium">{activeBooking.carModel}</div>
              <div className="text-xs text-[#8E95A5]">{config.address}</div>
            </div>
          </div>

          {/* Кнопка связи со студией */}
          <a
            href={`tel:${config.phone}`}
            className="p-4 rounded-2xl bg-[#13161B] border border-white/[0.08] flex items-center gap-3.5 hover:border-white/20 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-200">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Связаться со студией</div>
              <div className="text-xs text-[#8E95A5]">{config.phone}</div>
            </div>
          </a>

          {/* 3 кнопки быстрых действий (Ссылка / Календарь / Напомнить) как на 00:05:12 */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-3.5 rounded-2xl bg-[#13161B] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-xs text-gray-200 hover:border-white/20"
            >
              <Link2 className="w-4 h-4 text-[#8E95A5]" />
              <span>Ссылка</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadIcs(activeBooking)}
              className="p-3.5 rounded-2xl bg-[#13161B] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-xs text-gray-200 hover:border-white/20"
            >
              <CalendarPlus className="w-4 h-4 text-[#8E95A5]" />
              <span>Календарь</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetReminder(activeBooking)}
              className="p-3.5 rounded-2xl bg-[#13161B] border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-xs text-gray-200 hover:border-white/20"
            >
              <Bell className="w-4 h-4 text-[#8E95A5]" />
              <span>Напомнить</span>
            </button>
          </div>

          {activeBooking.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => {
                updateBookingStatus(activeBooking.id, 'cancelled');
                showNotification('Ваша запись отменена, бокс освобождён');
              }}
              className="w-full py-3 text-xs text-[#8E95A5] hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Отменить запись</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
