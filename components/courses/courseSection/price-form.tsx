"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { formatPrice } from "@/lib/formatPrice";
import { Switch } from "@/components/ui/switch";

interface PriceFormProps {
    initialData: Course;
    courseId: string;
}

const formSchema = z.object({
    price: z.coerce.number().min(0, "Price cannot be negative").optional(),
    isFree: z.boolean().optional(),
});

export const PriceForm = ({ initialData, courseId }: PriceFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: initialData.price || 0,
            isFree: initialData.isFree || false,
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const toggleEdit = () => setIsEditing((prev) => !prev);

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

    const formValue = form;

    const isFree = form.watch("isFree");

    useEffect(() => {
        if (isFree) {
            form.setValue("price", 0, { shouldValidate: true });
        }
    }, [isFree, form]);

    return (
        <div className="mt-6 border bg-white rounded-lg p-6">
            <div className="font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">Pricing</span>
                    <span className="text-sm text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full">
                        {initialData.isFree ? "FREE COURSE" : "PREMIUM COURSE"}
                    </span>
                </div>
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        "Cancel"
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Price
                        </>
                    )}
                </Button>
            </div>
            {!isEditing ? (
                <p className={cn("mt-4 text-lg font-semibold", !initialData.price && "text-emerald-700")}>
                    {initialData.price ? (
                        <span className="bg-emerald-100/50 px-4 py-2 rounded-lg">
                            {formatPrice(initialData.price)}
                        </span>
                    ) : (
                        <span className="text-red-700">
                            Free Course!
                        </span>
                    )}
                </p>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <div className="p-6 rounded-xl space-y-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#34495E] font-medium">Price (PHP)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder={form.watch("isFree") ? "Free course" : "Set course price"}
                                                    {...field}
                                                    disabled={form.watch("isFree")}
                                                    className={cn(
                                                        "pl-8 text-lg py-6",
                                                        form.watch("isFree") && "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    )}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600 font-medium" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isFree"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl p-4 border">
                                        <div>
                                            <FormLabel className="text-[#34495E] font-medium">Free Course</FormLabel>
                                            <FormDescription className="text-slate-500">
                                                Enable to offer this course for free
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center gap-x-2">
                            <Button 
                                disabled={!isValid || isSubmitting} 
                                type="submit"
                                                                className="gap-2 bg-[#7886C7] hover:bg-[#A9B5DF] text-[#FFF5EE]"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};
