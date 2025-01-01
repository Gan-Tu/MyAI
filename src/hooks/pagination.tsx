'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export const usePagination = (totalResults: number, resultsPerPage: number) => {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const totalPages = Math.ceil(totalResults / resultsPerPage)

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }

  const filterResults = (data: any[] | undefined | null) => {
    return data?.slice((page - 1) * resultsPerPage, page * resultsPerPage)
  }

  return {
    page,
    totalPages,
    resultsPerPage,
    totalResults,
    filterResults,
    handleNext,
    handlePrevious,
  }
}
