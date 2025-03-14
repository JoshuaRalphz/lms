"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { title } from "process";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from  "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@prisma/client"
import { Preview } from "@/components/preview";
import { Editor } from "@/components/editor";
import RichEditor from "@/components/custom/RichEditor";


interface DescriptionFormProps {
    initialData:Course;
    courseId: string;
};

const formSchema = z.object ({
    description: z.string().min(1, {
        message: "Description is required",
    })
})

export const DescriptionForm = ({
    initialData,
    courseId,
}: DescriptionFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: initialData?.description || ""
        },
    });
        const {isSubmitting, isValid} = form.formState
        const onSubmit = async (values:z.infer<typeof formSchema>) => {
          try{
            await axios.patch(`/api/courses/${courseId}`,values);
            toast.success("Course updated");
            toggleEdit();
            router.refresh();
          } catch {
            toast.error ("Something went wrong");
          }
        }
    
        return(
            <div className="mt-6 border bg-slate-100 rounded-md p-4">
                <div className="font-medium flex items-center justify-between">
                    Webinar description
                    <Button onClick={toggleEdit} variant = "ghost">
                        {isEditing ? (
                            <>Cancel</>
                        ) : (
                            <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit description
                            </>
                        )}
                    </Button>
                </div>
                {!isEditing && (
                    <div className={cn(
                        "text-sm mt-2",
                        !initialData.description && "text-slate-500 italic"
                    )}>
                        {!initialData.description && "No description"}
                        {initialData.description && (<Preview
                            value={initialData.description}/>)}
                    </div>
                )}
                {isEditing && (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 mt-4"
                        >
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                <FormLabel>
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RichEditor
                    placeholder="What is this course about?"
                    className="bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
                                )}
                            />
                            <div className="flex items-center gap-x-2">
                                <Button
                                    disabled={!isValid || isSubmitting}
                                    type="submit"
                                    >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        )
}