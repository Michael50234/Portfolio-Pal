'use client';

import { Autocomplete, Avatar, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import React, { useEffect, useState } from 'react'
import { useShallow } from "zustand/react/shallow";

import { useSearchTextStore } from '@/stores/searchStore';
import { useQuery } from '@tanstack/react-query';

type StockAsset = {
    ticker: string,
    name: string
};

const getStockAssets = async (searchText: string): Promise<StockAsset[]> => {
    const apiURL = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stocks`);
    apiURL.searchParams.set("searchText", searchText);
    apiURL.searchParams.set("page", "1");
    apiURL.searchParams.set("limit", "10");
    const response = await fetch(apiURL.toString(), {
        method: "GET",
        credentials: "include"
    });

    if(!response.ok) {
        throw new Error("Failed to fetch stock assets");
    }

    const body: { stocks: StockAsset[] } = await response.json();
    return body.stocks;
}

const SearchBar = () => {
    const { searchText, setText } = useSearchTextStore(useShallow((state) => ({
        searchText: state.searchText,
        setText: state.setText
    })));

    const [debounced, setDebounced] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(searchText), 300);
        return () => clearTimeout(timer);
    }, [searchText])


    // Set stale and gcTime to same as backend redis cache
    const { data } = useQuery({
        queryKey: ["stockAssets", debounced],
        queryFn: () => getStockAssets(debounced),
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24
    });


    const stocks = data ?? [];

    return (
        <React.Fragment>
            <Autocomplete 
                inputValue={searchText}
                onInputChange={(_, newValue, reason) => {
                    if (reason === "reset") return;
                    setText(newValue);
                }}
                clearOnBlur={false}
                sx={{ ml: "auto", mr: "auto", minWidth: "300px" }}
                size="small"
                forcePopupIcon={false}
                options={stocks}
                getOptionLabel={(option) => `${option.name} - ${option.ticker}`}
                getOptionKey={(option) => option.ticker}
                slotProps={{
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
                        slotProps={{
                            ...params.slotProps,
                            input: {
                                ...params.slotProps.input,
                                endAdornment: searchText ? (
                                    <IconButton
                                        size="small"
                                        edge="end"
                                        aria-label="Clear search"
                                        onClick={() => setText("")}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                ) : null,
                            },
                        }}
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
