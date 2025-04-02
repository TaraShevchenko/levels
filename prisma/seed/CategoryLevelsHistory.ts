import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';





const prisma = new PrismaClient()

//TODO: move in utility to use for all package.json scripts
function parseArgs() {
    const args = process.argv.slice(2)
    const params: Record<string, string | number> = {}

    args.forEach((arg) => {
        const [key, value] = arg.split('=')
        if (key && value) {
            params[key] = isNaN(Number(value)) ? value : Number(value)
        }
    })

    return params
}

async function seedingCategoryLevelsHistory() {
    const categories = await prisma.category.findMany()

    for (const category of categories) {
        let currentLevel = 1
        const historyRecords = []

        // Создаем записи за последние 10 дней
        for (let i = 0; i < 10; i++) {
            const willIncrease = Math.random() < 0.7

            // Если уровень 1, то только увеличиваем
            if (currentLevel === 1) {
                currentLevel += 1
            } else {
                currentLevel += willIncrease ? 1 : -1
            }

            // Создаем дату для i-того дня назад от текущей даты
            const date = new Date()
            date.setDate(date.getDate() - (9 - i)) // 9-i чтобы записи шли от старых к новым
            date.setHours(faker.number.int({ min: 9, max: 20 })) // Устанавливаем случайное время между 9:00 и 20:00
            date.setMinutes(faker.number.int({ min: 0, max: 59 }))
            date.setSeconds(faker.number.int({ min: 0, max: 59 }))

            historyRecords.push({
                categoryId: category.id,
                level: currentLevel,
                totalExperience: currentLevel * 1000 + faker.number.int({ min: 0, max: 999 }),
                achievedAt: date,
            })
        }

        // Сортируем записи по дате
        historyRecords.sort((a, b) => a.achievedAt.getTime() - b.achievedAt.getTime())

        // Создаем записи в базе данных
        await prisma.categoryLevelHistory.createMany({
            data: historyRecords,
            skipDuplicates: true,
        })

        console.log(`Создано ${historyRecords.length} записей истории уровней для категории ${category.name}`)
    }
}

seedingCategoryLevelsHistory()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect().catch((error) => {
            console.error('Prisma disconnect error!', error)
        })
    })