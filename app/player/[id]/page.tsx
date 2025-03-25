'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import ThemeToggle from '../../components/ThemeToggle';
import AnimationStyles from '../../components/AnimationStyles';
import YearlyStatsChart from '../../components/YearlyStatsChart';
import YearlyStatsTable from '../../components/YearlyStatsTable';
import StatsToggle from '../../components/StatsToggle'; // Add import

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

// Change to use useParams hook instead of accepting params directly
export default function PlayerDetail() {
  const [player, setPlayer] = useState<PlayerStat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showYearlyStats, setShowYearlyStats] = useState(false); // Add state for toggle
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        const playerData = data.find((p: PlayerStat) => p.id === playerId);
        
        if (playerData) {
          setPlayer(playerData);
        } else {
          console.error('Player not found');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching player data:', error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [playerId]);

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

  if (!player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
        <h1 className="text-3xl font-bold mb-4">Player Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The player you're looking for doesn't exist or has been removed.</p>
        <Link 
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const getPlayerImage = (id: string) => {
    return `/players/${id}.avif`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-12 sm:pb-20">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-blue-500/5 dark:bg-blue-500/10 -z-10"></div>
      <div className="absolute top-[20vh] right-0 w-1/3 h-[30vh] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-[40vh] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl -z-10"></div>
      
      <AnimationStyles />
      
      <div className="container mx-auto px-4 sm:px-6 relative pt-4 sm:pt-8">
        {/* Theme toggle button */}
        <div className="fixed bottom-4 right-4 z-50 shadow-lg rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105">
          <ThemeToggle />
        </div>
        
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-8 gap-4">
          <Link href="/" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to All Players</span>
          </Link>
          
          <Link 
            href={`/compare?p1=${player.id}&p2=21`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Compare</span>
          </Link>
        </header>
        
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50 mb-6 sm:mb-10">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 h-80 md:h-auto relative">
              <Image
                src={getPlayerImage(player.id)}
                alt={player.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 500px"
                onError={(e) => {
                  e.currentTarget.src = '/players/default.avif';
                }}
                priority
                unoptimized={true}
                className="md:rounded-l-2xl"
              />
            </div>
            
            <div className="p-4 sm:p-8 md:w-2/3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold mb-2">{player.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      {player.role}
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Image 
                        src="/trophy.svg"  
                        alt="Championships"
                        width={18}
                        height={18}
                        className="text-yellow-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {player.championships} {parseInt(player.championships) === 1 ? 'Championship' : 'Championships'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl mt-2 md:mt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{parseInt(player.career_pts).toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Career Points</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatBlock label="PPG" value={player.ppg} />
                <StatBlock label="RPG" value={player.rpg} />
                <StatBlock label="APG" value={player.apg} />
                <StatBlock label="Games" value={player.games_played} />
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Defensive Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatBlock label="SPG" value={player.spg} />
                <StatBlock label="BPG" value={player.bpg} />
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Shooting Efficiency</h2>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatBlock label="FG%" value={`${(parseFloat(player.fg_pct) * 100).toFixed(1)}%`} />
                <StatBlock label="3P%" value={`${(parseFloat(player.fg3_pct) * 100).toFixed(1)}%`} />
                <StatBlock label="FT%" value={`${(parseFloat(player.ft_pct) * 100).toFixed(1)}%`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Add the toggle before the stats section */}
        <div className="flex justify-end my-4">
          <StatsToggle onChange={setShowYearlyStats} />
        </div>

        {/* Conditionally render stats based on toggle */}
        {showYearlyStats ? (
          <>
            <div className="mt-8">
              <YearlyStatsChart playerId={playerId} playerName={player.name} />
            </div>
            <div className="mt-6 mb-10">
              <YearlyStatsTable playerId={playerId} />
            </div>
          </>
        ) : (
          // Original career stats content
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-md p-6 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold mb-4">Career Overview</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {player.games_played} games, averaging {player.ppg} points per game with 
                a field goal percentage of {(parseFloat(player.fg_pct) * 100).toFixed(1)}%.
              </p>
            </div>
            
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-md p-6 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold mb-4">Team Impact</h2>
              {/* Here you could add information about team impact */}
              <p className="text-gray-600 dark:text-gray-400">
                With {player.championships} {parseInt(player.championships) === 1 ? 'championship' : 'championships'} 
                to {player.name}'s name, their impact went beyond just statistics.
                {parseInt(player.championships) > 2 ? " They were a true dynasty player." : ""}
              </p>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Compare With Other Players</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[5, 9, 21].filter(id => id.toString() !== player.id).map(id => (
              <Link
                key={id}
                href={`/compare?p1=${player.id}&p2=${id}`}
                className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg transition-colors shadow-sm"
              >
                Compare with Player #{id}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl">
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="text-lg sm:text-2xl font-bold">{value}</div>
    </div>
  );
}
