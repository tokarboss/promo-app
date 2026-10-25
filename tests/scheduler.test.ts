import { describe, it, expect } from 'vitest';
import { getAvailableSlotsForDate, allocateBoxForBooking } from '../src/lib/scheduler';
import { StudioConfig, Booking } from '../src/types/studio';

const mockConfig: StudioConfig = {
  name: 'SGX Detailing',
  shortName: 'SGX',
  tagline: 'Детейлинг, который возвращает кузову глубину, а салону — чистоту',
  phone: '+79990000000',
  address: 'Москва, Примерная улица, 12',
  boxesCount: 2,
  workStartHour: 9,
  workEndHour: 18,
  closedDates: ['2026-09-25'],
  heroImage: '',
  logoType: 'bars',
  logoLetter: 'S',
  logoColor: '#4F7DF3',
  showcaseTitle: 'Свежий вид для вашего авто',
  showcaseSubtitle: 'Выберите услугу и удобное время — остальное возьмём на себя.',
  services: [],
  portfolio: []
};

describe('Scheduler & Box Allocation Logic', () => {
  it('returns empty slots on a closed studio date', () => {
    const slots = getAvailableSlotsForDate('2026-09-25', 2, mockConfig, []);
    expect(slots).toHaveLength(0);
  });

  it('allocates box 1 when no bookings exist', () => {
    const box = allocateBoxForBooking('2026-09-30', 12, 2, mockConfig, []);
    expect(box).toBe(1);
  });

  it('allocates box 2 when box 1 is occupied during overlapping hours', () => {
    const existing: Booking[] = [
      {
        id: 'b1',
        serviceId: 's1',
        serviceTitle: 'Комплексная мойка',
        durationHours: 2,
        price: 3500,
        date: '2026-09-30',
        startHour: 11,
        endHour: 13,
        boxNumber: 1,
        clientName: 'Simon',
        clientPhone: '+79991112233',
        carModel: 'Бугатти',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ];

    const box = allocateBoxForBooking('2026-09-30', 12, 2, mockConfig, existing);
    expect(box).toBe(2);
  });

  it('prevents double booking when all boxes are occupied', () => {
    const existing: Booking[] = [
      {
        id: 'b1',
        serviceId: 's1',
        serviceTitle: 'Комплексная мойка',
        durationHours: 3,
        price: 3500,
        date: '2026-09-30',
        startHour: 12,
        endHour: 15,
        boxNumber: 1,
        clientName: 'Client 1',
        clientPhone: '+79990000001',
        carModel: 'Porsche',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'b2',
        serviceId: 's1',
        serviceTitle: 'Химчистка салона',
        durationHours: 4,
        price: 12000,
        date: '2026-09-30',
        startHour: 11,
        endHour: 15,
        boxNumber: 2,
        clientName: 'Client 2',
        clientPhone: '+79990000002',
        carModel: 'BMW',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ];

    const box = allocateBoxForBooking('2026-09-30', 12, 2, mockConfig, existing);
    expect(box).toBeNull();
  });
});
