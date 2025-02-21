"use client";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import toast from "react-hot-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  value: string;
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
  page: string;
}

const FileUpload = ({ value, onChange, endpoint, page }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-blue-100 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-blue-600">Uploading...</span>
        </div>
      )}

      {!isUploading && page === "Edit Course" && value !== "" && (
        <Image
          src={value}
          alt="image"
          width={500}
          height={500}
          className="w-[280px] h-[200px] object-cover rounded-xl"
        />
      )}

      {page === "Edit Section" && value !== "" && (
        <p className="text-sm font-medium">{value}</p>
      )}

      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          onChange(res?.[0].url);
          toast.success("Upload completed!");
        }}
        onUploadBegin={() => {
          setIsUploading(true);
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast.dismiss("upload-start");
          toast.error(`Upload failed: ${error.message}`);
        }}
        className="w-[280px] h-[200px]"
      />
    </div>
  );
};

export default FileUpload;
