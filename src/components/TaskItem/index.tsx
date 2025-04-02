'use client'

import { useState } from 'react'

import { Prisma, TaskStatus, TaskType } from '@prisma/client'
import { useQueryClient } from '@tanstack/react-query'
import { DateTimeSelector } from 'components/DateTimeSelector'
import { ScheduleSelector } from 'components/ScheduleSelector'
import { TaskPointsSelector } from 'components/TaskPointsSelector'
import { TimeRangeSelector } from 'components/TimeRangeSelector'
import { Badge } from 'components/ui/badge'
import { Button } from 'components/ui/button'
import { Timer as TimerComponent } from 'components/ui/timer'
import { cn } from 'lib/utils'
import {
    AlarmClockCheck,
    CheckCircle,
    CheckSquare,
    ListTodo,
    Pause,
    Play,
    Repeat,
    RotateCcw,
    Timer,
    Trophy,
} from 'lucide-react'
import { api } from 'trpc/react'
import { formatTime } from 'utils/formatTime'

interface TaskItemProps {
    task: Prisma.TaskGetPayload<{
        include: {
            steps: true
            category: true
            timeEntries: true
            completionHistory: true
        }
    }>
    categoryColor: string
    level?: number
}

export function TaskItem({ task, categoryColor, level = 0 }: TaskItemProps) {
    const queryClient = useQueryClient()
    const [isExpanded, setIsExpanded] = useState(false)

    const revalidateTasksList = () => {
        queryClient.invalidateQueries({
            queryKey: [['task', 'getTasks']],
        })
    }

    const { mutate: startTask, isPending: isStartTaskLoading } = api.task.startTask.useMutation({
        onSuccess: revalidateTasksList,
    })

    const { mutate: stopTask, isPending: isStopTaskLoading } = api.task.stopTask.useMutation({
        onSuccess: revalidateTasksList,
    })

    const { mutate: completeTask } = api.task.completeTask.useMutation({
        onSuccess: revalidateTasksList,
    })

    const { mutate: returnToNotStarted } = api.task.returnToNotStarted.useMutation({
        onSuccess: revalidateTasksList,
    })

    const { mutate: updatePoints } = api.task.updateTaskPoints.useMutation({
        onSuccess: revalidateTasksList,
    })

    const totalTime = task.timeEntries.reduce((acc, entry) => acc + (entry.duration ?? 0), 0)

    return (
        <div className="group">
            <div className={`flex items-center justify-between ${level > 0 ? 'ml-6' : ''}`}>
                <div className="flex flex-grow items-center space-x-1.5">
                    {task.type === TaskType.TASK && (
                        <div className="mr-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <CheckSquare className="h-3.5 w-3.5" />
                        </div>
                    )}
                    {task.type === TaskType.HABIT && (
                        <div className="mr-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Repeat className="h-3.5 w-3.5" />
                        </div>
                    )}

                    <span className={`text-sm font-medium uppercase text-gray-500`} style={{ color: categoryColor }}>
                        [{task.category?.abbreviation}]
                    </span>

                    <span
                        className={`max-w-60 truncate text-sm font-medium ${
                            task.status === TaskStatus.COMPLETED ? 'text-muted-foreground line-through' : ''
                        }`}
                    >
                        {task.name}
                    </span>

                    {task?.steps?.length > 0 && (
                        <Badge
                            onClick={() => setIsExpanded(!isExpanded)}
                            variant="outline"
                            className={cn(
                                'ml-2 cursor-pointer px-1.5',
                                isExpanded && 'border-blue-600 bg-blue-500 text-white hover:bg-blue-500',
                            )}
                        >
                            <ListTodo className="mr-1 h-3 w-3" />
                            {task.steps.length}
                        </Badge>
                    )}

                    {task.type === TaskType.TASK && (
                        <TaskPointsSelector
                            estimatedPoints={task.estimatedPoints}
                            onPointsSelect={(points) => {
                                updatePoints({ taskId: task.id, points })
                            }}
                        />
                    )}

                    {task.type === TaskType.HABIT && (
                        <ScheduleSelector
                            taskId={task.id}
                            selectedDays={task.weekDays}
                            startTime={task.plannedStartTime?.toISOString()}
                            endTime={task.plannedEndTime?.toISOString()}
                        />
                    )}

                    {task.type === TaskType.TASK && (
                        <DateTimeSelector
                            taskId={task.id}
                            startTime={task.plannedStartTime}
                            endTime={task.plannedEndTime}
                        />
                    )}

                    <TimeRangeSelector taskId={task.id} totalTime={totalTime} />

                    {task.status === TaskStatus.INPROGRESS && (
                        <Badge
                            variant="default"
                            className="ml-2 flex items-center gap-1 bg-blue-500 px-1.5 text-xs font-normal hover:bg-blue-500"
                        >
                            <Timer className="h-3 w-3 animate-pulse" />
                            <TimerComponent />
                        </Badge>
                    )}

                    {task.status === TaskStatus.COMPLETED && task.completionHistory[0] && (
                        <Badge
                            variant="outline"
                            className="ml-2 flex items-center gap-1 text-xs font-normal text-yellow-600"
                        >
                            <Trophy className="h-3 w-3" />
                            {task.completionHistory[0].experienceGained} XP
                        </Badge>
                    )}
                </div>
                <div className="ml-2 flex shrink-0 space-x-1 opacity-80 group-hover:opacity-100">
                    {task.status !== TaskStatus.INPROGRESS ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${
                                task.status === TaskStatus.COMPLETED
                                    ? 'cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400'
                                    : 'text-green-600 hover:bg-green-100 hover:text-green-700'
                            }`}
                            disabled={task.status === TaskStatus.COMPLETED || isStartTaskLoading}
                            onClick={() => startTask({ taskId: task.id })}
                        >
                            <Play className="h-4 w-4" />
                            <span className="sr-only">Start</span>
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                            onClick={() => stopTask({ taskId: task.id })}
                            disabled={isStopTaskLoading}
                        >
                            <Pause className="h-4 w-4" />
                            <span className="sr-only">Pause</span>
                        </Button>
                    )}

                    {task.status !== TaskStatus.COMPLETED ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                            onClick={() => completeTask({ taskId: task.id })}
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Complete</span>
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                            onClick={() => returnToNotStarted({ taskId: task.id })}
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Return to in-progress</span>
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && task.steps?.length > 0 && (
                <div className="mt-2 space-y-2">
                    {task.steps.map((step) => (
                        <div key={step.id}>{step.name}</div>
                    ))}
                </div>
            )}
        </div>
    )
}
