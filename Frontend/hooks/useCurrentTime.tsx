
import React, { useEffect, useState } from 'react'

type timeObj = {
    hour: number,
    minute: number,
    dayPeriod: string
}

// returns current time string eg. "4:30 PM"
const getCurrentTime = (): timeObj | null => {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "numeric",
        hour12: false
    };

    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);

    const hour = Number(parts.find((part) => {
        return part.type === "hour";
    })?.value);

    const minute = Number(parts.find((part) => {
        return part.type === "minute"
    })?.value);

    const dayPeriod = parts.find((part) => {
        return part.type === "dayPeriod"
    })?.value;

    if(!(hour && minute && dayPeriod)) {
        return null;
    }

    return {
        dayPeriod,
        hour,
        minute
    };
}

const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState<timeObj | null>(getCurrentTime());
    
    useEffect(() => {
        const timer = setTimeout(() => {setCurrentTime(getCurrentTime())}, 1000 * 60);
        return clearTimeout(timer);
    }, [currentTime])

    return [currentTime];
}

export default useCurrentTime;
