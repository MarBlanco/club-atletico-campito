import type { MatchStatus } from '../types/matches'

export interface MatchGoals {
  goals_for: number | null
  goals_against: number | null
}

export function showGoalsForStatus(status: MatchStatus): boolean {
  return status !== 'upcoming'
}

export function goalsRequiredForStatus(status: MatchStatus): boolean {
  return status === 'finished'
}

export function goalsAfterStatusChange(status: MatchStatus, goals: MatchGoals): MatchGoals {
  if (status === 'upcoming') {
    return { goals_for: null, goals_against: null }
  }
  return goals
}

export function incrementGoal(value: number | null): number {
  return (value ?? 0) + 1
}

export function decrementGoal(value: number | null): number {
  return Math.max(0, (value ?? 0) - 1)
}