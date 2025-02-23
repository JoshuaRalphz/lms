"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"

interface InterestSelectionProps {
  categories: { name: string; id: string }[];
  userInterests: { categoryId: string }[];
  disabled?: boolean;
}

export const InterestSelection = ({ categories, userInterests }: InterestSelectionProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    userInterests.filter(interest => interest.categoryId).map(interest => interest.categoryId)
  )

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // If already selected, remove it
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    } else {
      if (selectedCategories.length < 3) {
        // If less than 3 selected, add it
        setSelectedCategories(prev => [...prev, categoryId])
      } else {
        // If 3 already selected, replace the first one
        setSelectedCategories(prev => [categoryId, ...prev.slice(1)])
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold text-center mb-6">
        What are you interested in learning?
      </h1>
      <p className="text-lg text-center text-gray-600 mb-12">
        Select the categories that match your interests to get personalized course recommendations.
      </p>
      
      <div className="text-sm text-gray-600 mb-4 text-center">
        {selectedCategories.length}/3 categories selected
      </div>
      
      {selectedCategories.length >= 3 && (
        <div className="text-sm text-center mb-4">
          You&apos;ve selected 3 categories. Click another to replace one.
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="relative">
            <input
              type="checkbox"
              id={category.id}
              name="categories"
              value={category.id}
              checked={selectedCategories.includes(category.id)}
              className="hidden peer"
              onChange={() => handleCategoryClick(category.id)}
            />
            <label
              htmlFor={category.id}
              className={cn(
                "block p-6 bg-white border-2 rounded-lg cursor-pointer transition-all",
                selectedCategories.includes(category.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-500"
              )}
            >
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
} 