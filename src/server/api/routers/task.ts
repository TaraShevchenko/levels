import { TaskPoints, TaskStatus, WeekDay } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, publicProcedure } from 'server/api/trpc'
import { calculateXP } from 'utils/calculateXP'
import { z } from 'zod'

export const taskRouter = createTRPCRouter({
    getTasks: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.task.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                goal: true,
                steps: true,
                category: true,
                timeEntries: true,
                completionHistory: {
                    orderBy: {
                        completedAt: 'desc',
                    },
                    take: 1,
                },
            },
        })
    }),
    startTask: publicProcedure
        .input(
            z.object({
                taskId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Получаем задачу и проверяем её статус
            const task = await ctx.db.task.findUnique({
                where: { id: input.taskId },
            })

            if (!task) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Задача не найдена',
                })
            }

            if (task.status !== TaskStatus.TODO) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Можно запустить только задачу со статусом TODO',
                })
            }

            // Создаем объект для обновления задачи
            const updateData: any = {
                status: TaskStatus.INPROGRESS,
            }

            // Обновляем задачу и создаем запись времени в транзакции
            return await ctx.db.$transaction([
                ctx.db.task.update({
                    where: { id: input.taskId },
                    data: updateData,
                }),
                ctx.db.taskTimeEntry.create({
                    data: {
                        taskId: input.taskId,
                        startTime: new Date(),
                    },
                }),
            ])
        }),
    stopTask: publicProcedure
        .input(
            z.object({
                taskId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Получаем задачу и проверяем её статус
            const task = await ctx.db.task.findUnique({
                where: { id: input.taskId },
            })

            if (!task) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Задача не найдена',
                })
            }

            if (task.status !== TaskStatus.INPROGRESS) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Можно остановить только задачу со статусом IN_PROGRESS',
                })
            }

            // Получаем последнюю запись времени
            const lastTimeEntry = await ctx.db.taskTimeEntry.findFirst({
                where: {
                    taskId: input.taskId,
                    endTime: null,
                },
                orderBy: {
                    startTime: 'desc',
                },
            })

            if (!lastTimeEntry) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Не найдена активная запись времени для задачи',
                })
            }

            const now = new Date()
            const durationInSeconds = Math.floor((now.getTime() - lastTimeEntry.startTime.getTime()) / 1000)

            // Обновляем задачу и запись времени в транзакции
            return await ctx.db.$transaction([
                ctx.db.task.update({
                    where: { id: input.taskId },
                    data: {
                        status: TaskStatus.TODO,
                    },
                }),
                ctx.db.taskTimeEntry.update({
                    where: { id: lastTimeEntry.id },
                    data: {
                        endTime: now,
                        duration: durationInSeconds,
                    },
                }),
            ])
        }),
    updateTaskPoints: publicProcedure
        .input(
            z.object({
                taskId: z.string(),
                points: z.nativeEnum(TaskPoints),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const task = await ctx.db.task.findUnique({
                where: { id: input.taskId },
            })

            if (!task) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Задача не найдена',
                })
            }

            return await ctx.db.task.update({
                where: { id: input.taskId },
                data: {
                    estimatedPoints: input.points,
                },
            })
        }),
    completeTask: publicProcedure.input(z.object({ taskId: z.string() })).mutation(async ({ ctx, input }) => {
        const task = await ctx.db.task.findUnique({
            where: { id: input.taskId },
            include: {
                timeEntries: true,
            },
        })

        if (!task) {
            throw new Error('Task not found')
        }

        // Если задача в процессе, нужно закрыть текущую timeEntry
        if (task.status === TaskStatus.INPROGRESS) {
            const lastTimeEntry = task.timeEntries[task.timeEntries.length - 1]
            if (lastTimeEntry && !lastTimeEntry.endTime) {
                const endTime = new Date()
                const duration = Math.floor((endTime.getTime() - lastTimeEntry.startTime.getTime()) / 1000)

                await ctx.db.taskTimeEntry.update({
                    where: { id: lastTimeEntry.id },
                    data: {
                        endTime,
                        duration,
                    },
                })
            }
        }

        // Считаем общее время выполнения задачи
        const totalTimeSpent = task.timeEntries.reduce((acc, entry) => acc + (entry.duration ?? 0), 0)

        // Рассчитываем опыт
        const experienceGained = calculateXP(totalTimeSpent, task?.estimatedPoints)

        // Обновляем задачу и создаем запись о завершении в транзакции
        return await ctx.db.$transaction([
            ctx.db.task.update({
                where: { id: input.taskId },
                data: { status: TaskStatus.COMPLETED },
            }),
            ctx.db.taskCompletion.create({
                data: {
                    taskId: input.taskId,
                    experienceGained,
                },
            }),
        ])
    }),
    returnToNotStarted: publicProcedure.input(z.object({ taskId: z.string() })).mutation(async ({ ctx, input }) => {
        const task = await ctx.db.task.findUnique({
            where: { id: input.taskId },
        })

        if (!task) {
            throw new Error('Task not found')
        }

        if (task.status !== TaskStatus.COMPLETED) {
            throw new Error('Task must be completed to return to not started')
        }

        // Находим последнюю запись о завершении для этой задачи
        const lastCompletion = await ctx.db.taskCompletion.findFirst({
            where: { taskId: input.taskId },
            orderBy: { completedAt: 'desc' },
        })

        // Обновляем задачу и удаляем запись о завершении в транзакции
        return await ctx.db.$transaction([
            ctx.db.task.update({
                where: { id: input.taskId },
                data: { status: TaskStatus.TODO },
            }),
            ...(lastCompletion
                ? [
                      ctx.db.taskCompletion.delete({
                          where: { id: lastCompletion.id },
                      }),
                  ]
                : []),
        ])
    }),
    updateTaskSchedule: publicProcedure
        .input(
            z.object({
                taskId: z.string(),
                plannedStartTime: z.date(),
                plannedEndTime: z.date(),
                weekDays: z.array(z.nativeEnum(WeekDay)),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const task = await ctx.db.task.findUnique({
                where: { id: input.taskId },
            })

            if (!task) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Задача не найдена',
                })
            }

            // Проверяем, что время начала меньше времени окончания
            if (input.plannedStartTime >= input.plannedEndTime) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Время начала должно быть меньше времени окончания',
                })
            }

            return await ctx.db.task.update({
                where: { id: input.taskId },
                data: {
                    plannedStartTime: input.plannedStartTime,
                    plannedEndTime: input.plannedEndTime,
                    weekDays: input.weekDays,
                    weekFrequency: input.weekDays.length,
                    isScheduled: true,
                },
            })
        }),
    updateTaskDateTime: publicProcedure
        .input(
            z.object({
                taskId: z.string(),
                plannedStartTime: z.date(),
                plannedEndTime: z.date(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { taskId, plannedStartTime, plannedEndTime } = input

            return ctx.db.task.update({
                where: { id: taskId },
                data: {
                    plannedStartTime,
                    plannedEndTime,
                },
            })
        }),
    addTimeEntry: publicProcedure
        .input(
            z.object({
                taskId: z.string(),
                startTime: z.date(),
                endTime: z.date(),
                duration: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { taskId, startTime, endTime, duration } = input

            // Используем транзакцию для атомарного обновления
            return await ctx.db.$transaction([
                // Создаем новую запись времени
                ctx.db.taskTimeEntry.create({
                    data: {
                        taskId,
                        startTime,
                        endTime,
                        duration,
                    },
                }),
                // Обновляем общее время выполнения задачи
                ctx.db.task.update({
                    where: { id: taskId },
                    data: {
                        spentTimeToComplete: {
                            increment: duration,
                        },
                    },
                }),
            ])
        }),
})
