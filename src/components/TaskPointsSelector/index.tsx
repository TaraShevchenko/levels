'use client';

import * as React from 'react';



import { TaskPoints } from '@prisma/client';
import { Badge } from 'components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { BadgeSwissFranc } from 'lucide-react'



import { TASK_POINTS, TASK_POINTS_ARRAY } from './const';





type TaskPointsSelectorProps = {
    onPointsSelect: (points: TaskPoints) => void
    estimatedPoints?: TaskPoints | null
}

export function TaskPointsSelector({ onPointsSelect, estimatedPoints }: TaskPointsSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSelect = (points: TaskPoints) => {
        onPointsSelect(points)
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Badge variant="outline" className="ml-2 cursor-pointer px-1.5 font-normal">
                    <BadgeSwissFranc className="mr-1 h-3 w-3" />
                    {estimatedPoints ? `${TASK_POINTS[estimatedPoints]?.number}` : 'N/A'}
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1">
                <div className="grid max-h-48 gap-1 overflow-y-auto">
                    {TASK_POINTS_ARRAY.map((point) => (
                        <div
                            key={point.value}
                            className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-xs transition-colors hover:bg-muted"
                            onClick={() => handleSelect(point.value)}
                        >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
                                {point.number}
                            </div>
                            <span className="text-muted-foreground">{point.description}</span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}