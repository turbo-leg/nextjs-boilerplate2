
'use client';

import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export default function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme state after mount
  useEffect(() => {
    setMounted(true);
    
    // On component mount, check if dark mode is active
    const darkModeActive = document.documentElement.classList.contains('dark');
    setIsDark(darkModeActive);
    
    // Also handle system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        // Only auto-switch if user hasn't manually set a preference
        const prefersDark = mediaQuery.matches;
        setIsDark(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    setIsDark(!isDark);
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`${showLabel ? 'pl-3 pr-4' : 'p-3'} flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all text-sm`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <>
          <SunIcon className="w-5 h-5 text-yellow-500" />
          {showLabel && <span className="text-gray-700 dark:text-gray-300">Light</span>}
        </>
      ) : (
        <>
          <MoonIcon className="w-5 h-5 text-gray-700" />
          {showLabel && <span className="text-gray-700">Dark</span>}
        </>
      )}
    </button>
  );
}