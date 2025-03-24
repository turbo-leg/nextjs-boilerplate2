'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface SearchFilterProps {
  onSearch: (term: string) => void;
  onFilter: (criteria: string) => void;
}

export default function SearchFilter({ onSearch, onFilter }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const filterOptions = [
    { value: 'ppg', label: 'Points Per Game' },
    { value: 'rpg', label: 'Rebounds Per Game' },
    { value: 'apg', label: 'Assists Per Game' },
    { value: 'championships', label: 'Championships' },
  ];
  
  return (
    <div className="w-full bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search players..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filter</span>
          </button>
          
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-100 dark:border-gray-700">
              <div className="p-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">Sort by</h3>
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilter(option.value);
                      setFilterOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
