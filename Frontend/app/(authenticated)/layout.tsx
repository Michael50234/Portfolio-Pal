
import NavBar from '@/components/NavBar'
import { AppBar, Toolbar } from '@mui/material'
import React from 'react'

const layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
        <Toolbar />
        <NavBar />
        {children}
    </div>
  )
}

export default layout
