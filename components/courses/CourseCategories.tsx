"use client"

import { Category } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface CourseCategoriesProps {
  categories: Category[]
}

export const CourseCategories = ({ categories }: CourseCategoriesProps) => {
  const router = useRouter()
  const searchParams = useSearchParams() || new URLSearchParams()
  const selectedCategory = searchParams.get('category')
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const handleCategoryClick = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const container = containerRef.current
    const handleScroll = () => {
      if (container) {
        setShowLeftArrow(container.scrollLeft > 0)
        setShowRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        )
      }
    }

    container?.addEventListener('scroll', handleScroll)
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative w-full px-4 my-10">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 md:-left-10 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          onClick={() => handleCategoryClick(null)}
          className="rounded-full shrink-0"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => handleCategoryClick(category.id)}
            className="rounded-full shrink-0"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 md:-right-10 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}