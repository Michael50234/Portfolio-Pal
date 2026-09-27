'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react'

const page = () => {

  const login = () => {

  };

  return (
    <Box sx={{
      minHeight: "100vh",
      p: "60px",
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3
    }}>
      <Typography
        sx={{
          position: "fixed",
          top: "20px", 
          left: "40px",
          fontWeight: 600
        }}
      >
        Portfolio Pal
      </Typography>
      <Typography
        sx={{
          fontSize: "3rem",
          fontWeight: 700
        }}
      >
        Track All Your Stocks In <span style={{color: "var(--accent)"}}>One Place</span>
      </Typography>
      <Box sx={{
        backgroundColor: "var(--surface)",
        width: "30%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "20px",
        p: "20px",
        gap: "20px"
      }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: "1.3rem",
          }}
        >
          Sign up and start tracking now
        </Typography>
        <TextField label="Username" sx={{ width: "70%"}}/>
        <TextField label="Password" sx={{ width: "70%"}} />
        <Button fullWidth variant="contained" sx={{ backgroundColor: "var(--accent)", width: "70%" }}>Continue</Button>
        <Typography sx={{
          color: "var(--text-muted)",
          textDecoration: "underline",
          textDecorationColor: "transparent",
          transition: "text-decoration-color 0.1s ease-in",
          "&:hover": {
            textDecorationColor: "rgba(0, 0, 0, 0.9)"
          }
        }}>
          <Link href="/sign-up">
            Don't have an account. Create one here.
          </Link>
        </Typography>
      </Box>
    </Box>
  )
};

export default page;
