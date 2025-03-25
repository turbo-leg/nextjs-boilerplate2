'use client';

import { useState } from 'react';

interface StatsToggleProps {
  onChange: (showYearly: boolean) => void;
}

export default function StatsToggle({ onChange }: StatsToggleProps) {
  const [showYearly, setShowYearly] = useState(false);
  
  const handleToggle = () => {
    const newValue = !showYearly;
    setShowYearly(newValue);
    onChange(newValue);
  };
  
  return (
    <div className="flex items-center gap-4">
      <span className={`text-sm font-medium ${!showYearly ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
        Career Stats
      </span>
      
      <button 
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          showYearly ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        role="switch"
        aria-checked={showYearly}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            showYearly ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <span className={`text-sm font-medium ${showYearly ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
        Yearly Stats
      </span>
    </div>
  );
}
