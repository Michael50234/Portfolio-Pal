'use client'

import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import React, { useState } from 'react'
import SearchBar from './SearchBar';

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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
                  mr: "20px"
              }}
          >
              Portfolio Pal
          </Typography>
          <SearchBar />
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
        </Toolbar>
    </AppBar>
  )
}

export default NavBar;
