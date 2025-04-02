import { TaskPoints } from '@prisma/client'

export const TASK_POINTS = {
    [TaskPoints.ONE]: {
        number: '1',
        description: '10 - 15m',
    },
    [TaskPoints.TWO]: {
        number: '2',
        description: '20 - 30m',
    },
    [TaskPoints.THREE]: {
        number: '3',
        description: '45m - 1h',
    },
    [TaskPoints.FIVE]: {
        number: '5',
        description: '1.5 - 2.5h',
    },
    [TaskPoints.EIGHT]: {
        number: '8',
        description: '3 - 5h',
    },
    [TaskPoints.THIRTEEN]: {
        number: '13',
        description: '6 - 12h',
    },
    [TaskPoints.TWENTY_ONE]: {
        number: '21',
        description: '8 - 16h',
    },
}

export const TASK_POINTS_ARRAY = Object.entries(TASK_POINTS).map(([key, value]) => ({
    value: key as TaskPoints,
    number: value.number,
    description: value.description,
}))
