import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudioProvider } from './context/StudioContext';
import { TourProvider } from './context/TourContext'; // <-- 1. Импортируем Провайдер обучения
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { MyBookingPage } from './pages/MyBookingPage';
import { InstallGuidePage } from './pages/InstallGuidePage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { OwnerAdminPage } from './pages/OwnerAdminPage';
import { TourOverlay } from './components/TourOverlay'; // <-- 2. Импортируем компонент оверлея

export const App: React.FC = () => {
  return (
    // 3. Оборачиваем все приложение в TourProvider (чтобы доступ был на любой странице)
    <TourProvider>
      <StudioProvider>
        <BrowserRouter>
          {/* Добавил relative, чтобы абсолютное позиционирование оверлея работало корректно */}
          <div className="min-h-screen bg-[#0B0D10] text-[#F3F4F6] flex flex-col relative">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/my-booking" element={<MyBookingPage />} />
                <Route path="/install" element={<InstallGuidePage />} />
                <Route path="/profile" element={<ClientProfilePage />} />
                <Route path="/admin" element={<OwnerAdminPage />} />
              </Routes>
            </main>
            <BottomNav />
            
            {/* 4. Выводим компонент обучения поверх всего остального контента */}
            <TourOverlay />
          </div>
        </BrowserRouter>
      </StudioProvider>
    </TourProvider>
  );
};

export default App;