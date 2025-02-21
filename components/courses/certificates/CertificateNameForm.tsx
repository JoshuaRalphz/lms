"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

export const CertificateNameForm = ({ courseId }: { courseId: string }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCertificate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/certificates`, { 
        courseId,
        studentName: name 
      });

      if (typeof response.data !== 'object') {
        console.error('Unexpected response:', response.data);
        throw new Error('Invalid response from server');
      }

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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response error:', error.response.data);
        } else {
          console.error('Request error:', error.message);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Course Completed!</h2>
      <div className="space-y-4">
        <Button 
          onClick={handleGenerateCertificate}
        >
          {isLoading ? "Generating..." : "Download Certificate"}
        </Button>
      </div>
    </div>
  );
};