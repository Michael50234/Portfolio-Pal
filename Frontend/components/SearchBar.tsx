'use client';

import { Autocomplete, Avatar, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import React, { useState } from 'react'

export const stocks = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. Class A' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'META', name: 'Meta Platforms, Inc.' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'MA', name: 'Mastercard Incorporated' },
  { ticker: 'JNJ', name: 'Johnson & Johnson' },
  { ticker: 'WMT', name: 'Walmart Inc.' },
  { ticker: 'PG', name: 'The Procter & Gamble Company' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation' },
  { ticker: 'HD', name: 'The Home Depot, Inc.' },
  { ticker: 'KO', name: 'The Coca-Cola Company' },
  { ticker: 'PEP', name: 'PepsiCo, Inc.' },
  { ticker: 'DIS', name: 'The Walt Disney Company' },
  { ticker: 'NFLX', name: 'Netflix, Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.' },
  { ticker: 'INTC', name: 'Intel Corporation' },
  { ticker: 'ORCL', name: 'Oracle Corporation' },
  { ticker: 'CRM', name: 'Salesforce, Inc.' },
  { ticker: 'NKE', name: 'NIKE, Inc.' },
  { ticker: 'MCD', name: "McDonald's Corporation" },
  { ticker: 'BA', name: 'The Boeing Company' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF' },
]

const SearchBar = () => {

    return (
        <React.Fragment>
            <Autocomplete 
                sx={{ ml: "auto", mr: "auto", minWidth: "300px" }}
                size="small"
                forcePopupIcon={false}
                options={stocks}
                getOptionLabel={(option) => `${option.name} - ${option.ticker}`}
                getOptionKey={(option) => option.ticker}
                slotProps={{
                    clearIndicator: {
                        sx: { visibility: "visible" },
                    },
                    paper: {
                        sx: {
                            mt: "6px",
                            borderRadius: "16px",
                            backgroundColor: "rgba(255, 255, 255, 0.55)",
                            backdropFilter: "blur(16px) saturate(160%)",
                            WebkitBackdropFilter: "blur(16px) saturate(160%)",
                            border: "1px solid rgba(255, 255, 255, 0.6)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.10)",
                            color: "var(--text)",
                            "& .MuiAutocomplete-listbox": { p: "6px" },
                            "& .MuiAutocomplete-option": {
                                borderRadius: "10px",
                                fontSize: "0.9rem",
                            },
                            "& .MuiAutocomplete-option.Mui-focused": {
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                            },
                            "& .MuiAutocomplete-option[aria-selected='true']": {
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                            },
                            "& .MuiAutocomplete-noOptions": { color: "var(--text-muted)" },
                        },
                    },
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search stocks"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "999px",
                                backgroundColor: "rgba(255, 255, 255, 0.35)",
                                backdropFilter: "blur(12px) saturate(160%)",
                                WebkitBackdropFilter: "blur(12px) saturate(160%)",
                                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                                "& fieldset": {
                                    border: "1px solid rgba(255, 255, 255, 0.6)",
                                },
                                "&:hover fieldset": {
                                    borderColor: "var(--border-strong)",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "var(--accent)",
                                    borderWidth: "1px",
                                },
                            },
                        }}
                    />
                )}
            />
        </React.Fragment>
    )
}

export default SearchBar
