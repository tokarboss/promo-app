import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudioProvider } from './context/StudioContext';
import { TourProvider } from './context/TourContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { MyBookingPage } from './pages/MyBookingPage';
import { InstallGuidePage } from './pages/InstallGuidePage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { OwnerAdminPage } from './pages/OwnerAdminPage';
import { TourOverlay } from './components/TourOverlay';

export const App: React.FC = () => {
  return (
    <StudioProvider>
      <BrowserRouter>
        <TourProvider>
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
            <TourOverlay />
          </div>
        </TourProvider>
      </BrowserRouter>
    </StudioProvider>
  );
};

export default App;