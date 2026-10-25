import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TourContext = createContext<any>(null);

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ГЛОБАЛЬНЫЙ МАРШРУТ ОБУЧЕНИЯ
  const [steps] = useState([
    {
      targetId: 'tour-home-hero',
      route: '/',
      title: 'Добро пожаловать',
      content: 'Это главная страница вашей студии. Отсюда клиенты начинают запись.',
    },
    {
      targetId: 'tour-services-list',
      route: '/services', // Система сама перейдет на эту страницу!
      title: 'Услуги и прайс',
      content: 'Здесь клиенты видят ваши услуги. Бокс бронируется ровно на заданное время.',
    },
    {
      targetId: 'tour-login-owner',
      route: '/profile',
      title: 'Кабинет владельца',
      content: 'Здесь находится защищенный вход для управления бизнесом (пароль: admin2026).',
    },
    {
      targetId: 'tour-admin-kpi',
      route: '/admin',
      title: 'Статистика и выручка',
      content: 'Панель управления. Здесь вы видите заезды и реальную выручку за выполненные работы.',
    },
    {
      targetId: 'tour-admin-settings',
      route: '/admin',
      title: 'Управление без кода',
      content: 'Эти кнопки позволяют менять цены, фото, часы работы и логотип в один клик.',
    },
    {
      targetId: 'tour-install-guide',
      route: '/install',
      title: 'Ваше приложение (PWA)',
      content: 'А здесь клиенты могут установить вашу студию прямо на экран телефона без App Store!',
    }
  ]);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    if (location.pathname !== steps[0].route) {
      navigate(steps[0].route);
    }
  };

  const stopTour = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      const nextRoute = steps[nextIndex].route;
      
      // Если следующий шаг на другой странице — переходим туда
      if (location.pathname !== nextRoute) {
        navigate(nextRoute);
        // Небольшая пауза, чтобы страница успела отрендериться перед подсветкой
        setTimeout(() => setCurrentStep(nextIndex), 300);
      } else {
        setCurrentStep(nextIndex);
      }
    } else {
      stopTour();
    }
  };

  return (
    <TourContext.Provider value={{ isActive, currentStep, steps, startTour, stopTour, nextStep }}>
      {children}
    </TourContext.Provider>
  );
};