import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import { Trash } from "lucide-react";
  import { useRouter } from "next/navigation";
  import { useState } from "react";
  import toast from "react-hot-toast";
  
  interface DeleteQuizProps {
    quizId: string;
  }
  
  export const DeleteQuiz = ({ quizId }: DeleteQuizProps) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
  
    const onDelete = async () => {
      try {
        setIsDeleting(true);
        const response = await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete quiz');
        }
  
        toast.success('Quiz deleted successfully');
        router.refresh();
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsDeleting(false);
      }
    };
  
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            {isDeleting ? (
              <span className="flex items-center gap-2">
                Deleting...
              </span>
            ) : (
              <Trash className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  };