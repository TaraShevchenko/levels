'use client'

import * as React from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Badge } from 'components/ui/badge'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover'
import { AlarmClockCheck } from 'lucide-react'
import { api } from 'trpc/react'
import { formatTime } from 'utils/formatTime'

type TimeRangeSelectorProps = {
    taskId: string
    totalTime: number
}

export function TimeRangeSelector({ taskId, totalTime }: TimeRangeSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [times, setTimes] = React.useState({
        from: '',
        to: '',
    })

    const queryClient = useQueryClient()
    const addTimeEntryMutation = api.task.addTimeEntry.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [['task', 'getTasks']],
            })
            setTimes({ from: '', to: '' })
            setIsOpen(false)
        },
    })

    const addTimeEntry = () => {
        if (times.from && times.to) {
            const now = new Date()
            const [startHours, startMinutes] = times.from.split(':').map(Number)
            const [endHours, endMinutes] = times.to.split(':').map(Number)

            // Проверяем что значения определены и находятся в допустимом диапазоне
            if (
                startHours === undefined ||
                startMinutes === undefined ||
                endHours === undefined ||
                endMinutes === undefined ||
                startHours < 0 ||
                startHours > 23 ||
                startMinutes < 0 ||
                startMinutes > 59 ||
                endHours < 0 ||
                endHours > 23 ||
                endMinutes < 0 ||
                endMinutes > 59
            ) {
                return
            }

            const startDate = new Date(now)
            startDate.setHours(startHours, startMinutes, 0, 0)

            const endDate = new Date(now)
            endDate.setHours(endHours, endMinutes, 0, 0)

            // Проверяем, что время начала меньше времени окончания
            if (startDate >= endDate) {
                return
            }

            const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)

            addTimeEntryMutation.mutate({
                taskId,
                startTime: startDate,
                endTime: endDate,
                duration,
            })
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Badge
                    variant="outline"
                    className="ml-2 flex cursor-pointer items-center gap-1 px-1.5 text-xs font-normal"
                >
                    <AlarmClockCheck className="h-3 w-3" /> {formatTime(totalTime)}
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start time</label>
                            <Input
                                type="time"
                                value={times.from}
                                onChange={(e) => setTimes((prev) => ({ ...prev, from: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End time</label>
                            <Input
                                type="time"
                                value={times.to}
                                onChange={(e) => setTimes((prev) => ({ ...prev, to: e.target.value }))}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={addTimeEntry}
                        disabled={!times.from || !times.to || addTimeEntryMutation.isPending}
                        className="w-full"
                    >
                        Add Time Entry
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
