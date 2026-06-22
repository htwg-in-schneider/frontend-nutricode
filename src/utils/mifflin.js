import { ACTIVITY_LEVELS, GOAL_CALORIE_DELTA } from '../constants/nutrition.js'

/**
 * Mifflin-St-Jeor-Berechnung des täglichen Kalorienbedarfs.
 *
 * Grundumsatz (BMR):
 *   Männer:  10·kg + 6,25·cm − 5·Jahre + 5
 *   Frauen:  10·kg + 6,25·cm − 5·Jahre − 161
 * Tagesbedarf (TDEE) = BMR × Aktivitätsfaktor.
 * Zielkalorien        = TDEE + Ziel-Anpassung (Abnehmen/Halten/Muskelaufbau).
 *
 * Gibt null zurück, solange nicht alle nötigen Werte vorhanden sind.
 */

export function calcBmr({ sex, weightKg, heightCm, age }) {
  if (!sex || !weightKg || !heightCm || !age) return null
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(sex === 'MALE' ? base + 5 : base - 161)
}

export function calcTdee(metrics) {
  const bmr = calcBmr(metrics)
  if (bmr === null) return null
  const level = ACTIVITY_LEVELS.find((l) => l.key === metrics.activityLevel)
  if (!level) return null
  return Math.round(bmr * level.factor)
}

export function calcTargetCalories(metrics, goal) {
  const tdee = calcTdee(metrics)
  if (tdee === null) return null
  const delta = GOAL_CALORIE_DELTA[goal] ?? 0
  return Math.max(0, tdee + delta)
}
