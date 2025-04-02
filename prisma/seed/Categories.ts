import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
    {
        name: 'Sport',
        abbreviation: 'SPT',
        description: 'Physical activities and exercises',
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        baseExperienceToLevel: 100,
        levelExperienceIncrement: 100,
    },
    {
        name: 'Programming',
        abbreviation: 'PRG',
        description: 'Software development and coding',
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        baseExperienceToLevel: 100,
        levelExperienceIncrement: 100,
    },
    {
        name: 'English',
        abbreviation: 'ENG',
        description: 'English language learning and practice',
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        baseExperienceToLevel: 100,
        levelExperienceIncrement: 100,
    },
    {
        name: 'Sleep',
        abbreviation: 'SLP',
        description: 'Sleep schedule and quality',
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        baseExperienceToLevel: 100,
        levelExperienceIncrement: 100,
    },
    {
        name: 'Nutrition',
        abbreviation: 'NTR',
        description: 'Healthy eating and diet',
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        baseExperienceToLevel: 100,
        levelExperienceIncrement: 100,
    },
    {
        name: 'Job',
        abbreviation: 'JOB',
        description: 'Work-related tasks and projects',
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        baseExperienceToLevel: 100,
        levelExperienceIncrement: 100,
    },
]

async function seedCategories() {
    console.log('Начало сидинга категорий...')

    for (const category of categories) {
        await prisma.category.upsert({
            where: {
                name: category.name,
            },
            update: {},
            create: category,
        })
    }

    console.log('Сидинг категорий завершен!')
}

seedCategories()
    .catch((e) => {
        console.error('Ошибка при сидинге категорий:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
