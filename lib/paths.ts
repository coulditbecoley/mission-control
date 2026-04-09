/**
 * Centralized path management for data persistence
 * Supports both Docker and local development environments
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Determine the data directory based on environment
 * Docker: /docker/mission_control/
 * Local: ./data (relative to process.cwd())
 */
function getDataDir(): string {
  // Check if we're in production (Docker-like) environment
  if (process.env.NODE_ENV === 'production') {
    // Try Docker path first
    return '/docker/mission_control';
  }
  
  // Fallback to local data directory for development
  return path.join(process.cwd(), 'data');
}

export const DATA_DIR = getDataDir();

/**
 * Ensure data directory exists and return path to file
 */
export async function getDataFilePath(filename: string): Promise<string> {
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error(`[Paths] Failed to create data directory at ${DATA_DIR}:`, error);
  }
  
  return filePath;
}

/**
 * Safe file read with fallback
 */
export async function readDataFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const filePath = await getDataFilePath(filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[Paths] Could not read ${filename} from ${DATA_DIR}, using fallback`);
    return fallback;
  }
}

/**
 * Safe file write with error logging
 */
export async function writeDataFile<T>(filename: string, data: T): Promise<void> {
  try {
    const filePath = await getDataFilePath(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[Paths] Failed to write ${filename} to ${DATA_DIR}:`, error);
    // Don't throw - let caller decide if this is fatal
  }
}
