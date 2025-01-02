// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
