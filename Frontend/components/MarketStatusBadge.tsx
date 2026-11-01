'use client';

import React, { useMemo } from 'react'
import CircleIcon from '@mui/icons-material/Circle';
import { Box, Typography } from '@mui/material';

import useCurrentTime from '@/hooks/useCurrentTime';

const MarketStatusBadge = () => {
    const [currentTime] = useCurrentTime();

    const marketStatus = useMemo(() => {
        // Default to market open if time cannot be found since its safer
        if(!currentTime) {
            return false;
        }

        // In minutes
        const OPENTIME = 9 * 60 + 30;
        const CLOSETIME = 16 * 60;

        const hour24 = currentTime.dayPeriod === "PM" ? (currentTime.hour % 12) + 12 : currentTime.hour % 12;
        const time = hour24 * 60 + currentTime.minute;

        if(OPENTIME <= time && time < CLOSETIME) {
            return true;
        }
        
        return false;
    }, [currentTime])

    return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            ml: "5px",
        }}>
            <CircleIcon sx={{ fontSize: 10, color: marketStatus ? "var(--gains-bright)" : "var(--text-muted)"}}/>
            <Typography sx={{color: marketStatus ? "var(--gains)" : "var(--text-muted)", fontWeight: 500}}>{marketStatus ? "Market Open" : "Market Closed"}</Typography>
        </Box>
    )
}

export default MarketStatusBadge
