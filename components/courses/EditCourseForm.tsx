"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Course } from "@prisma/client";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import RichEditor from "@/components/custom/RichEditor";
// import { ComboBox } from "../custom/ComboBox";
// import FileUpload from "../custom/FileUpload";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
// import { Loader2, Trash } from "lucide-react";
import Delete from "../custom/Delete";
import PublishButton from "../custom/PublishButton";
// import { Switch } from "@/components/ui/switch";
// import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and must be at least 2 characters long",
  }),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
  imageUrl: z.string().optional(),
  price: z.coerce.number().optional().refine((value) => value !== undefined, {
    message: "Price is optional for publishing",
  }),
  isFree: z.boolean().optional(),
});

interface EditCourseFormProps {
  course: Course;
  categories: {
    label: string; // name of category
    value: string; // categoryId
  }[];
  isCompleted: boolean;
}

const EditCourseForm = ({
  course,

  isCompleted,
}: EditCourseFormProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      subtitle: course.subtitle || "",
      description: course.description || "",
      categoryId: course.categoryId,
      imageUrl: course.imageUrl || "",
      price: course.price || 0,
      isFree: course.isFree || false,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${course.id}/basic`, values);
      toast.success("Course Updated");
      router.refresh();
    } catch (err) {
      console.log("Failed to update the course", err);
      toast.error("Something went wrong!");
    }
  };



  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Link href={`/instructor/courses`} className="flex items-center hover:opacity-75 transition">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to previous page
        </Link>
        
        <div className="flex gap-5 items-start">
          <PublishButton
            disabled={!isCompleted}
            courseId={course.id}
            isPublished={course.isPublished}
            page="Course"
          />
          <Delete item="course" courseId={course.id} />
        </div>
      </div>



    </>
  );
};

export default EditCourseForm;