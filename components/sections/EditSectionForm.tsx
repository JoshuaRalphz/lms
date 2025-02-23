"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MuxData, Resource, Section } from "@prisma/client";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import { useEffect } from "react";

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
import RichEditor from "@/components/custom/RichEditor";
import FileUpload from "../custom/FileUpload";
import { Switch } from "@/components/ui/switch";
import ResourceForm from "@/components/sections/ResourceForm";
import Delete from "@/components/custom/Delete";
import PublishButton from "@/components/custom/PublishButton";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and must be at least 2 characters long",
  }),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  isFree: z.boolean().optional(),
});

interface EditSectionFormProps {
  section: Section & { resources: Resource[]; muxData?: MuxData | null };
  courseId: string;
  isCompleted: boolean;
}

const EditSectionForm = ({ section, courseId, isCompleted }: EditSectionFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.title,
      description: section.description || "",
      videoUrl: section.videoUrl || "",
      isFree: section.isFree,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/sections/${section.id}`, values);
      toast.success("Webinar Chapter Updated");
      
      setTimeout(() => {
        toast.success("Refreshing the page…");
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.log("Failed to update the section", err);
      toast.error("Something went wrong!");
    }
  };

  const formValue = form;
  const onSubmitHandler = onSubmit;

  useEffect(() => {
    const currentVideoUrl = formValue.getValues("videoUrl");
    if (currentVideoUrl && currentVideoUrl !== section.videoUrl) {
      const formValues = formValue.getValues();
      onSubmitHandler(formValues);
    }
  }, [formValue, onSubmitHandler, section.videoUrl]);

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <Link href={`/instructor/courses/${courseId}/basic`}>
          <Button variant="ghost" className="text-sm font-medium flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Back to previous page
          </Button>
        </Link>
        <div className="flex gap-3">
          <PublishButton disabled={!isCompleted} courseId={courseId} sectionId={section.id} isPublished={section.isPublished} page="Section" />
          <Delete item="section" courseId={courseId} sectionId={section.id} />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 font-medium">Title <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introduction to Web Development" {...field} className="rounded-lg shadow-sm border-gray-300" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 font-medium">Description</FormLabel>
              <FormControl>
                <RichEditor placeholder="What is this course chapter about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {section.videoUrl && (
            <div className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-center">
              <MuxPlayer playbackId={section.muxData?.playbackId || ""} className="w-full md:max-w-[600px] rounded-lg" />
            </div>
          )}
          
          <FormField control={form.control} name="videoUrl" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 font-medium">Upload Video</FormLabel>
              <FormControl>
                <FileUpload 
                  value={field.value || ""} 
                  onChange={(url) => field.onChange(url)} 
                  endpoint="sectionVideo" 
                  page="Edit Section"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* <FormField control={form.control} name="isFree" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-md">
              <div>
                <FormLabel className="text-gray-800 font-medium">Accessibility</FormLabel>
                <FormDescription className="text-sm text-gray-500">Everyone can access this video chapter for free</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} /> */}

          <Button 
            type="submit" 
            disabled={!isValid || isSubmitting} 
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </form>
      </Form>

      <ResourceForm section={section} courseId={courseId} />
    </div>
  );
};

export default EditSectionForm;
