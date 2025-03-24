import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import PlayerCard from './components/PlayerCard';
import Link from 'next/link';
import Image from 'next/image';
import AnimationStyles from './components/AnimationStyles';

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

// Update getPlayerImage to use avif format consistently 
function getPlayerImage(id: string) {
  // Check if this is a known id where we have images
  const availableIds = ["1", "2", "5", "9", "21"]; // IDs with images
  
  // Use .avif format for all images
  return `/players/${id}.avif`;
}

export default function Home() {
  // Read and parse the CSV file at build time
  const csvFilePath = path.join(process.cwd(), 'stat.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  
  // Skip header comment line if present
  const dataToProcess = csvData.startsWith('//') 
    ? csvData.split('\n').slice(1).join('\n') 
    : csvData;
  
  const players = parse(dataToProcess, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as PlayerStat[];
  
  // Sort players by career points (descending)
  const sortedPlayers = [...players].sort((a, b) => 
    parseInt(b.career_pts) - parseInt(a.career_pts)
  );
  
  // Take top 20 players for display
  const topPlayers = sortedPlayers.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-blue-500/5 dark:bg-blue-500/10 -z-10"></div>
      <div className="absolute top-[20vh] right-0 w-1/3 h-[30vh] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-[40vh] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl -z-10"></div>
      
      <AnimationStyles />
      
      <div className="container mx-auto px-4 relative">
        {/* Theme toggle button */}

        <header className="py-16 md:py-24 text-center relative">
          {/* Modern decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 blur-3xl rounded-full -z-10"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight">
              NBA Player Stats
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore and compare career statistics for the top NBA players of all time, from scoring legends to defensive masters.
            </p>
            <Link 
              href="/compare" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4.5h12V5a1 1 0 00-1-1H5zm7 9a1 1 0 01-1-1v-1H9a1 1 0 010-2h2V9a1 1 0 112 0v1h2a1 1 0 110 2h-2v1a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
              Compare Players
            </Link>
          </div>
        </header>
        
        <div className="mb-12 bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Top Performers</h2>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              <div className="text-sm text-gray-500 dark:text-gray-400">Ranked by career points</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 mb-16">
          {topPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className="transform transition-all duration-300 hover:-translate-y-2"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeIn 0.5s ease-out forwards',
                opacity: 0
              }}
            >
              <PlayerCard player={player} imagePath={getPlayerImage(player.id)} />
            </div>
          ))}
        </div>
        
        <footer className="mt-24 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm mb-6">
              <div className="flex gap-2 md:gap-6 items-center text-gray-600 dark:text-gray-400 px-6 py-2">
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm md:text-base">About</a>
                <span className="h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm md:text-base">Stats API</a>
                <span className="h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm md:text-base">Contact</a>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Data based on career statistics through 2025
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
