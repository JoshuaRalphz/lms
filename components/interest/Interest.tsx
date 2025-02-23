"use client"

import { Button } from "@/components/ui/button"
import { InterestSelection } from "./InterestSelection"
import { Category } from "@prisma/client"
import { useState } from "react"

interface InterestPageProps {
  categories: Category[]
  userInterests: { categoryId: string }[]
  isUpdateMode?: boolean
}

export const InterestPage = ({ categories, userInterests, isUpdateMode = false }: InterestPageProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    const selectedCategories = formData.getAll("categories")
    
    try {
      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryIds: selectedCategories }),
      })

      if (!response.ok) {
        throw new Error('Failed to update interests')
      }

      // Redirect without waiting for the response to complete
      window.location.href = '/learning'
    } catch (error) {
      console.error('Error updating interests:', error)
      // Handle error (e.g., show toast notification)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <form action={handleSubmit}>
        <InterestSelection categories={categories} userInterests={userInterests} />
        <div className="text-center pb-20">
          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Interests'}
          </Button>
        </div>
      </form>
    </div>
  )
} 