import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, CalendarCheck2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const BottomNav: React.FC = () => {
  const { myBookingIds, bookings } = useStudio();
  const activeCount = bookings.filter(
    (b) => myBookingIds.includes(b.id) && b.status !== 'cancelled'
  ).length;

  const navItems = [
    { to: '/', label: 'Главная', icon: Home },
    { to: '/services', label: 'Услуги', icon: LayoutGrid },
    { to: '/my-booking', label: 'Моя запись', icon: CalendarCheck2, badge: activeCount }
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 z-30 pointer-events-none px-4">
      <nav
        aria-label="Основная навигация"
        className="max-w-xs mx-auto pointer-events-auto bg-[#13161B]/90 backdrop-blur-xl border border-white/[0.09] rounded-full p-1.5 shadow-2xl shadow-black/80 flex items-center justify-between"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-inner'
                    : 'text-[#8E95A5] hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#4F7DF3]' : ''}`} />
                    {item.badge ? (
                      <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#4F7DF3] text-[10px] font-bold text-white flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-[#4F7DF3]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
