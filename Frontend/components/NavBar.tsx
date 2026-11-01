'use client'

import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material'
import React, { useState } from 'react'

import SearchBar from './SearchBar';
import MarketStatusBadge from './MarketStatusBadge';
import { useRouter } from 'next/navigation';

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();

  return (
    <AppBar
      sx={{
        backgroundColor: "var(--surface)"
      }}
    >
        <Toolbar>
          <Typography
              sx={{
                  fontWeight: 600,
                  mr: "30px"
              }}
          >
              Portfolio Pal
          </Typography>
          <Button onClick={() => router.push("/dashboard")}>Dashboard</Button>
          <Button onClick={() => router.push("/portfolio")}>Portfolio</Button>
          <Button onClick={() => router.push("/watchlist")}>Watchlist</Button>
          <SearchBar />
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}>
            <MarketStatusBadge />
            <IconButton
              onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                }
              }
              sx={{
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
              }}
            >
                <Avatar />
            </IconButton>
            <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => setAnchorEl(null)}>Delete Account</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>Update Password</MenuItem>
            </Menu>
            <Button variant={'outlined'}>Logout</Button>
          </Box>
        </Toolbar>
    </AppBar>
  )
}

export default NavBar;
