import { describe, expect, it } from 'vitest'
import {
  decrementGoal,
  goalsAfterStatusChange,
  goalsRequiredForStatus,
  incrementGoal,
  showGoalsForStatus,
} from './fixtureRules'

describe('fixtureRules', () => {
  describe('showGoalsForStatus', () => {
    it('próximo no muestra goles', () => {
      expect(showGoalsForStatus('upcoming')).toBe(false)
    })

    it('finalizado y suspendido muestran goles', () => {
      expect(showGoalsForStatus('finished')).toBe(true)
      expect(showGoalsForStatus('suspended')).toBe(true)
    })
  })

  describe('goalsRequiredForStatus', () => {
    it('solo finalizado exige goles', () => {
      expect(goalsRequiredForStatus('finished')).toBe(true)
      expect(goalsRequiredForStatus('suspended')).toBe(false)
      expect(goalsRequiredForStatus('upcoming')).toBe(false)
    })
  })

  describe('goalsAfterStatusChange', () => {
    it('al pasar a próximo limpia los goles', () => {
      expect(goalsAfterStatusChange('upcoming', { goals_for: 2, goals_against: 1 })).toEqual({
        goals_for: null,
        goals_against: null,
      })
    })

    it('al pasar a finalizado o suspendido conserva los goles', () => {
      expect(goalsAfterStatusChange('finished', { goals_for: 2, goals_against: 1 })).toEqual({
        goals_for: 2,
        goals_against: 1,
      })
      expect(goalsAfterStatusChange('suspended', { goals_for: null, goals_against: 0 })).toEqual({
        goals_for: null,
        goals_against: 0,
      })
    })
  })

  describe('incrementGoal', () => {
    it('suma 1 partiendo de un valor dado', () => {
      expect(incrementGoal(2)).toBe(3)
    })

    it('parte de 0 cuando el valor es null', () => {
      expect(incrementGoal(null)).toBe(1)
    })
  })

  describe('decrementGoal', () => {
    it('resta 1 cuando el valor es positivo', () => {
      expect(decrementGoal(2)).toBe(1)
    })

    it('nunca baja de 0', () => {
      expect(decrementGoal(0)).toBe(0)
      expect(decrementGoal(null)).toBe(0)
    })
  })
})