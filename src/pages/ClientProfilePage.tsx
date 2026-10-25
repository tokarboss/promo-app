import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const ClientProfilePage: React.FC = () => {
  const { loginAdmin, adminToken } = useStudio();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const [ownerPassword, setOwnerPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    localStorage.setItem('sgx_client_email', email);
    setLinkSent(true);
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginAdmin(ownerPassword);
    if (ok) {
      navigate('/admin');
    } else {
      setLoginError('Неверный пароль владельца (по умолчанию: admin2026)');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>На главную</span>
      </Link>

      {/* Карточка Профиль клиента как на кадре 00:05:38 */}
      <div className="p-6 rounded-[28px] bg-[#13161B] border border-white/[0.08] space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Профиль клиента</h1>
          <p className="text-xs text-[#8E95A5] mt-1.5 leading-relaxed">
            Сохраняйте новые записи в одном месте и открывайте их с любого устройства.
          </p>
        </div>

        {linkSent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed">
            Ссылка для синхронизации записей отправлена на <strong>{email}</strong>. Ваш профиль привязан к текущему устройству.
          </div>
        ) : (
          <form onSubmit={handleSendMagicLink} className="space-y-3">
            <div>
              <label className="block text-xs text-[#8E95A5] mb-1.5">Почта</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4F7DF3]"
              />
            </div>
            <p className="text-[11px] text-[#8E95A5]">
              Пароль не нужен. Отправим ссылку для входа.
            </p>
            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#4F7DF3] hover:bg-[#3B68DF] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Получить ссылку</span>
            </button>
          </form>
        )}
      </div>

      {/* Вход в кабинет владельца студии */}
      <div className="p-6 rounded-[28px] bg-[#13161B] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Кабинет владельца</h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">
              Управление расписанием боксов, ценами, фото и контактами без кода.
            </p>
          </div>
          <KeyRound className="w-5 h-5 text-[#4F7DF3]" />
        </div>

        {adminToken ? (
          <Link
            to="/admin"
            className="w-full h-12 rounded-2xl bg-[#4F7DF3] text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Открыть панель управления</span>
          </Link>
        ) : (
          <form onSubmit={handleOwnerLogin} className="space-y-3">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs text-[#8E95A5] mb-1.5">
                Пароль владельца (демо: admin2026)
              </label>
              <input
                type="password"
                placeholder="Введите пароль..."
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#171A21] border border-white/10 text-sm text-white focus:outline-none focus:border-[#4F7DF3]"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
            >
              Войти в кабинет владельца →
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
