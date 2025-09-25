import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { keccak256 } from "js-sha3"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Hash a review using double keccak256
 * keccak256(keccak256(review))
 */
export function hashReview(review: string): string {
  const firstHash = keccak256(review)
  const secondHash = keccak256(firstHash)
  return `0x${secondHash}`
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}

/**
 * Calculate total from array of numbers
 */
export function calculateTotal(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format time duration
 */
export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days} days ${remainingHours.toFixed(1)} hours`
}

/**
 * Generate proof ID
 */
export function generateProofId(agentId?: string, timestamp?: number): string {
  if (agentId && timestamp) {
    return keccak256(`${agentId}-${timestamp}`)
  }
  return `proof-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
