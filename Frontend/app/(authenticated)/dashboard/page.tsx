'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useState } from 'react'
import { useQuery } from "@tanstack/react-query"

import LoadingSpinner from '@/components/LoadingSpinner';
import SearchBar from '@/components/NavBar';

const page = () => {
  const [searchText, setSearchText] = useState("apple");
  const [page, setPage] = useState("1");
  const [limit, setLimit] = useState("10")

  const { data: searchData, isPending: isSearchPending, refetch: refetchSearch } = useQuery({
    queryKey: ['test', searchText, page, limit],
    queryFn: () => searchStocks(searchText, page, limit),
    enabled: true,
  })

  return (
      <Stack 
        direction={'column'} 
        sx={{
          minHeight: "calc(100vh - 64px)",
        }}
      >
        { isSearchPending ? <LoadingSpinner /> : JSON.stringify(searchData) }
        <Button onClick={() => refetchSearch()}>Refetch</Button>
      </Stack>
  )
};

const searchStocks = async (searchText: string, page: string, limit: string) => {
  const apiURL = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stocks`);
  apiURL.searchParams.set("searchText", searchText);
  apiURL.searchParams.set("page", page);
  apiURL.searchParams.set("limit", limit);

  const response = await fetch(apiURL.toString(), {
    method: "GET",
    credentials: "include"
  });

  if(!response.ok) {
    console.error("Failed to search for stocks")
  }

  return await response.json();
}

export default page;
