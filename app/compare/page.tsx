'use client';

import { useState, useEffect, Suspense } from 'react'; // Add Suspense import
import { parse } from 'csv-parse/sync';
import Image from 'next/image';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import Link from 'next/link';
import AnimationStyles from '../components/AnimationStyles';
import { useRouter, useSearchParams } from 'next/navigation';
import StatsToggle from '../components/StatsToggle';

// Register required Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface YearlyStat {
  season: string;
  team: string;
  games_played: string;
  ppg: string;
  pts: string;
  rpg: string;
  apg: string;
  spg: string;
  bpg: string;
  fg_pct: string;
  ft_pct: string;
  fg3_pct: string;
}

interface PlayerStat {
  id: string;
  name: string;
  games_played: string;
  ppg: string;
  rpg: string;
  apg: string;
  spg: string;
  bpg: string;
  fg_pct: string;
  ft_pct: string;
  fg3_pct: string;
  career_pts: string;
  championships: string;
  role: string;
}

function getPlayerImage(id: string) {
  return `/players/${id}.avif`;
}

function StatComparisonBar({ label, value1, value2, maxValue }: { 
  label: string; 
  value1: number; 
  value2: number; 
  maxValue: number;
}) {
  // Calculate percentages for bar widths
  const percent1 = (value1 / maxValue) * 100;
  const percent2 = (value2 / maxValue) * 100;
  
  // Determine which player has the higher value
  const player1Higher = value1 > value2;
  const player2Higher = value2 > value1;

  return (
    <div className="my-3">
      <div className="flex justify-between text-sm mb-1">
        <span className={`font-medium ${player1Higher ? 'text-blue-600 dark:text-blue-400' : ''}`}>{value1.toFixed(1)}</span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
        <span className={`font-medium ${player2Higher ? 'text-red-600 dark:text-red-400' : ''}`}>{value2.toFixed(1)}</span>
      </div>
      <div className="flex h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
        {/* Left player bar */}
        <div 
          className={`h-full rounded-l-full flex justify-end items-center ${player1Higher ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-blue-400'}`} 
          style={{ width: `${percent1}%` }}
        >
          {percent1 > 15 && <span className="text-white text-xs mr-1">{value1.toFixed(1)}</span>}
        </div>
        
        {/* Middle divider */}
        <div className="h-full w-1 bg-white dark:bg-gray-900"></div>
        
        {/* Right player bar */}
        <div 
          className={`h-full rounded-r-full flex justify-start items-center ${player2Higher ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-red-400'}`} 
          style={{ width: `${percent2}%` }}
        >
          {percent2 > 15 && <span className="text-white text-xs ml-1">{value2.toFixed(1)}</span>}
        </div>
      </div>
    </div>
  );
}

// Create a component to handle the search params logic
function ComparePageContent() {
  // 1. Keep all useState declarations together at the top
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>('5'); // Default to Curry
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>('21'); // Default to Jokic
  const [isLoading, setIsLoading] = useState(true);
  const [showYearlyStats, setShowYearlyStats] = useState(false);
  const [yearlyStats1, setYearlyStats1] = useState<YearlyStat[]>([]);
  const [yearlyStats2, setYearlyStats2] = useState<YearlyStat[]>([]);
  const [selectedSeason1, setSelectedSeason1] = useState<string>('');
  const [selectedSeason2, setSelectedSeason2] = useState<string>('');
  const [loadingYearlyStats, setLoadingYearlyStats] = useState(false);
  
  // 2. Keep all other hook calls (useRouter, useSearchParams, etc.)
  const router = useRouter();
  const searchParams = useSearchParams();

  // 3. Define all useEffect hooks together, before any conditional logic
  // First useEffect - fetch players data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data);
        
        // Check URL params for player IDs
        const p1 = searchParams.get('p1');
        const p2 = searchParams.get('p2');
        
        if (p1) setSelectedPlayer1(p1);
        if (p2) setSelectedPlayer2(p2);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching player data:', error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);
  
  // Second useEffect - fetch yearly stats when needed
  useEffect(() => {
    async function fetchYearlyData() {
      if (showYearlyStats && !isLoading) {
        const playerData1 = players.find(p => p.id === selectedPlayer1);
        const playerData2 = players.find(p => p.id === selectedPlayer2);
        
        if (playerData1 && playerData2) {
          fetchYearlyStats(playerData1.id, setYearlyStats1, setSelectedSeason1);
          fetchYearlyStats(playerData2.id, setYearlyStats2, setSelectedSeason2);
        }
      }
    }
    
    fetchYearlyData();
  }, [showYearlyStats, selectedPlayer1, selectedPlayer2, players, isLoading]);

  // 4. Then define helper functions
  const fetchYearlyStats = async (playerId: string, setStatsFunc: React.Dispatch<React.SetStateAction<YearlyStat[]>>, setSeasonFunc: React.Dispatch<React.SetStateAction<string>>) => {
    try {
      setLoadingYearlyStats(true);
      const response = await fetch(`/api/player-yearly-stats/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch yearly stats for player ${playerId}`);
      }
      
      const data = await response.json();
      setStatsFunc(data);
      
      // Set first season as default selection if available
      if (data.length > 0) {
        setSeasonFunc(data[0].season);
      }
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
    } finally {
      setLoadingYearlyStats(false);
    }
  };

  // 5. Continue with conditional rendering and the rest of the component logic
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading player data...
        </div>
      </div>
    );
  }

  // Find the selected players
  const player1Data = players.find(p => p.id === selectedPlayer1);
  const player2Data = players.find(p => p.id === selectedPlayer2);

  if (!player1Data || !player2Data) {
    return <div>Select players to compare</div>;
  }

  const getStatsForPlayer = (player: PlayerStat, yearlyStats: YearlyStat[], selectedSeason: string): any => {
    if (!showYearlyStats || yearlyStats.length === 0) {
      return {
        ppg: parseFloat(player.ppg),
        rpg: parseFloat(player.rpg),
        apg: parseFloat(player.apg),
        spg: parseFloat(player.spg),
        bpg: parseFloat(player.bpg),
        fg_pct: parseFloat(player.fg_pct),
        fg3_pct: parseFloat(player.fg3_pct),
        ft_pct: parseFloat(player.ft_pct),
        games_played: parseFloat(player.games_played),
        championships: parseInt(player.championships)
      };
    }
    
    // Find stats for the selected season
    const seasonStats = yearlyStats.find(s => s.season === selectedSeason);
    
    if (!seasonStats) {
      return {
        ppg: parseFloat(player.ppg),
        rpg: parseFloat(player.rpg),
        apg: parseFloat(player.apg),
        spg: parseFloat(player.spg),
        bpg: parseFloat(player.bpg),
        fg_pct: parseFloat(player.fg_pct),
        fg3_pct: parseFloat(player.fg3_pct),
        ft_pct: parseFloat(player.ft_pct),
        games_played: parseFloat(player.games_played),
        championships: parseInt(player.championships)
      };
    }
    
    return {
      ppg: parseFloat(seasonStats.ppg || player.ppg),
      rpg: parseFloat(seasonStats.rpg || player.rpg),
      apg: parseFloat(seasonStats.apg || player.apg),
      spg: parseFloat(seasonStats.spg || player.spg),
      bpg: parseFloat(seasonStats.bpg || player.bpg),
      fg_pct: parseFloat(seasonStats.fg_pct || player.fg_pct),
      fg3_pct: parseFloat(seasonStats.fg3_pct || player.fg3_pct),
      ft_pct: parseFloat(seasonStats.ft_pct || player.ft_pct),
      games_played: parseFloat(seasonStats.games_played || player.games_played),
      championships: parseInt(player.championships) // Championships are career-based
    };
  };

  const player1Stats = getStatsForPlayer(player1Data, yearlyStats1, selectedSeason1);
  const player2Stats = getStatsForPlayer(player2Data, yearlyStats2, selectedSeason2);

  // Define chart data with different criteria depending on comparison type
// 1. First, add a helper function to cap values at 100
const normalizeValue = (value: number, maxValue: number): number => {
  // Calculate normalized value and cap at 100
  return Math.min(100, (value / maxValue) * 100);
};

// 2. Now update the radar data calculation with better normalization factors
const radarData = {
  labels: showYearlyStats 
    ? [
        'Scoring (PPG)', 
        'Rebounding (RPG)', 
        'Assists (APG)', 
        'Steals (SPG)', 
        'Blocks (BPG)', 
        'Field Goal %', 
        '3-Point %', 
        'Free Throw %',
        'Games That Season',
        'Points That Season'
      ]
    : [
        'Scoring (PPG)', 
        'Rebounding (RPG)', 
        'Assists (APG)', 
        'Steals (SPG)', 
        'Blocks (BPG)', 
        'Field Goal %', 
        '3-Point %', 
        'Free Throw %',
        'Games Played',
        'Championship Impact'
      ],
  datasets: [
    {
      label: showYearlyStats 
        ? `${player1Data.name} (${selectedSeason1})` 
        : player1Data.name,
      data: showYearlyStats
        // Season comparison data points with adjusted normalization
        ? [
            normalizeValue(player1Stats.ppg, 35), // Increased from 30 to 35 for max PPG
            normalizeValue(player1Stats.rpg, 15), // Increased from 12 to 15 for max RPG
            normalizeValue(player1Stats.apg, 12), // Increased from 10 to 12 for max APG
            normalizeValue(player1Stats.spg, 3),  // Increased from 2.5 to 3 for max SPG
            normalizeValue(player1Stats.bpg, 3),  // Increased from 2.5 to 3 for max BPG
            normalizeValue(player1Stats.fg_pct * 100, 100), // Keep percentage as is
            normalizeValue(player1Stats.fg3_pct * 100, 100), // Keep percentage as is
            normalizeValue(player1Stats.ft_pct * 100, 100), // Keep percentage as is
            // Use different normalization for games in a season
            normalizeValue(parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.games_played || "0"), 82),
            // Include total points for the season
            normalizeValue(parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.pts || "0"), 2500), // Increased from 2000 to 2500
          ]
        // Career comparison data points with adjusted normalization
        : [
            normalizeValue(player1Stats.ppg, 35), // Increased from 30 to 35
            normalizeValue(player1Stats.rpg, 15), // Increased from 12 to 15
            normalizeValue(player1Stats.apg, 12), // Increased from 10 to 12
            normalizeValue(player1Stats.spg, 3),  // Increased from 2.5 to 3
            normalizeValue(player1Stats.bpg, 3),  // Increased from 2.5 to 3
            normalizeValue(player1Stats.fg_pct * 100, 100),
            normalizeValue(player1Stats.fg3_pct * 100, 100),
            normalizeValue(player1Stats.ft_pct * 100, 100),
            normalizeValue(player1Stats.games_played, 1600), // Increased from 1500 to 1600
            normalizeValue(player1Stats.championships * 25, 100), // Ensure championship impact maxes at 100
          ],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',     // Increased opacity for better fill
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      pointRadius: 4,                                 // Larger points
      pointHoverRadius: 7,
      fill: true,                                     // Ensure fill is enabled
    },
    {
      label: showYearlyStats 
        ? `${player2Data.name} (${selectedSeason2})` 
        : player2Data.name,
      data: showYearlyStats
        // Apply the same normalizeValue function to player2's data
        ? [
            normalizeValue(player2Stats.ppg, 35),
            normalizeValue(player2Stats.rpg, 15),
            normalizeValue(player2Stats.apg, 12),
            normalizeValue(player2Stats.spg, 3),
            normalizeValue(player2Stats.bpg, 3),
            normalizeValue(player2Stats.fg_pct * 100, 100),
            normalizeValue(player2Stats.fg3_pct * 100, 100),
            normalizeValue(player2Stats.ft_pct * 100, 100),
            normalizeValue(parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.games_played || "0"), 82),
            normalizeValue(parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.pts || "0"), 2500),
          ]
        : [
            normalizeValue(player2Stats.ppg, 35),
            normalizeValue(player2Stats.rpg, 15),
            normalizeValue(player2Stats.apg, 12),
            normalizeValue(player2Stats.spg, 3),
            normalizeValue(player2Stats.bpg, 3),
            normalizeValue(player2Stats.fg_pct * 100, 100),
            normalizeValue(player2Stats.fg3_pct * 100, 100),
            normalizeValue(player2Stats.ft_pct * 100, 100),
            normalizeValue(player2Stats.games_played, 1600),
            normalizeValue(player2Stats.championships * 25, 100),
          ],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',     // Increased opacity
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      pointRadius: 4,
      pointHoverRadius: 7,
      fill: true,
    },
  ],
};

// Simplified chart options with proper TypeScript types
const chartOptions = {
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        display: true,
        backdropColor: 'rgba(0, 0, 0, 0)',
        font: {
          size: 10
        },
        stepSize: 20,
        color: '#fff',
      },
      grid: {
        color: 'rgba(120, 120, 120, 0.2)',
        circular: true,
      },
      angleLines: {
        color: 'rgba(120, 120, 120, 0.3)',
        lineWidth: 1,
      },
      pointLabels: {
        font: {
          size: 12,
          // Ensure this is a valid literal for Chart.js
          weight: 'bold' as 'bold',
        },
        color: '#fff',
        padding: 15,
      },
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 14,
          // Ensure this is a valid literal for Chart.js
          weight: 'bold' as 'bold',
        },
        padding: 20,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 14,
        weight: 'bold' as 'bold',
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        // Custom tooltip to show correct values based on mode
        label: function(context: any) {
          const datasetIndex = context.datasetIndex;
          const index = context.dataIndex;
          const playerName = datasetIndex === 0 ? player1Data.name : player2Data.name;
          const playerStats = datasetIndex === 0 ? player1Stats : player2Stats;
          const season = datasetIndex === 0 ? selectedSeason1 : selectedSeason2;
          const yearlyStats = datasetIndex === 0 ? yearlyStats1 : yearlyStats2;
          
          // Use stats from the correct source based on mode
          const labelPrefix = showYearlyStats 
            ? `${playerName} (${season}): ` 
            : `${playerName}: `;
          
          // Display original values based on the stat category
          if (showYearlyStats) {
            // Season comparison tooltips
            switch(index) {
              case 0: return `${labelPrefix}${playerStats.ppg.toFixed(1)} PPG`;
              case 1: return `${labelPrefix}${playerStats.rpg.toFixed(1)} RPG`;
              case 2: return `${labelPrefix}${playerStats.apg.toFixed(1)} APG`;
              case 3: return `${labelPrefix}${playerStats.spg.toFixed(1)} SPG`;
              case 4: return `${labelPrefix}${playerStats.bpg.toFixed(1)} BPG`;
              case 5: return `${labelPrefix}${(playerStats.fg_pct * 100).toFixed(1)}% FG`;
              case 6: return `${labelPrefix}${(playerStats.fg3_pct * 100).toFixed(1)}% 3P`;
              case 7: return `${labelPrefix}${(playerStats.ft_pct * 100).toFixed(1)}% FT`;
              case 8: 
                const gamesPlayed = yearlyStats.find(s => s.season === season)?.games_played || "0";
                return `${labelPrefix}${gamesPlayed} Games`;
              case 9: 
                const seasonPoints = yearlyStats.find(s => s.season === season)?.pts || "0";
                return `${labelPrefix}${parseFloat(seasonPoints).toFixed(0)} Total Points`;
              default: return '';
            }
          } else {
            // Career comparison tooltips
            switch(index) {
              case 0: return `${labelPrefix}${playerStats.ppg.toFixed(1)} PPG`;
              case 1: return `${labelPrefix}${playerStats.rpg.toFixed(1)} RPG`;
              case 2: return `${labelPrefix}${playerStats.apg.toFixed(1)} APG`;
              case 3: return `${labelPrefix}${playerStats.spg.toFixed(1)} SPG`;
              case 4: return `${labelPrefix}${playerStats.bpg.toFixed(1)} BPG`;
              case 5: return `${labelPrefix}${(playerStats.fg_pct * 100).toFixed(1)}% FG`;
              case 6: return `${labelPrefix}${(playerStats.fg3_pct * 100).toFixed(1)}% 3P`;
              case 7: return `${labelPrefix}${(playerStats.ft_pct * 100).toFixed(1)}% FT`;
              case 8: return `${labelPrefix}${playerStats.games_played.toFixed(0)} Career Games`;
              case 9: return `${labelPrefix}${playerStats.championships} Championships`;
              default: return '';
            }
          }
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.3,
      borderJoinStyle: 'round' as CanvasLineJoin,
    }
  },
  maintainAspectRatio: false,
  animation: {
    duration: 1500,
    easing: 'easeOutQuart' as const,
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
};

  // Calculate max values for comparison bars
  const maxValues = {
    ppg: 30,
    rpg: 12,
    apg: 10,
    spg: 3,
    bpg: 3,
    fg_pct: 70, // as percentage
    ft_pct: 100, // as percentage
    fg3_pct: 50, // as percentage
    games_played: 1500,
    career_pts: 40000,
  };

  const handlePlayer1Change = (id: string) => {
    setSelectedPlayer1(id);
    updateUrlParams(id, selectedPlayer2);
  };
  
  const handlePlayer2Change = (id: string) => {
    setSelectedPlayer2(id);
    updateUrlParams(selectedPlayer1, id);
  };
  
  const updateUrlParams = (p1: string, p2: string) => {
    // Create new URL with updated params
    const params = new URLSearchParams();
    params.set('p1', p1);
    params.set('p2', p2);
    
    // Update URL without refreshing the page
    router.push(`/compare?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-12 sm:pb-20">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-blue-500/5 dark:bg-blue-500/10 -z-10"></div>
      <div className="absolute top-[20vh] right-0 w-1/3 h-[30vh] rounded-full bg-red-500/5 dark:bg-red-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-[40vh] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl -z-10"></div>
      
      <AnimationStyles />
      
      <div className="container mx-auto px-4 sm:px-6 relative pt-6 sm:pt-8">
        <header className="py-8 sm:py-12 md:py-16 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-blue-500/10 to-red-500/10 dark:from-blue-500/20 dark:to-red-500/20 blur-3xl rounded-full -z-10"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mb-4 sm:mb-6 font-medium group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Player Stats</span>
            </Link>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 dark:from-blue-400 dark:via-purple-400 dark:to-red-400 leading-tight">
              Player Comparison
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto">
              Compare stats head-to-head between any two NBA players
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 p-4 sm:p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20 mx-auto max-w-3xl transform transition-all hover:shadow-xl">
            <div className="flex flex-col justify-center space-y-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player 1
                </label>
                <select 
                  value={selectedPlayer1}
                  onChange={(e) => handlePlayer1Change(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800 focus:ring-opacity-50 transition-all"
                >
                  {players.map((player) => (
                    <option key={`p1-${player.id}`} value={player.id}>
                      {player.name} ({player.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player 2
                </label>
                <select 
                  value={selectedPlayer2}
                  onChange={(e) => handlePlayer2Change(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 dark:focus:ring-red-800 focus:ring-opacity-50 transition-all"
                >
                  {players.map((player) => (
                    <option key={`p2-${player.id}`} value={player.id}>
                      {player.name} ({player.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex justify-end mb-6">
          <StatsToggle onChange={setShowYearlyStats} />
        </div>

        {showYearlyStats && (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 mb-6 shadow-md">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {player1Data?.name} Season
                </label>
                <select
                  value={selectedSeason1}
                  onChange={(e) => setSelectedSeason1(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  disabled={loadingYearlyStats || yearlyStats1.length === 0}
                >
                  {yearlyStats1.map((stat) => (
                    <option key={stat.season} value={stat.season}>
                      {stat.season} - {stat.team}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {player2Data?.name} Season
                </label>
                <select
                  value={selectedSeason2}
                  onChange={(e) => setSelectedSeason2(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  disabled={loadingYearlyStats || yearlyStats2.length === 0}
                >
                  {yearlyStats2.map((stat) => (
                    <option key={stat.season} value={stat.season}>
                      {stat.season} - {stat.team}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mb-12 animated-section">
          {/* Player cards */}
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-6">
            {/* Player 1 */}
            <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden border border-blue-100 dark:border-blue-900/30 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-60 relative bg-gradient-to-r from-blue-400/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-600/20">
                <Image
                  src={getPlayerImage(player1Data.id)}
                  alt={player1Data.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={(e) => {
                    e.currentTarget.src = '/players/default.avif';
                  }}
                  priority
                  unoptimized={true}
                  className="transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
              </div>
              <div className="p-5 relative -mt-16">
                <div className="bg-white/90 dark:bg-gray-800/90 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">{player1Data.name}</h2>
                  <div className="flex justify-between mt-3 mb-4">
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      {player1Data.role}
                    </div>
                    <div className="flex items-center px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
                      <Image 
                        src="/trophy.svg"  
                        alt="Championships"
                        width={16}
                        height={16}
                        className="text-yellow-500 mr-1"
                      />
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{player1Data.championships}</span>
                    </div>
                  </div>
                  <div className="text-center mt-5 px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
                    {showYearlyStats && yearlyStats1.length > 0 && selectedSeason1 ? (
                      <>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                          {parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.ppg || player1Data.ppg).toFixed(1)}
                        </div>
                        <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                          PPG in {selectedSeason1}
                        </div>
                        <div className="text-xs text-blue-500/70 dark:text-blue-300/70 mt-1">
                          (Career: {player1Data.ppg} PPG)
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                          {parseInt(player1Data.career_pts).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600/70 dark:text-blue-400/70">Career Points</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Player 2 */}
            <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden border border-red-100 dark:border-red-900/30 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-60 relative bg-gradient-to-r from-red-400/10 to-red-600/10 dark:from-red-400/20 dark:to-red-600/20">
                <Image
                  src={getPlayerImage(player2Data.id)}
                  alt={player2Data.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={(e) => {
                    e.currentTarget.src = '/players/default.avif';
                  }}
                  priority
                  unoptimized={true}
                  className="transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
              </div>
              <div className="p-5 relative -mt-16">
                <div className="bg-white/90 dark:bg-gray-800/90 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400">{player2Data.name}</h2>
                  <div className="flex justify-between mt-3 mb-4">
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                      {player2Data.role}
                    </div>
                    <div className="flex items-center px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
                      <Image 
                        src="/trophy.svg"  
                        alt="Championships"
                        width={16}
                        height={16}
                        className="text-yellow-500 mr-1"
                      />
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{player2Data.championships}</span>
                    </div>
                  </div>
                  <div className="text-center mt-5 px-4 py-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-xl">
                    {showYearlyStats && yearlyStats2.length > 0 && selectedSeason2 ? (
                      <>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                          {parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.ppg || player2Data.ppg).toFixed(1)}
                        </div>
                        <div className="text-sm text-red-600/70 dark:text-red-400/70">
                          PPG in {selectedSeason2}
                        </div>
                        <div className="text-xs text-red-500/70 dark:text-red-300/70 mt-1">
                          (Career: {player2Data.ppg} PPG)
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                          {parseInt(player2Data.career_pts).toLocaleString()}
                        </div>
                        <div className="text-sm text-red-600/70 dark:text-red-400/70">Career Points</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Radar chart */}
          <div className="w-full bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl mt-6 sm:mt-8">
            <h3 className="text-center text-lg sm:text-xl font-bold mb-3 sm:mb-5 text-gray-800 dark:text-white">Player Skills Comparison</h3>
            <div className="w-full h-[350px] sm:h-[500px] relative">
              <Radar data={radarData} options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    labels: {
                      ...chartOptions.plugins.legend.labels,
                      // Make font size responsive
                      font: {
                        ...chartOptions.plugins.legend.labels.font,
                        size: window.innerWidth < 640 ? 12 : 14,
                      }
                    }
                  }
                }
              }} />
              <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                * All values normalized to facilitate comparison
              </div>
            </div>
          </div>
        </div>
        
        {/* Stat comparison bars */}
        <div className="mt-6 sm:mt-12 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl animated-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Head-to-Head Stats</h2>
            <div className="flex flex-wrap gap-3 sm:gap-6">
              <div className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 mr-1 sm:mr-2"></div>
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">{player1Data.name}</span>
              </div>
              <div className="flex items-center px-3 py-2 bg-red-50 dark:bg-red-900/30 rounded-full">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 mr-1 sm:mr-2"></div>
                <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">{player2Data.name}</span>
              </div>
              <button
                onClick={() => {
                  // Create shareable link
                  const url = `${window.location.origin}/compare?p1=${selectedPlayer1}&p2=${selectedPlayer2}`;
                  
                  // Copy to clipboard
                  navigator.clipboard.writeText(url)
                    .then(() => {
                      alert('Link copied to clipboard!');
                    })
                    .catch(err => {
                      console.error('Failed to copy: ', err);
                    });
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800/40 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-8">
            <StatComparisonBar 
              label="Points Per Game" 
              value1={player1Stats.ppg} 
              value2={player2Stats.ppg}
              maxValue={maxValues.ppg}
            />
            
            <StatComparisonBar 
              label="Rebounds Per Game" 
              value1={player1Stats.rpg} 
              value2={player2Stats.rpg}
              maxValue={maxValues.rpg}
            />
            
            <StatComparisonBar 
              label="Assists Per Game" 
              value1={player1Stats.apg} 
              value2={player2Stats.apg}
              maxValue={maxValues.apg}
            />
            
            <StatComparisonBar 
              label="Steals Per Game" 
              value1={player1Stats.spg} 
              value2={player2Stats.spg}
              maxValue={maxValues.spg}
            />
            
            <StatComparisonBar 
              label="Blocks Per Game" 
              value1={player1Stats.bpg} 
              value2={player2Stats.bpg}
              maxValue={maxValues.bpg}
            />
            
            <StatComparisonBar 
              label="Field Goal %" 
              value1={player1Stats.fg_pct * 100} 
              value2={player2Stats.fg_pct * 100}
              maxValue={maxValues.fg_pct}
            />
            
            <StatComparisonBar 
              label="3-Point %" 
              value1={player1Stats.fg3_pct * 100} 
              value2={player2Stats.fg3_pct * 100}
              maxValue={maxValues.fg3_pct}
            />
            
            <StatComparisonBar 
              label="Free Throw %" 
              value1={player1Stats.ft_pct * 100} 
              value2={player2Stats.ft_pct * 100}
              maxValue={maxValues.ft_pct}
            />
            
            <StatComparisonBar 
              label="Games Played" 
              value1={player1Stats.games_played} 
              value2={player2Stats.games_played}
              maxValue={maxValues.games_played}
            />
            
            <StatComparisonBar 
              label={showYearlyStats ? "Season Points" : "Career Points"}
              value1={showYearlyStats && yearlyStats1.length > 0 ? 
                parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.pts || "0") : 
                parseFloat(player1Data.career_pts)
              } 
              value2={showYearlyStats && yearlyStats2.length > 0 ? 
                parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.pts || "0") : 
                parseFloat(player2Data.career_pts)
              }
              maxValue={showYearlyStats ? 3000 : maxValues.career_pts}
            />
          </div>
        </div>
        
        {showYearlyStats && (
          <div className="mt-6 sm:mt-12 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl animated-section">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6">Career vs Season Stats</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3">{player1Data.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Career Avg</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">PPG</div>
                        <div className="text-lg font-bold">{player1Data.ppg}</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">RPG</div>
                        <div className="text-lg font-bold">{player1Data.rpg}</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">APG</div>
                        <div className="text-lg font-bold">{player1Data.apg}</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">FG%</div>
                        <div className="text-lg font-bold">{(parseFloat(player1Data.fg_pct) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{selectedSeason1}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">PPG</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.ppg || "0") > parseFloat(player1Data.ppg) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.ppg || "0").toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">RPG</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.rpg || "0") > parseFloat(player1Data.rpg) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.rpg || "0").toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">APG</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.apg || "0") > parseFloat(player1Data.apg) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.apg || "0").toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">FG%</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.fg_pct || "0") > parseFloat(player1Data.fg_pct) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {(parseFloat(yearlyStats1.find(s => s.season === selectedSeason1)?.fg_pct || "0") * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50/50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-3">{player2Data.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Career Avg</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">PPG</div>
                        <div className="text-lg font-bold">{player2Data.ppg}</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">RPG</div>
                        <div className="text-lg font-bold">{player2Data.rpg}</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">APG</div>
                        <div className="text-lg font-bold">{player2Data.apg}</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">FG%</div>
                        <div className="text-lg font-bold">{(parseFloat(player2Data.fg_pct) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{selectedSeason2}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">PPG</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.ppg || "0") > parseFloat(player2Data.ppg) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.ppg || "0").toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">RPG</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.rpg || "0") > parseFloat(player2Data.rpg) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.rpg || "0").toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">APG</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.apg || "0") > parseFloat(player2Data.apg) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.apg || "0").toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">FG%</div>
                        <div className={`text-lg font-bold ${parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.fg_pct || "0") > parseFloat(player2Data.fg_pct) ? "text-green-600 dark:text-green-400" : ""}`}>
                          {(parseFloat(yearlyStats2.find(s => s.season === selectedSeason2)?.fg_pct || "0") * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 sm:mt-20 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm mb-6">
            <div className="px-3 sm:px-6 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {showYearlyStats ? 
                `Comparing ${player1Data.name}'s ${selectedSeason1} to ${player2Data.name}'s ${selectedSeason2} stats` : 
                "Comparing career statistics through 2025"
              }
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading comparison...
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}