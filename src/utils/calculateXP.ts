import { TaskPoints } from '@prisma/client'

export function calculateXP(
    timeSpentSeconds: number, // Фактическое время выполнения (в секундах)
    estimatedComplexity: TaskPoints | null, // Оценочная сложность (Фибоначчи)
): number {
    const baseExperience = 100 // Базовый XP
    const alpha = 0.5 // Влияние точности оценки
    const penalty = estimatedComplexity === null ? 0.9 : 1

    // Таблица соответствия оценки и времени (средний диапазон)
    const timeMap: Record<TaskPoints, number> = {
        [TaskPoints.ONE]: 12.5 * 60, // 10-15 минут
        [TaskPoints.TWO]: 25 * 60, // 20-30 минут
        [TaskPoints.THREE]: 52.5 * 60, // 45-60 минут
        [TaskPoints.FIVE]: 120 * 60, // 90-150 минут
        [TaskPoints.EIGHT]: 240 * 60, // 180-300 минут
        [TaskPoints.THIRTEEN]: 540 * 60, // 450-720 минут
        [TaskPoints.TWENTY_ONE]: 960 * 60, // 720-1200 минут
    }

    // Ожидаемое время выполнения (в секундах)
    let XP: number

    if (estimatedComplexity === null) {
        // Если оценка не проставлена → считаем только по времени с небольшим штрафом
        const T = Math.log2(1 + timeSpentSeconds / 3600)
        XP = baseExperience * T * penalty
    } else {
        // Ожидаемое время выполнения (в секундах)
        const estimatedTimeSeconds = timeMap[estimatedComplexity] || 60 * 60

        // Отклонение фактического времени от ожидаемого
        const accuracy = 1 - Math.abs((timeSpentSeconds - estimatedTimeSeconds) / estimatedTimeSeconds)
        const A = Math.max(0, accuracy) // Ограничиваем снизу (не даём уйти в отрицательные значения)

        // Бонус за время (логарифмический)
        const T = Math.log2(1 + timeSpentSeconds / 3600)

        // Финальный расчёт XP
        XP = baseExperience * (1 + alpha * A) * T
    }

    return Math.round(XP)
}
