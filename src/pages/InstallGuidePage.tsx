import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, CheckCircle2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BrandLogo } from '../components/Header';

export const InstallGuidePage: React.FC = () => {
  const { config } = useStudio();
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('ios');

  const stepsMap = {
    ios: [
      'Откройте эту страницу в браузере Safari на вашем iPhone или iPad.',
      'Нажмите кнопку «Поделиться» (иконка со стрелкой вверх в нижней панели браузера).',
      'Прокрутите список действий вниз и выберите пункт «На экран «Домой»».',
      'Оставьте тумблер «Открыть как веб-приложение» включённым и нажмите «Добавить».'
    ],
    android: [
      'Откройте страницу студии в браузере Chrome на смартфоне Android.',
      'Нажмите на меню браузера (три точки в правом верхнем углу).',
      'Выберите пункт «Установить приложение» или «Добавить на главный экран».',
      'Подтвердите установку — иконка студии появится рядом с остальными приложениями.'
    ],
    desktop: [
      'Откройте сайт студии в браузере Chrome, Edge или Яндекс Браузере на компьютере.',
      'В правой части адресной строки нажмите на иконку установки приложения (компьютер со стрелкой).',
      'Нажмите «Установить» во всплывающем окне — приложение откроется в отдельном окне без адресной строки.'
    ]
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>На главную</span>
      </Link>

      {/* ДОБАВЛЕН ID ДЛЯ ОБУЧЕНИЯ (tour-install-guide) */}
      <div id="tour-install-guide" className="p-6 rounded-[28px] bg-[#13161B] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <div className="font-bold text-white text-sm">{config.shortName}</div>
            <div className="text-xs text-[#8E95A5]">Приложение студии</div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            Добавьте студию на главный экран
          </h1>
          <p className="text-xs text-[#8E95A5] mt-2 leading-relaxed">
            Своя иконка на устройстве. Быстрый доступ к услугам и вашей записи.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] text-xs text-gray-300">
          <Smartphone className="w-3.5 h-3.5 text-[#4F7DF3]" />
          <span>Несколько шагов в браузере — и готово</span>
        </div>

        {/* Переключатель платформ */}
        <div className="pt-2 space-y-3">
          <div className="text-xs font-semibold text-white">Как установить</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPlatform('ios')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-medium border transition-all ${
                platform === 'ios'
                  ? 'bg-[#1D2432] border-[#4F7DF3] text-white'
                  : 'bg-[#171A21] border-white/[0.07] text-[#8E95A5]'
              }`}
            >
              iPhone / iPad
            </button>
            <button
              type="button"
              onClick={() => setPlatform('android')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-medium border transition-all ${
                platform === 'android'
                  ? 'bg-[#1D2432] border-[#4F7DF3] text-white'
                  : 'bg-[#171A21] border-white/[0.07] text-[#8E95A5]'
              }`}
            >
              Android
            </button>
            <button
              type="button"
              onClick={() => setPlatform('desktop')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-medium border transition-all ${
                platform === 'desktop'
                  ? 'bg-[#1D2432] border-[#4F7DF3] text-white'
                  : 'bg-[#171A21] border-white/[0.07] text-[#8E95A5]'
              }`}
            >
              Компьютер
            </button>
          </div>
        </div>

        {/* Пошаговая инструкция */}
        <ol className="space-y-2.5 pt-2">
          {stepsMap[platform].map((stepText, idx) => (
            <li
              key={idx}
              className="p-3.5 rounded-2xl bg-[#171A21] border border-white/[0.06] flex items-start gap-3 text-xs text-gray-200 leading-relaxed"
            >
              <span className="w-5 h-5 rounded-full bg-[#4F7DF3]/20 text-[#4F7DF3] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{stepText}</span>
            </li>
          ))}
        </ol>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>После добавления приложение открывается на весь экран без адресной строки.</span>
        </div>
      </div>
    </div>
  );
};