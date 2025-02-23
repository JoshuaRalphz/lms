"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FaCode } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ComboBox } from "@/components/custom/ComboBox";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and must be at least 2 characters long",
  }),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
});

interface CreateCourseFormProps {
  categories: {
    label: string; // name of category
    value: string; // categoryId
  }[];
}

const CreateCourseForm = ({ categories }: CreateCourseFormProps) => {
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      categoryId: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values);
      router.push(`/instructor/courses/${response.data.id}/basic`);
      toast.success("New Webinar Created");
    } catch (err) {
      console.log("Failed to create new course", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">
        Let give some basics for your webinar
      </h1>
      <p className="text-sm mt-3">
        It is ok if you cannot think of a good title or correct category now.
        You can change them later.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Web Development for Beginners"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category.value}
                        onClick={() => field.onChange(category.value)}
                        className={cn(
                          "p-4 border rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50/50",
                          field.value === category.value 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FaCode className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">{category.label}</h3>
                            
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCourseForm;
