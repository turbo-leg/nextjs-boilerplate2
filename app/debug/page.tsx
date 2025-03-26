'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [apiPlayersCount, setApiPlayersCount] = useState<number | null>(null);
  
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
          const data = await response.json();
          setApiStatus('Online');
          setApiPlayersCount(data.length);
        } else {
          setApiStatus('Error: ' + response.statusText);
        }
      } catch (error) {
        setApiStatus('Offline or error');
        console.error('API check error:', error);
      }
    }
    
    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mb-6 font-medium group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
        
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">API Status</h2>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-3 w-3 rounded-full ${
              apiStatus === 'Online' ? 'bg-green-500' : 
              apiStatus === 'Checking...' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span>{apiStatus}</span>
          </div>
          
          {apiPlayersCount !== null && (
            <p className="text-gray-600 dark:text-gray-300">
              Found {apiPlayersCount} players in database
            </p>
          )}
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Environment</h2>
          <div className="overflow-x-auto">
            <p className="mb-2">Next.js version: 15.2.3</p>
            <p>Node environment: {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
