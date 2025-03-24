'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from 'next/link';

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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

export default function PlayerCard({ player, imagePath }: { player: PlayerStat; imagePath: string }) {
  const [imgSrc, setImgSrc] = useState('/players/default.avif'); // Use .avif for default image
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Set the image path after component mounts to avoid hydration issues
  useEffect(() => {
    setImgSrc(imagePath);
    setImgError(false); // Reset error state when path changes
  }, [imagePath]);

  return (
    <Link href={`/player/${player.id}`} className="block w-full h-full">
      <div className="flex flex-col items-center bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md overflow-hidden w-full max-w-sm border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 h-full">
        <div className="w-full h-80 relative bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
          {isLoading && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {imgError ? (
            // Render a fallback UI when image fails to load
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gray-100 dark:bg-gray-800">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-5 mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">{player.name}</p>
            </div>
          ) : (
            <>
              <Image 
                src={imgSrc}
                alt={player.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 300px"
                onError={() => {
                  console.error(`Error loading image for ${player.name} at path ${imgSrc}`);
                  setImgError(true);
                  setIsLoading(false);
                  setImgSrc('/players/default.avif');
                }}
                onLoad={() => setIsLoading(false)}
                priority={parseInt(player.id) <= 5}
                unoptimized={true}
                className="transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          )}
        </div>
        <div className="p-6 w-full h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300">{player.name}</h2>
            <div className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50/80 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 backdrop-blur-sm">
              {player.role}
            </div>
          </div>
          <div className="flex items-center mb-5 gap-1.5 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-lg p-2 backdrop-blur-sm">
            <Image 
              src="/trophy.svg"  
              alt="Championships"
              width={18}
              height={18}
              className="text-yellow-500"
            />
            <span className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
              {player.championships} {parseInt(player.championships) === 1 ? 'Championship' : 'Championships'}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatCard label="PPG" value={player.ppg} />
            <StatCard label="RPG" value={player.rpg} />
            <StatCard label="APG" value={player.apg} />
            <StatCard label="SPG" value={player.spg} />
            <StatCard label="BPG" value={player.bpg} />
            <StatCard label="Games" value={player.games_played} />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Shooting Efficiency</h3>
            <div className="flex justify-between space-x-2">
              <StatCard label="FG%" value={`${parseFloat(player.fg_pct) * 100}%`} />
              <StatCard label="3P%" value={`${parseFloat(player.fg3_pct) * 100}%`} />
              <StatCard label="FT%" value={`${parseFloat(player.ft_pct) * 100}%`} />
            </div>
          </div>
          
          <div className="mt-5 text-center px-4 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl backdrop-blur-sm mt-auto">
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{parseInt(player.career_pts).toLocaleString()}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Career Points</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
