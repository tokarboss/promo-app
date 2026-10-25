import { Booking, SlotAvailability, StudioConfig } from '../types/studio';

/**
 * Вычисляет доступные часовые слоты и свободные боксы на выбранную дату
 * с учётом длительности услуги, количества боксов и закрытых дней.
 */
export function getAvailableSlotsForDate(
  date: string,
  durationHours: number,
  config: StudioConfig,
  bookings: Booking[]
): SlotAvailability[] {
  if (config.closedDates.includes(date)) {
    return [];
  }

  const activeBookings = bookings.filter(
    (b) => b.date === date && b.status !== 'cancelled'
  );

  const slots: SlotAvailability[] = [];

  for (
    let hour = config.workStartHour;
    hour + durationHours <= config.workEndHour;
    hour++
  ) {
    const endHour = hour + durationHours;
    const freeBoxes: number[] = [];

    for (let box = 1; box <= config.boxesCount; box++) {
      const hasOverlap = activeBookings.some(
        (b) =>
          b.boxNumber === box &&
          Math.max(hour, b.startHour) < Math.min(endHour, b.endHour)
      );

      if (!hasOverlap) {
        freeBoxes.push(box);
      }
    }

    slots.push({
      hour,
      timeLabel: `${String(hour).padStart(2, '0')}:00`,
      available: freeBoxes.length > 0,
      freeBoxes
    });
  }

  return slots;
}

/**
 * Подбирает первый свободный бокс для указанного интервала времени.
 * Возвращает номер бокса (1..N) или null, если все боксы заняты.
 */
export function allocateBoxForBooking(
  date: string,
  startHour: number,
  durationHours: number,
  config: StudioConfig,
  bookings: Booking[]
): number | null {
  const slots = getAvailableSlotsForDate(date, durationHours, config, bookings);
  const targetSlot = slots.find((s) => s.hour === startHour);
  if (!targetSlot || !targetSlot.available || targetSlot.freeBoxes.length === 0) {
    return null;
  }
  return targetSlot.freeBoxes[0];
}
