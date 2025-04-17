'use client'

import { useEffect, useState } from 'react'

export function TaskTimer({ initialTime }: { initialTime?: number }) {
    const [elapsedSeconds, setElapsedSeconds] = useState(initialTime ?? 0)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(intervalId)
    }, [])

    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor(elapsedSeconds / 60)
    const seconds = elapsedSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
