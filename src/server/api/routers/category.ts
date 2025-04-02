import { createTRPCRouter, publicProcedure } from 'server/api/trpc'

export const categoryRouter = createTRPCRouter({
    getCategories: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.category.findMany({
            orderBy: {
                name: 'asc',
            },
        })
    }),

    getLevelHistory: publicProcedure.query(async ({ ctx }) => {
        // Получаем дату 3 месяца назад
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        const categories = await ctx.db.category.findMany({
            include: {
                levelHistory: {
                    // where: {
                    //     achievedAt: {
                    //         gte: threeMonthsAgo,
                    //     },
                    // },
                    orderBy: {
                        achievedAt: 'asc',
                    },
                },
            },
        })

        // Собираем все уникальные даты из истории
        const allDates = new Set<string>()
        categories.forEach((category) => {
            category.levelHistory.forEach((history) => {
                allDates.add(history.achievedAt.toISOString())
            })
        })

        // Сортируем даты
        const sortedDates = Array.from(allDates).sort()

        // Создаем временную карту для отслеживания последнего уровня каждой категории
        const categoryLevels = new Map<string, number>()

        // Формируем результат
        const result = sortedDates.map((date) => {
            const dateObj = new Date(date)
            const entry: Record<string, any> = {
                date: dateObj.toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                }),
            }

            // Обновляем уровни категорий на эту дату
            categories.forEach((category) => {
                const historyEntry = category.levelHistory.find((h) => h.achievedAt.toISOString() === date)
                if (historyEntry) {
                    categoryLevels.set(category.name, historyEntry.level)
                }
                entry[category.name] = categoryLevels.get(category.name) || 0
            })

            return entry
        })

        return result
    }),
})
