'use client'

import * as React from 'react'

import { WeekDay } from '@prisma/client'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from 'components/ui/badge'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover'
import { format, parse } from 'date-fns'
import { CalendarClock } from 'lucide-react'
import { api } from 'trpc/react'

const DAYS = [
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
    WeekDay.SUNDAY,
]

const DAYS_NAMES: Record<WeekDay, string> = {
    [WeekDay.MONDAY]: 'MON',
    [WeekDay.TUESDAY]: 'TUE',
    [WeekDay.WEDNESDAY]: 'WED',
    [WeekDay.THURSDAY]: 'THU',
    [WeekDay.FRIDAY]: 'FRI',
    [WeekDay.SATURDAY]: 'SAT',
    [WeekDay.SUNDAY]: 'SUN',
}

type ScheduleSelectorProps = {
    taskId: string
    startTime?: string | null
    endTime?: string | null
    selectedDays?: WeekDay[]
}

export function ScheduleSelector({ taskId, startTime, endTime, selectedDays = [] }: ScheduleSelectorProps) {
    const formatTimeString = (isoString?: string | null) => {
        if (!isoString) return ''
        try {
            const date = new Date(isoString)
            return format(date, 'HH:mm')
        } catch {
            return ''
        }
    }

    const [times, setTimes] = React.useState({
        from: formatTimeString(startTime),
        to: formatTimeString(endTime),
    })

    const [selectedDaysState, setSelectedDaysState] = React.useState<Set<WeekDay>>(new Set(selectedDays))

    const [isOpen, setIsOpen] = React.useState(false)

    const queryClient = useQueryClient()
    const updateSchedule = api.task.updateTaskSchedule.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [['task', 'getTasks']],
            })
        },
    })

    const handleDayToggle = (dayNumber: WeekDay) => {
        setSelectedDaysState((prev) => {
            const next = new Set(prev)
            if (next.has(dayNumber)) {
                next.delete(dayNumber)
            } else {
                next.add(dayNumber)
            }
            return next
        })
    }

    const handleSelectAll = () => {
        if (selectedDaysState.size === DAYS.length) {
            setSelectedDaysState(new Set())
        } else {
            setSelectedDaysState(new Set(DAYS))
        }
    }

    const handleSelect = () => {
        if (times.from && times.to) {
            const now = new Date()
            const fromDate = parse(times.from, 'HH:mm', now)
            const toDate = parse(times.to, 'HH:mm', now)
            const selectedDaysArray = Array.from(selectedDaysState)

            updateSchedule.mutate({
                taskId,
                plannedStartTime: fromDate,
                plannedEndTime: toDate,
                weekDays: selectedDaysArray,
            })

            setIsOpen(false)
        }
    }

    const displayTime = React.useMemo(() => {
        if (!startTime || !endTime) return 'N/A'
        try {
            const fromFormatted = formatTimeString(startTime)
            const toFormatted = formatTimeString(endTime)
            return `${fromFormatted} - ${toFormatted}`
        } catch {
            return 'N/A'
        }
    }, [startTime, endTime])

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Badge variant="outline" className="ml-2 cursor-pointer px-1.5 font-normal">
                    <CalendarClock className="mr-1 h-3 w-3" />
                    {displayTime}
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Repeat on</label>
                            <Button type="button" variant="outline" className="h-6 px-3" onClick={handleSelectAll}>
                                All
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day) => (
                                <Button
                                    key={day}
                                    type="button"
                                    variant={selectedDaysState.has(day) ? 'default' : 'outline'}
                                    className="h-8 flex-1 px-1"
                                    onClick={() => handleDayToggle(day)}
                                >
                                    {DAYS_NAMES[day]}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleSelect}
                        disabled={!times.from || !times.to || selectedDaysState.size === 0}
                        className="w-full"
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
