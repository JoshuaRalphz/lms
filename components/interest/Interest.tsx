"use client"

import { Button } from "@/components/ui/button"
import { InterestSelection } from "./InterestSelection"
import { Category } from "@prisma/client"

interface InterestPageProps {
  categories: Category[]
  userInterests: { categoryId: string }[]
  isUpdateMode?: boolean
}

export const InterestPage = ({ categories, userInterests, isUpdateMode = false }: InterestPageProps) => {
  const handleSubmit = async (formData: FormData) => {
    const selectedCategories = formData.getAll("categories")
    
    await fetch('/api/interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryIds: selectedCategories }),
    })
    
    // Always redirect to learning page after update
    window.location.href = '/learning'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <form action={handleSubmit}>
        <InterestSelection categories={categories} userInterests={userInterests} />
        <div className="text-center pb-20">
          <Button type="submit" size="lg">
            {isUpdateMode ? 'Update Interests' : 'Save Interests'}
          </Button>
        </div>
      </form>
    </div>
  )
} 