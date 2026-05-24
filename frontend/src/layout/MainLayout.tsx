import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
// import Footer from '../components/layout/Footer'; // I'll create this later

interface MainLayoutProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] gradient-bg pointer-events-none -z-10 opacity-50" />
      
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
      
      {/* Footer would go here */}
    </div>
  );
};

export default MainLayout;
