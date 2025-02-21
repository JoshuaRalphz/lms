import CreateCourseForm from "@/components/courses/CreateCourseForm"
import { db } from "@/lib/db"
import { isTeacher } from '@/lib/instructor'
import { auth } from "@clerk/nextjs/server"
import { redirect } from 'next/navigation'

const CreateCoursePage = async () => {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/sign-in")
  }

  if (!isTeacher(userId)) {
    return redirect("/")
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    },

  })

  const formatCategories = (categories: any[]) => {
    return categories.map((cat) => ({
      label: cat.name,
      value: cat.id,

    }));
  };

  return (
    <div>
      <CreateCourseForm categories={formatCategories(categories)} />
      <div className="z-50 max-h-60 overflow-y-auto rounded-md border bg-white py-1 text-base shadow-lg">
        {/* Dropdown content */}
      </div>
    </div>
  )
}

export default CreateCoursePage