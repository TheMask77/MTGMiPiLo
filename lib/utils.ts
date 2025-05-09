import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format tournament results
export function formatResult(wins: number, losses: number): string {
  return `${wins}-${losses}`
}

// Helper function to parse tournament results
export function parseResult(result: string): { wins: number; losses: number } {
  const [wins, losses] = result.split("-").map((num) => Number.parseInt(num.trim(), 10))
  return { wins, losses }
}

// Helper function to calculate win rate
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

// Helper function to calculate profit
export function calculateProfit(cost: number, prize: number): number {
  return prize - cost
}
