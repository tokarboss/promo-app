import React, { useEffect, useState } from 'react';
import { useTour } from '../context/TourContext';

export const TourOverlay: React.FC = () => {
  const { isActive, currentStep, steps, stopTour, nextStep } = useTour();
  const [targetStyle, setTargetStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(steps[currentStep].targetId);
      if (targetElement) {
        // Плавно скроллим к элементу, чтобы он был по центру экрана
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const rect = targetElement.getBoundingClientRect();
        
        // Оверлей имеет position: fixed, поэтому координаты берем прямо из viewport 
        // (без прибавления window.scrollY)
        setTargetStyle({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
      }
    };

    // Даем 300мс, чтобы новая страница точно успела отрендериться перед поиском элемента
    const timer = setTimeout(updatePosition, 300);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || !steps[currentStep]) return null;

  const current = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Затемняющий фон */}
      <div className="absolute inset-0 bg-[#0B0D10]/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" />
      
      {/* Подсвеченная область (рамка) вокруг элемента */}
      <div 
        className="absolute bg-transparent border-2 border-[#4F7DF3] rounded-[28px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-500 ease-out"
        style={targetStyle}
      />

      {/* Окно с подсказкой — теперь жестко зафиксировано внизу экрана */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#13161B] border border-white/[0.1] p-5 rounded-[24px] shadow-2xl w-[90%] max-w-[340px] pointer-events-auto transition-transform duration-500 ease-in-out"
      >
        <div className="text-[10px] font-bold text-[#4F7DF3] uppercase tracking-wider mb-1">
          Шаг {currentStep + 1} из {steps.length}
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{current.title}</h3>
        <p className="text-[#8E95A5] text-xs mb-5 leading-relaxed">
          {current.content}
        </p>
        
        <div className="flex justify-between items-center gap-3">
          <button 
            onClick={stopTour}
            className="text-gray-400 text-xs hover:text-white transition-colors py-2 px-3"
          >
            Пропустить
          </button>
          <button 
            onClick={nextStep}
            className="flex-1 bg-[#4F7DF3] hover:bg-[#3B68DF] text-white text-xs py-3 rounded-xl font-semibold shadow-lg shadow-[#4F7DF3]/20 transition-all"
          >
            {isLast ? 'Завершить тур' : 'Дальше'}
          </button>
        </div>
      </div>
    </div>
  );
};