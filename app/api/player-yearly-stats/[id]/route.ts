import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Use the absolute minimum syntax that Next.js expects
export function GET(request: NextRequest, context: any) {
  const { params } = context;
  const playerId = params.id;
  
  try {
    // Get all files in the player-stats directory
    const statsDir = path.join(process.cwd(), 'player-stats');
    
    // Make sure the directory exists
    if (!fs.existsSync(statsDir)) {
      fs.mkdirSync(statsDir, { recursive: true });
      return NextResponse.json(
        { error: 'Stats directory not initialized yet' },
        { status: 404 }
      );
    }
    
    const files = fs.readdirSync(statsDir);
    
    // First try an exact ID match (most reliable)
    let statsFile = files.find(file => 
      file.startsWith(`${playerId}_`) || 
      file.includes(`_${playerId}_yearly`) ||
      file === `${playerId}.csv` ||
      file === `player_${playerId}_yearly.csv`
    );
    
    // If no exact match, try to match by player's name from the players API
    if (!statsFile) {
      try {
        // Get the player data to find their name - update to use career_averages.csv
        const playersFilePath = path.join(process.cwd(), 'career_averages.csv');
        const playersData = fs.readFileSync(playersFilePath, 'utf8');
        
        // Skip header comment line if present
        const playersDataToProcess = playersData.startsWith('//') 
          ? playersData.split('\n').slice(1).join('\n') 
          : playersData;
        
        const players = parse(playersDataToProcess, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
        
        const player = players.find((p: any) => p.id === playerId);
        
        if (player) {
          // Try to find a file containing the player's name
          const playerName = player.name.replace(/\s+/g, '_').toLowerCase();
          statsFile = files.find(file => 
            file.toLowerCase().includes(playerName) || 
            file.toLowerCase().includes(player.name.toLowerCase())
          );
        }
      } catch (err) {
        console.error('Error finding player name:', err);
      }
    }
    
    // If still no match, use Ja Morant as fallback (but log this clearly)
    if (!statsFile) {
      console.log(`Using example data for player ID ${playerId} - no specific data found`);
      statsFile = 'example_Ja_Morant_yearly.csv';
    }
    
    const filePath = path.join(statsDir, statsFile);
    
    // Check if file exists (it should, but just to be safe)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Yearly stats file '${statsFile}' not found for player ${playerId}` },
        { status: 404 }
      );
    }
    
    // Read and parse CSV
    const csvData = fs.readFileSync(filePath, 'utf8');
    
    // Skip header comment line if present
    const dataToProcess = csvData.startsWith('//') 
      ? csvData.split('\n').slice(1).join('\n') 
      : csvData;
    
    // Parse the CSV data
    const yearlyStats = parse(dataToProcess, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    // Ensure all records have required fields (with defaults if missing)
    const processedStats = yearlyStats.map((stat: any) => ({
      season: stat.season || '2023-24',
      team: stat.team || '1610612763', // Default team code
      games_played: stat.games_played || '0',
      pts: stat.pts || '0',
      ppg: stat.ppg || '0',
      rpg: stat.rpg || '0',
      apg: stat.apg || '0',
      spg: stat.spg || '0',
      bpg: stat.bpg || '0',
      fg_pct: stat.fg_pct || '0',
      ft_pct: stat.ft_pct || '0',
      fg3_pct: stat.fg3_pct || '0',
    }));
    
    // Sort by season (most recent first)
    const sortedStats = processedStats.sort((a: any, b: any) => {
      const yearA = parseInt(a.season.split('-')[0]);
      const yearB = parseInt(b.season.split('-')[0]);
      return yearB - yearA;
    });
    
    return NextResponse.json(sortedStats);
  } catch (error) {
    console.error('Error reading yearly player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yearly stats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

