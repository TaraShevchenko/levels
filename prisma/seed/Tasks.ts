import { PrismaClient, TaskPoints, TaskStatus, TaskType } from '@prisma/client'

const prisma = new PrismaClient()

const tasks = [
    {
        name: '1 god component',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: '2 props drilling',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: '3 premature optimization',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: '4 global state coupling',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: '5 components folder',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: '6 useEffect driven development',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: '7 low level code',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Programming',
    },
    {
        name: 'Create a list of meals for the week',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'Nutrition',
    },
    {
        name: 'Sleep preparations',
        status: TaskStatus.TODO,
        type: TaskType.HABIT,
        categoryName: 'Sleep',
    },
    {
        name: 'Morning walk',
        status: TaskStatus.TODO,
        type: TaskType.HABIT,
        categoryName: 'Sport',
    },
    {
        name: 'Gym trainings',
        status: TaskStatus.TODO,
        type: TaskType.HABIT,
        categoryName: 'Sport',
    },
    {
        name: 'Module 1, Lesson 1',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'English',
    },
    {
        name: 'Module 1, Lesson 2',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'English',
    },
    {
        name: 'Module 1, Lesson 3',
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        categoryName: 'English',
    },
]

async function seedTasks() {
    console.log('Начало сидинга задач...')

    for (const task of tasks) {
        const category = await prisma.category.findUnique({
            where: { name: task.categoryName },
        })

        if (!category) {
            console.log(`Категория ${task.categoryName} не найдена`)
            continue
        }

        await prisma.task.create({
            data: {
                name: task.name,
                status: task.status,
                type: task.type,
                categoryId: category.id,
            },
        })
    }

    console.log('Сидинг задач завершен!')
}

seedTasks()
    .catch((e) => {
        console.error('Ошибка при сидинге задач:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
