import { format, intervalToDuration } from 'date-fns'

export const formatTime = (seconds: number, withSeconds?: boolean) => {
    if (seconds === undefined) return withSeconds ? '00:00:00' : '00:00'

    const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

    if (withSeconds) {
        return format(new Date(0, 0, 0, duration.hours ?? 0, duration.minutes ?? 0, duration.seconds ?? 0), 'HH:mm:ss')
    }

    return format(new Date(0, 0, 0, duration.hours ?? 0, duration.minutes ?? 0), 'HH:mm')
}
