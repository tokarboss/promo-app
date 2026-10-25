import React, { useState, useMemo } from 'react';
import { X, ArrowUpRight, ArrowLeft, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStudio } from '../context/StudioContext';
import { getAvailableSlotsForDate } from '../lib/scheduler';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  initialHour?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
  initialHour
}) => {
  const { config, bookings, createBooking } = useStudio();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialServiceId ? 2 : 1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || config.services[0]?.id || ''
  );

  const upcomingDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(base, i);
      return {
        iso: format(d, 'yyyy-MM-dd'),
        dayShort: format(d, 'EEEEEE', { locale: ru }),
        dayNum: format(d, 'd'),
        fullLabel: format(d, 'd MMM yyyy г.', { locale: ru }),
        humanDate: format(d, 'd MMMM', { locale: ru })
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(upcomingDays[0].iso);
  const [selectedHour, setSelectedHour] = useState<number | null>(initialHour ?? null);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedService =
    config.services.find((s) => s.id === selectedServiceId) || config.services[0];

  const slots = selectedService
    ? getAvailableSlotsForDate(selectedDate, selectedService.durationHours, config, bookings)
    : [];

  const availableSlots = slots.filter((s) => s.available);
  const selectedDayObj = upcomingDays.find((d) => d.iso === selectedDate) || upcomingDays[0];

  const handleSelectService = (id: string) => {
    setSelectedServiceId(id);
    setSelectedHour(null);
    setStep(2);
  };

  const handleProceedToStep3 = () => {
    if (selectedHour === null) {
      setErrorMsg('Выберите удобное время начала записи');
      return;
    }
    setErrorMsg(null);
    setStep(3);
  };

  const handleProceedToStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName.trim().length < 2) {
      setErrorMsg('Укажите ваше имя (минимум 2 символа)');
      return;
    }
    if (clientPhone.replace(/\D/g, '').length < 6) {
      setErrorMsg('Укажите корректный номер телефона для связи');
      return;
    }
    if (carModel.trim().length < 2) {
      setErrorMsg('Укажите марку и модель вашего автомобиля');
      return;
    }
    setErrorMsg(null);
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || selectedHour === null) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createBooking({
        serviceId: selectedService.id,
        date: selectedDate,
        startHour: selectedHour,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        carModel: carModel.trim()
      });
      onClose();
      navigate('/my-booking');
    } catch (err: any) {
      setErrorMsg(err.message || 'Не удалось создать запись');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles: Record<number, string> = {
    1: 'Выберите услугу',
    2: 'Дата и время',
    3: 'Ваш автомобиль',
    4: 'Проверьте запись'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#13161B] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] p-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Шапка модального окна */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">{stepTitles[step]}</h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">Шаг {step} из 4</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть окно записи"
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Индикатор прогресса из 4 сегментов как в референсе */}
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-colors ${
                idx <= step ? 'bg-[#4F7DF3]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* ШАГ 1: Выбор услуги */}
        {step === 1 && (
          <div className="space-y-2.5">
            {config.services.map((srv) => {
              const isSelected = srv.id === selectedServiceId;
              return (
                <button
                  key={srv.id}
                  onClick={() => handleSelectService(srv.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1A1E26] border-[#4F7DF3]'
                      : 'bg-[#171A21] border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white text-base">{srv.title}</div>
                    <div className="text-xs text-[#8E95A5] mt-1">{srv.durationHours} ч</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">
                      {srv.pricePrefix ? 'от ' : ''}
                      {srv.price.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs text-[#8E95A5] mt-1">
                      <span>Выбрать</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ШАГ 2: Дата и время */}
        {step === 2 && selectedService && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#181C23] border border-white/[0.06] flex items-center justify-between">
              <span className="font-medium text-sm text-white">{selectedService.title}</span>
              <span className="font-bold text-sm text-white">
                {selectedService.pricePrefix ? 'от ' : ''}
                {selectedService.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Горизонтальный ряд из 7 дней */}
            <div className="grid grid-cols-7 gap-1.5">
              {upcomingDays.map((d) => {
                const active = d.iso === selectedDate;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.iso);
                      setSelectedHour(null);
                    }}
                    className={`py-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      active
                        ? 'bg-[#4F7DF3]/20 border-[#4F7DF3] text-white font-bold'
                        : 'bg-[#171A21] border-white/[0.06] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] capitalize text-[#8E95A5]">{d.dayShort}</span>
                    <span className="text-sm mt-0.5">{d.dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs text-[#8E95A5] mb-1.5">Другая дата</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedHour(null);
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white focus:outline-none focus:border-[#4F7DF3]"
                />
              </div>
            </div>

            {availableSlots.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#171A21] border border-white/[0.06] text-xs text-[#8E95A5] text-center">
                На этот день студия закрыта или свободных окон нет.
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const active = selectedHour === slot.hour;
                    return (
                      <button
                        key={slot.hour}
                        type="button"
                        onClick={() => {
                          setSelectedHour(slot.hour);
                          setErrorMsg(null);
                        }}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          active
                            ? 'bg-[#4F7DF3] border-[#4F7DF3] text-white shadow-lg shadow-[#4F7DF3]/25'
                            : 'bg-[#171A21] border-white/[0.08] text-gray-200 hover:border-white/25'
                        }`}
                      >
                        {slot.timeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleProceedToStep3}
                disabled={selectedHour === null}
                className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Продолжить</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-xs text-[#8E95A5] hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад к услугам</span>
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: Данные клиента и авто */}
        {step === 3 && (
          <form onSubmit={handleProceedToStep4} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8E95A5] mb-1.5">Имя</label>
              <input
                type="text"
                placeholder="Например, Simon"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4F7DF3]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8E95A5] mb-1.5">Телефон</label>
              <input
                type="tel"
                placeholder="+7 999 123-45-67"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4F7DF3]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8E95A5] mb-1.5">Автомобиль</label>
              <input
                type="text"
                placeholder="Марка и модель (например, Бугатти)"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4F7DF3]"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Проверить запись</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2 text-xs text-[#8E95A5] hover:text-white flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            </div>
          </form>
        )}

        {/* ШАГ 4: Подтверждение записи */}
        {step === 4 && selectedService && selectedHour !== null && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-3">
              <div className="text-lg font-bold text-white">{selectedService.title}</div>

              <div className="space-y-2 text-sm border-t border-white/[0.06] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Заезд</span>
                  <span className="text-white font-medium">
                    {selectedDayObj.humanDate} в {String(selectedHour).padStart(2, '0')}:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Выдача, ориентир</span>
                  <span className="text-white font-medium">
                    {selectedDayObj.humanDate} в{' '}
                    {String(selectedHour + selectedService.durationHours).padStart(2, '0')}:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Стоимость</span>
                  <span className="text-white font-bold">
                    {selectedService.pricePrefix ? 'от ' : ''}
                    {selectedService.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-3 space-y-1 text-sm">
                <div className="text-white font-medium">
                  {clientName} / {carModel}
                </div>
                <div className="text-[#8E95A5]">{clientPhone}</div>
                <div className="text-[#8E95A5] text-xs">{config.address}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#8E95A5] leading-relaxed">
              Отмена онлайн не позднее чем за 2 ч до заезда. Бокс резервируется строго под ваш автомобиль на {selectedService.durationHours} ч.
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4F7DF3]/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Бронируем бокс...' : 'Подтвердить запись'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-2 text-xs text-[#8E95A5] hover:text-white flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Изменить данные</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
