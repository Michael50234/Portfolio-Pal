'use client';

import { Box, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import React from 'react'

const page = () => {
    const params: {ticker: string} = useParams();

    return (
        <Box>
            <Typography>{params.ticker}</Typography>
        </Box>
    )
}

export default page
