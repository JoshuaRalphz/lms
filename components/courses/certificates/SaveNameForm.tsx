"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

export const SaveNameForm = ({ 
  userId, 
  courseId,
  onSave 
}: { 
  userId: string;
  courseId: string;
  onSave: () => void;
}) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCertificate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/certificates", { 
        courseId,
        studentName: user?.fullName 
      }, {
        timeout: 10000 // 10 seconds
      });
      
      // Create a blob URL instead of data URL
      const byteCharacters = atob(response.data.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'application/pdf'});
      const url = URL.createObjectURL(blob);

      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${courseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onSave();
    } catch (error) {
      console.error("Failed to generate certificate", error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error:", error.message);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Get your certificate here!</h2>
      <div className="space-y-4">
        <Button 
          onClick={handleGenerateCertificate}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Download Certificate"}
        </Button>
      </div>
    </div>
  );
};