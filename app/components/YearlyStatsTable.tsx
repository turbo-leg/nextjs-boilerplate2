'use client';

import { useState, useEffect } from 'react';

interface YearlyStat {
  season: string;
  team: string;
  games_played: string;
  pts: string;
  ppg: string;
  rpg: string;
  apg: string;
  spg: string;
  bpg: string;
  fg_pct: string;
  ft_pct: string;
  fg3_pct: string;
}

interface YearlyStatsTableProps {
  playerId: string;
}

export default function YearlyStatsTable({ playerId }: YearlyStatsTableProps) {
  const [yearlyStats, setYearlyStats] = useState<YearlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchYearlyStats() {
      try {
        setLoading(true);
        const response = await fetch(`/api/player-yearly-stats/${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch yearly stats');
        }
        
        const data = await response.json();
        // Sort most recent seasons first
        const sortedData = [...data].sort((a, b) => {
          const yearA = parseInt(a.season.split('-')[0]);
          const yearB = parseInt(b.season.split('-')[0]);
          return yearB - yearA; // Descending order
        });
        
        setYearlyStats(sortedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching yearly stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    
    fetchYearlyStats();
  }, [playerId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading yearly stats...</span>
      </div>
    );
  }
  
  if (error || yearlyStats.length === 0) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
        <p className="text-red-600 dark:text-red-400">
          {error || 'No yearly stats available for this player'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
      <div className="p-4 sm:p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Season-by-Season Statistics</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Season</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Games</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PPG</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">RPG</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">APG</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SPG</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">BPG</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FG%</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">3P%</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FT%</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {yearlyStats.map((stat, index) => (
                <tr key={stat.season} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{stat.season}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{stat.team}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{stat.games_played}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">{parseFloat(stat.ppg).toFixed(1)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{parseFloat(stat.rpg).toFixed(1)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{parseFloat(stat.apg).toFixed(1)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{parseFloat(stat.spg).toFixed(1)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{parseFloat(stat.bpg).toFixed(1)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{(parseFloat(stat.fg_pct) * 100).toFixed(1)}%</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{(parseFloat(stat.fg3_pct) * 100).toFixed(1)}%</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{(parseFloat(stat.ft_pct) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
