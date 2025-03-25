'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface YearlyStatsChartProps {
  playerId: string;
  playerName: string;
}

export default function YearlyStatsChart({ playerId, playerName }: YearlyStatsChartProps) {
  const [yearlyStats, setYearlyStats] = useState<YearlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statType, setStatType] = useState<string>('ppg');
  
  useEffect(() => {
    async function fetchYearlyStats() {
      try {
        setLoading(true);
        const response = await fetch(`/api/player-yearly-stats/${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch yearly stats');
        }
        
        const data = await response.json();
        setYearlyStats(data);
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
  
  // Sort stats chronologically
  const sortedStats = [...yearlyStats].sort((a, b) => {
    // Extract the first year from season string (e.g., "2019-20" -> 2019)
    const yearA = parseInt(a.season.split('-')[0]);
    const yearB = parseInt(b.season.split('-')[0]);
    return yearA - yearB;
  });
  
  // Get seasons for labels
  const seasons = sortedStats.map(stat => stat.season);
  
  // Stat options for selector
  const statOptions = [
    { value: 'ppg', label: 'Points Per Game' },
    { value: 'rpg', label: 'Rebounds Per Game' },
    { value: 'apg', label: 'Assists Per Game' },
    { value: 'spg', label: 'Steals Per Game' },
    { value: 'bpg', label: 'Blocks Per Game' },
    { value: 'fg_pct', label: 'Field Goal %', multiplier: 100 },
    { value: 'ft_pct', label: 'Free Throw %', multiplier: 100 },
    { value: 'fg3_pct', label: '3-Point %', multiplier: 100 },
    { value: 'games_played', label: 'Games Played' },
  ];
  
  // Find the selected stat option
  const selectedStat = statOptions.find(opt => opt.value === statType) || statOptions[0];
  
  // Get values for the selected stat
  const values = sortedStats.map(stat => {
    const val = parseFloat(stat[statType as keyof YearlyStat] as string);
    return selectedStat.multiplier ? val * selectedStat.multiplier : val;
  });
  
  // Determine chart color based on trend
  const trendUp = values[values.length - 1] > values[0];
  const chartColor = trendUp ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
  
  // Chart data
  const chartData = {
    labels: seasons,
    datasets: [
      {
        label: selectedStat.label,
        data: values,
        borderColor: chartColor,
        backgroundColor: `${chartColor}50`,
        pointBackgroundColor: chartColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColor,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(120, 120, 120, 0.2)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            return `${selectedStat.label}: ${value.toFixed(1)}`;
          },
          // Add additional stats context in tooltip
          afterLabel: function(context) {
            const index = context.dataIndex;
            const stat = sortedStats[index];
            return [
              `Games: ${stat.games_played}`,
              `Points: ${stat.ppg}`,
              `Rebounds: ${stat.rpg}`,
              `Assists: ${stat.apg}`,
            ];
          }
        }
      },
    },
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Season-by-Season Stats</h3>
        <div className="relative">
          <select
            value={statType}
            onChange={(e) => setStatType(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg py-2 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {sortedStats.map((stat, index) => (
          <div 
            key={stat.season} 
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.season}</div>
            <div className="text-lg font-bold">
              {selectedStat.multiplier 
                ? (parseFloat(stat[statType as keyof YearlyStat] as string) * selectedStat.multiplier).toFixed(1)
                : parseFloat(stat[statType as keyof YearlyStat] as string).toFixed(1)
              }
              {selectedStat.value.includes('pct') ? '%' : ''}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stat.games_played} games
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
