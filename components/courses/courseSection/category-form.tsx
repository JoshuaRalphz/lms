"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Pencil, LayoutList, BarChart, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { ComboBox } from "@/components/custom/ComboBox";
import { Label } from "@/components/ui/label";

// Form Validation Schema
const formSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    levelId: z.string().min(1, "Level is required"),
});

interface CategoryFormProps {
    initialData: Course;
    courseId: string;
    categories: {
        label: string;
        value: string;
    }[];
    levels: { label: string; value: string }[];
}

export const CategoryForm = ({
    initialData,
    courseId,
    categories,
    levels,
}: CategoryFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryId: initialData?.categoryId || "",
            levelId: initialData?.levelId || "",
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success("Course updated");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="mt-6 border bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                <div>
                    <h3 className="text-lg font-semibold">Course Classification</h3>
                    <p className="text-sm text-muted-foreground">Manage category and difficulty level</p>
                </div>
                <Button 
  onClick={toggleEdit} 
  variant="ghost" 
  className="gap-2 text-black hover:bg-[#A9B5DF]"
>
  {isEditing ? (
    <>Cancel Changes</>
  ) : (
    <>
      <Pencil className="h-4 w-4" />
      <span>Edit Classification</span>
    </>
  )}
</Button>
            </div>

            {!isEditing && (
                <div className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
                            <LayoutList className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <p className="font-medium">
                                    {categories.find(c => c.value === initialData.categoryId)?.label || "Not set"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg">
                            <BarChart className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Level</p>
                                <p className="font-medium">
                                    {levels.find(l => l.value === initialData.levelId)?.label || "Not set"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        Category
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ComboBox
                                                        options={categories}
                                                        {...field}
                                                        className="w-full [&>button]:border [&>button]:shadow-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        Difficulty Level
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <FormField
                                        control={form.control}
                                        name="levelId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ComboBox
                                                        options={levels}
                                                        {...field}
                                                        className="w-full [&>button]:border [&>button]:shadow-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="gap-2 bg-[#7886C7] hover:bg-[#A9B5DF] text-[#FFF5EE]"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};
