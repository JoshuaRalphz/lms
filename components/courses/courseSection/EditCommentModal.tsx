"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface EditCommentModalProps {
  comment: {
    id: string;
    text: string;
  };
  courseId: string;
  sectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedText: string) => void;
}

export const EditCommentModal = ({ comment, courseId, sectionId, isOpen, onClose, onSave }: EditCommentModalProps) => {
  const [editedText, setEditedText] = useState(comment.text);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await axios.patch(
        `/api/courses/${courseId}/sections/${sectionId}/comments/${comment.id}`,
        { text: editedText }
      );
      onSave(editedText);
      onClose();
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>
        <Input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          disabled={isLoading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !editedText.trim()}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};