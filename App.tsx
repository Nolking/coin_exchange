import React, { useState, useEffect } from 'react';
import SwapCard from './components/SwapCard';
import ToastContainer from './components/Toast';
import { ToastMessage } from './types';

const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light'); // Default to light if system is light and no preference
    }
  }, []);

  useEffect(() => {
    // Apply theme class to html element
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#1E2329';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#F3F4F6';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (msg: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...msg, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-light-bg'}`}>
        
        {/* Background Decorative Elements */}
        {theme === 'dark' && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          </>
        )}

        {/* Main Content */}
        <div className="z-10 w-full flex flex-col items-center">
             <div className="mb-8 text-center">
                <h1 className={`text-4xl font-bold mb-2 transition-colors ${theme === 'dark' ? 'text-primary' : 'text-yellow-600'}`}>CoinExchange</h1>
                <p className={`transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Instantly swap your crypto assets</p>
             </div>
             
             <SwapCard 
                addToast={addToast} 
                theme={theme}
                toggleTheme={toggleTheme}
             />
        </div>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;