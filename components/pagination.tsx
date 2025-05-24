"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []

    // Always show first page
    pages.push(1)

    // Current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 2 && currentPage > 3) {
        pages.push("ellipsis-start")
      } else if (i === totalPages - 1 && currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      } else {
        pages.push(i)
      }
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    // Remove duplicates and ellipsis if not needed
    return Array.from(new Set(pages))
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-brand-200"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pageNumbers.map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </Button>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 ${
              currentPage === page ? "bg-brand-500 hover:bg-brand-600" : "border-brand-200 hover:bg-brand-50"
            }`}
            onClick={() => onPageChange(page as number)}
          >
            {page}
            <span className="sr-only">Page {page}</span>
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-brand-200"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}
