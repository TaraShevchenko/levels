'use client'

import * as React from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Badge } from 'components/ui/badge'
import { Button } from 'components/ui/button'
import { Calendar } from 'components/ui/calendar'
import { Input } from 'components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover'
import { format } from 'date-fns'
import { cn } from 'lib/utils'
import { CalendarClock } from 'lucide-react'
import { api } from 'trpc/react'

type DateTimeSelectorProps = {
    taskId: string
    startTime?: Date | null
    endTime?: Date | null
}

export function DateTimeSelector({ taskId, startTime, endTime }: DateTimeSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
        startTime ? new Date(startTime) : undefined,
    )

    const [startDateOpen, setStartDateOpen] = React.useState(false)
    const [endDateOpen, setEndDateOpen] = React.useState(false)

    const [dates, setDates] = React.useState({
        start: startTime ? format(new Date(startTime), 'dd.MM.yyyy') : '',
        end: endTime ? format(new Date(endTime), 'dd.MM.yyyy') : '',
    })

    const [times, setTimes] = React.useState({
        from: startTime ? format(new Date(startTime), 'HH:mm') : '',
        to: endTime ? format(new Date(endTime), 'HH:mm') : '',
    })

    const queryClient = useQueryClient()
    const updateDateTimeMutation = api.task.updateTaskDateTime.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [['task', 'getTasks']],
            })
        },
    })

    const updateDateTime = () => {
        if (dates.start && dates.end && times.from && times.to) {
            const [startDay, startMonth, startYear] = dates.start.split('.').map(Number)
            const [endDay, endMonth, endYear] = dates.end.split('.').map(Number)
            const [startHours, startMinutes] = times.from.split(':').map(Number)
            const [endHours, endMinutes] = times.to.split(':').map(Number)

            if (!startDay || !startMonth || !startYear || !endDay || !endMonth || !endYear) {
                return
            }

            const startDate = new Date(startYear, startMonth - 1, startDay)
            startDate.setHours(startHours ?? 0, startMinutes ?? 0)

            const endDate = new Date(endYear, endMonth - 1, endDay)
            endDate.setHours(endHours ?? 0, endMinutes ?? 0)

            updateDateTimeMutation.mutate({
                taskId,
                plannedStartTime: startDate,
                plannedEndTime: endDate,
            })

            setIsOpen(false)
        }
    }

    const displayDateTime = React.useMemo(() => {
        if (!startTime || !endTime) return 'N/A'
        try {
            const fromTime = format(new Date(startTime), 'HH:mm')
            const toTime = format(new Date(endTime), 'HH:mm')
            return `${fromTime} - ${toTime}`
        } catch {
            return 'N/A'
        }
    }, [startTime, endTime])

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Badge variant="outline" className="ml-2 cursor-pointer px-1.5 font-normal">
                    <CalendarClock className="mr-1 h-3 w-3" />
                    {displayDateTime}
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
                <div className="flex flex-col gap-4">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start date</label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={dates.start}
                                    onChange={(e) => setDates((prev) => ({ ...prev, start: e.target.value }))}
                                    placeholder="DD.MM.YYYY"
                                    className="w-full"
                                />
                                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'absolute right-0 top-0 h-full rounded-l-none',
                                                startDateOpen && 'bg-accent',
                                            )}
                                        >
                                            <CalendarClock className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="center">
                                        <Calendar
                                            mode="single"
                                            selected={new Date(dates.start)}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setDates((prev) => ({
                                                        ...prev,
                                                        start: format(date, 'dd.MM.yyyy'),
                                                    }))
                                                    setStartDateOpen(false)
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">End date</label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={dates.end}
                                    onChange={(e) => setDates((prev) => ({ ...prev, end: e.target.value }))}
                                    placeholder="DD.MM.YYYY"
                                    className="w-full"
                                />
                                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'absolute right-0 top-0 h-full rounded-l-none',
                                                endDateOpen && 'bg-accent',
                                            )}
                                        >
                                            <CalendarClock className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="center">
                                        <Calendar
                                            mode="single"
                                            selected={new Date(dates.end)}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setDates((prev) => ({
                                                        ...prev,
                                                        end: format(date, 'dd.MM.yyyy'),
                                                    }))
                                                    setEndDateOpen(false)
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

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
                        onClick={updateDateTime}
                        disabled={!dates.start || !dates.end || !times.from || !times.to}
                        className="w-full"
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
