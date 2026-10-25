import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle2, WifiOff } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const { config } = useStudio();
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';

  if (config.logoType === 'letter') {
    return (
      <div
        className={`${dim} rounded-xl flex items-center justify-center font-bold text-white shadow-sm`}
        style={{ backgroundColor: config.logoColor || '#4F7DF3' }}
      >
        {config.logoLetter || config.shortName.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${dim} rounded-xl bg-[#161920] border border-white/10 flex items-center justify-center p-1.5`}>
      <svg viewBox="0 0 36 28" className="w-full h-full" fill="none">
        <rect x="8" y="2" width="24" height="5" rx="2" fill="#FFFFFF" />
        <rect x="4" y="11" width="24" height="5" rx="2" fill="#4F7DF3" />
        <rect x="0" y="20" width="24" height="5" rx="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const Header: React.FC = () => {
  const { config, isOffline } = useStudio();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-[#0B0D10]/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <BrandLogo size="sm" />
          <span className="font-bold text-base tracking-tight text-white group-hover:text-[#4F7DF3] transition-colors">
            {config.shortName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <WifiOff className="w-3.5 h-3.5" />
              Офлайн
            </span>
          )}
          <Link
            to={location.pathname === '/profile' ? '/admin' : '/profile'}
            title="Профиль клиента и вход владельца"
            className="w-9 h-9 rounded-full bg-[#13161B] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white hover:border-white/20 transition-all"
          >
            <UserCircle2 className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
