import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET() {
  try {
    // Read the CSV file - Update to use career_averages.csv
    const csvFilePath = path.join(process.cwd(), 'career_averages.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    
    // Skip header comment line if present
    const dataToProcess = csvData.startsWith('//') 
      ? csvData.split('\n').slice(1).join('\n') 
      : csvData;
    
    // Parse the CSV data
    const players = parse(dataToProcess, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error reading player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
}
