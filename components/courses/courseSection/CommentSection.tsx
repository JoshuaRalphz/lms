"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { EditCommentModal } from "./EditCommentModal";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from 'next/image';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userName: string;
  userImage: string;
  userId: string;
}

interface CommentSectionProps {
  courseId: string;
  sectionId: string;
  userId: string;
  isFree: boolean;
}

export const CommentSection = ({ courseId, sectionId, userId, isFree }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { userId: currentUserId } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/sections/${sectionId}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [courseId, sectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/api/courses/${courseId}/sections/${sectionId}/comments`, {
        text: newComment,
        userId
      });
      
      setComments([response.data, ...comments]);
      setNewComment("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setShowPurchaseModal(true);
      } else {
        console.error("Error posting comment:", error);
      }
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Discussion ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="mb-2"
        />
        <Button type="submit" disabled={!newComment.trim()}>
          Post Comment
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-4 group relative">
            <div className="flex items-center gap-2 mb-2">
              <Image 
                src={comment.userImage} 
                alt={comment.userName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{comment.userName}</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
            {currentUserId === comment.userId ? (
              editingId === comment.id ? (
                <div className="flex gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={async () => {
                      try {
                        await axios.patch(
                          `/api/courses/${courseId}/sections/${sectionId}/comments/${comment.id}`,
                          { text: editText }
                        );
                        setComments(comments.map(c => 
                          c.id === comment.id ? {...c, text: editText} : c
                        ));
                        setEditingId(null);
                      } catch (error) {
                        console.error("Update failed:", error);
                      }
                    }}
                  >
                    Save
                  </Button>
                  <button 
                    onClick={async () => {
                      try {
                        await axios.delete(`/api/courses/${courseId}/sections/${sectionId}/comments/${comment.id}`);
                        setComments(comments.filter(c => c.id !== comment.id));
                      } catch (error) {
                        console.error("Delete failed:", error);
                      }
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="group relative">
                  <p className="text-gray-700">{comment.text}</p>
                  <button 
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.text);
                    }}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )
            ) : (
              <p className="text-gray-700">{comment.text}</p>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFree ? "Enroll in Course" : "Purchase Required"}
            </DialogTitle>
          </DialogHeader>
          <p>
            {isFree 
              ? "Please enroll in this free course to participate in discussions"
              : "You need to purchase this course to leave comments"}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase}>
              {isFree ? "Enroll Now" : "Purchase Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
