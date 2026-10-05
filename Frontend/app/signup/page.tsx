'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const page = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  const signup = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/signup`, {
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

      console.log("Created an account")
      router.replace("/home")
    } catch(error) {
      if(error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Signup Failed");
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
          Sign up and start tracking now
        </Typography>
        <TextField 
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
          }}
          label="Username" 
          sx={{ width: "70%"}}
        />
        <TextField
          value={password}
          type="password"
          onChange={(e) => {
            setPassword(e.target.value)
          }}
          label="Password" 
          sx={{ width: "70%"}} 
        />
        <Button fullWidth variant="contained" sx={{ backgroundColor: "var(--accent)", width: "70%" }} onClick={() => signup()}>Continue</Button>
        <Typography sx={{
          color: "var(--text-muted)",
          textDecoration: "underline",
          textDecorationColor: "transparent",
          transition: "text-decoration-color 0.1s ease-in",
          "&:hover": {
            textDecorationColor: "rgba(0, 0, 0, 0.9)"
          }
        }}>
          <Link href="/">
            Already have an account. Login here.
          </Link>
        </Typography>
      </Box>
    </Box>
  )
};

export default page;
