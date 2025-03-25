import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import PlayerCard from './components/PlayerCard';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './components/ThemeToggle';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-10">
      <div className="container mx-auto px-4">
        {/* Theme toggle button with improved position and clickability */}
        <div className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full hover:shadow-xl transition-all">
          <ThemeToggle />
        </div>

        <header className="mb-14 text-center relative">
          {/* Modern decorative elements */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-40 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full z-0"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              NBA Player Stats
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Explore and compare career statistics for the top NBA players of all time, from scoring legends to defensive masters.
            </p>
            <Link 
              href="/compare" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4.5h12V5a1 1 0 00-1-1H5zm7 9a1 1 0 01-1-1v-1H9a1 1 0 010-2h2V9a1 1 0 112 0v1h2a1 1 0 110 2h-2v1a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
              Compare Players
            </Link>
          </div>
        </header>
        
        <div className="mb-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Top Performers</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">Showing top 20 by career points</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {topPlayers.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              imagePath={getPlayerImage(player.id)}
            />
          ))}
        </div>
        
        <footer className="mt-24 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex gap-4 items-center text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Stats API</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Data based on career statistics through 2023
            </p>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 w-24"></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
