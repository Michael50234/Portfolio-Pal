'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();


  const login = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`, {
        method: "POST",
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
        credentials: "include"
      });

      if(!response.ok) {
        const errorObject: ApiError = await response.json();
        throw new Error(errorObject.message)
      }

      console.log("Logged in")
      router.replace("/home")
    } catch(error) {
      if(error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Login Failed");
      }
    }
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
          Login
        </Typography>
        <TextField 
          label="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          sx={{ width: "70%"}}
        />
        <TextField 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          sx={{ width: "70%"}} 
        />
        <Button fullWidth variant="contained" onClick={() => login()} sx={{ backgroundColor: "var(--accent)", width: "70%" }}>Continue</Button>
        <Typography sx={{
          color: "var(--text-muted)",
          textDecoration: "underline",
          textDecorationColor: "transparent",
          transition: "text-decoration-color 0.1s ease-in",
          "&:hover": {
            textDecorationColor: "rgba(0, 0, 0, 0.9)"
          }
        }}>
          <Link href="/signup">
            Don't have an account. Create one here.
          </Link>
        </Typography>
      </Box>
    </Box>
  )
};

export default page;
