'use client';

import { useState, useEffect, Suspense } from 'react'; // Add Suspense import
import { parse } from 'csv-parse/sync';
import Image from 'next/image';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import Link from 'next/link';
import AnimationStyles from '../components/AnimationStyles';
import { useRouter, useSearchParams } from 'next/navigation';

// Register required Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>('5'); // Default to Curry
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>('21'); // Default to Jokic
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch CSV data
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

  const player1 = players.find(p => p.id === selectedPlayer1);
  const player2 = players.find(p => p.id === selectedPlayer2);

  if (!player1 || !player2) {
    return <div>Select players to compare</div>;
  }

  // Define chart data with normalized values to create a fuller radar chart
  const radarData = {
    labels: [
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
        label: player1.name,
        data: [
          // Normalize values to create a better radar shape
          (parseFloat(player1.ppg) / 30) * 100,         // Scale to percentage of 30ppg
          (parseFloat(player1.rpg) / 12) * 100,         // Scale to percentage of 12rpg
          (parseFloat(player1.apg) / 10) * 100,         // Scale to percentage of 10apg
          (parseFloat(player1.spg) / 2.5) * 100,        // Scale to percentage of 2.5spg
          (parseFloat(player1.bpg) / 2.5) * 100,        // Scale to percentage of 2.5bpg
          parseFloat(player1.fg_pct) * 100,             // Already a percentage
          parseFloat(player1.fg3_pct) * 100,            // Already a percentage
          parseFloat(player1.ft_pct) * 100,             // Already a percentage
          (parseFloat(player1.games_played) / 1500) * 100, // Scale games played
          parseInt(player1.championships) * 25,         // 25% per championship
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
        label: player2.name,
        data: [
          (parseFloat(player2.ppg) / 30) * 100,
          (parseFloat(player2.rpg) / 12) * 100,
          (parseFloat(player2.apg) / 10) * 100,
          (parseFloat(player2.spg) / 2.5) * 100,
          (parseFloat(player2.bpg) / 2.5) * 100,
          parseFloat(player2.fg_pct) * 100,
          parseFloat(player2.fg3_pct) * 100,
          parseFloat(player2.ft_pct) * 100,
          (parseFloat(player2.games_played) / 1500) * 100,
          parseInt(player2.championships) * 25,
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
        color: 'rgba(100, 100, 100, 0.8)',
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
        color: 'rgba(50, 50, 50, 0.8)',
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
        // Ensure this is a valid literal for Chart.js
        weight: 'bold' as 'bold',
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        // Custom tooltip to show actual values rather than normalized ones
        label: function(context: any) {
          const datasetIndex = context.datasetIndex;
          const index = context.dataIndex;
          const player = datasetIndex === 0 ? player1 : player2;
          
          // Display original values based on the stat category
          switch(index) {
            case 0: return `${player.name}: ${player.ppg} PPG`;
            case 1: return `${player.name}: ${player.rpg} RPG`;
            case 2: return `${player.name}: ${player.apg} APG`;
            case 3: return `${player.name}: ${player.spg} SPG`;
            case 4: return `${player.name}: ${player.bpg} BPG`;
            case 5: return `${player.name}: ${(parseFloat(player.fg_pct) * 100).toFixed(1)}% FG`;
            case 6: return `${player.name}: ${(parseFloat(player.fg3_pct) * 100).toFixed(1)}% 3P`;
            case 7: return `${player.name}: ${(parseFloat(player.ft_pct) * 100).toFixed(1)}% FT`;
            case 8: return `${player.name}: ${player.games_played} Games`;
            case 9: return `${player.name}: ${player.championships} Championships`;
            default: return '';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-blue-500/5 dark:bg-blue-500/10 -z-10"></div>
      <div className="absolute top-[20vh] right-0 w-1/3 h-[30vh] rounded-full bg-red-500/5 dark:bg-red-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-[40vh] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl -z-10"></div>
      
      <AnimationStyles />
      
      <div className="container mx-auto px-4 relative pt-8">
        <header className="py-12 md:py-16 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-blue-500/10 to-red-500/10 dark:from-blue-500/20 dark:to-red-500/20 blur-3xl rounded-full -z-10"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mb-6 font-medium group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Player Stats</span>
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 dark:from-blue-400 dark:via-purple-400 dark:to-red-400 leading-tight">
              Player Comparison
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Compare stats head-to-head between any two NBA players to see who dominates in different categories
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20 mx-auto max-w-3xl transform transition-all hover:shadow-xl">
            <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player 1
                </label>
                <select 
                  value={selectedPlayer1}
                  onChange={(e) => handlePlayer1Change(e.target.value)}
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800 focus:ring-opacity-50 transition-all"
                >
                  {players.map((player) => (
                    <option key={`p1-${player.id}`} value={player.id}>
                      {player.name} ({player.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player 2
                </label>
                <select 
                  value={selectedPlayer2}
                  onChange={(e) => handlePlayer2Change(e.target.value)}
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 dark:focus:ring-red-800 focus:ring-opacity-50 transition-all"
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
        
        <div className="flex flex-col lg:flex-row gap-8 mb-12 animated-section">
          {/* Player cards */}
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-6">
            {/* Player 1 */}
            <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden border border-blue-100 dark:border-blue-900/30 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-60 relative bg-gradient-to-r from-blue-400/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-600/20">
                <Image
                  src={getPlayerImage(player1.id)}
                  alt={player1.name}
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
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">{player1.name}</h2>
                  <div className="flex justify-between mt-3 mb-4">
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      {player1.role}
                    </div>
                    <div className="flex items-center px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
                      <Image 
                        src="/trophy.svg"  
                        alt="Championships"
                        width={16}
                        height={16}
                        className="text-yellow-500 mr-1"
                      />
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{player1.championships}</span>
                    </div>
                  </div>
                  <div className="text-center mt-5 px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      {parseInt(player1.career_pts).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600/70 dark:text-blue-400/70">Career Points</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Player 2 */}
            <div className="flex-1 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden border border-red-100 dark:border-red-900/30 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-60 relative bg-gradient-to-r from-red-400/10 to-red-600/10 dark:from-red-400/20 dark:to-red-600/20">
                <Image
                  src={getPlayerImage(player2.id)}
                  alt={player2.name}
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
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400">{player2.name}</h2>
                  <div className="flex justify-between mt-3 mb-4">
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                      {player2.role}
                    </div>
                    <div className="flex items-center px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
                      <Image 
                        src="/trophy.svg"  
                        alt="Championships"
                        width={16}
                        height={16}
                        className="text-yellow-500 mr-1"
                      />
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{player2.championships}</span>
                    </div>
                  </div>
                  <div className="text-center mt-5 px-4 py-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-xl">
                    <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                      {parseInt(player2.career_pts).toLocaleString()}
                    </div>
                    <div className="text-sm text-red-600/70 dark:text-red-400/70">Career Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Radar chart */}
          <div className="w-full lg:w-1/2 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl">
            <h3 className="text-center text-xl font-bold mb-5 text-gray-800 dark:text-white">Player Skills Comparison</h3>
            <div className="w-full h-[500px] relative">
              <Radar data={radarData} options={chartOptions} />
              <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                * All values normalized to facilitate comparison across different statistical categories
              </div>
            </div>
          </div>
        </div>
        
        {/* Stat comparison bars */}
        <div className="mt-12 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl animated-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Head-to-Head Stats</h2>
            <div className="flex gap-6">
              <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{player1.name}</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/30 rounded-full">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">{player2.name}</span>
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
                className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800/40 transition-all shadow-sm ml-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share Comparison</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <StatComparisonBar 
              label="Points Per Game" 
              value1={parseFloat(player1.ppg)} 
              value2={parseFloat(player2.ppg)}
              maxValue={maxValues.ppg}
            />
            
            <StatComparisonBar 
              label="Rebounds Per Game" 
              value1={parseFloat(player1.rpg)} 
              value2={parseFloat(player2.rpg)}
              maxValue={maxValues.rpg}
            />
            
            <StatComparisonBar 
              label="Assists Per Game" 
              value1={parseFloat(player1.apg)} 
              value2={parseFloat(player2.apg)}
              maxValue={maxValues.apg}
            />
            
            <StatComparisonBar 
              label="Steals Per Game" 
              value1={parseFloat(player1.spg)} 
              value2={parseFloat(player2.spg)}
              maxValue={maxValues.spg}
            />
            
            <StatComparisonBar 
              label="Blocks Per Game" 
              value1={parseFloat(player1.bpg)} 
              value2={parseFloat(player2.bpg)}
              maxValue={maxValues.bpg}
            />
            
            <StatComparisonBar 
              label="Field Goal %" 
              value1={parseFloat(player1.fg_pct) * 100} 
              value2={parseFloat(player2.fg_pct) * 100}
              maxValue={maxValues.fg_pct}
            />
            
            <StatComparisonBar 
              label="3-Point %" 
              value1={parseFloat(player1.fg3_pct) * 100} 
              value2={parseFloat(player2.fg3_pct) * 100}
              maxValue={maxValues.fg3_pct}
            />
            
            <StatComparisonBar 
              label="Free Throw %" 
              value1={parseFloat(player1.ft_pct) * 100} 
              value2={parseFloat(player2.ft_pct) * 100}
              maxValue={maxValues.ft_pct}
            />
            
            <StatComparisonBar 
              label="Games Played" 
              value1={parseFloat(player1.games_played)} 
              value2={parseFloat(player2.games_played)}
              maxValue={maxValues.games_played}
            />
            
            <StatComparisonBar 
              label="Career Points" 
              value1={parseFloat(player1.career_pts)} 
              value2={parseFloat(player2.career_pts)}
              maxValue={maxValues.career_pts}
            />
          </div>
        </div>
        
        <footer className="mt-20 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm mb-6">
            <div className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
              Data based on career statistics through 2025
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
