"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import toast from "react-hot-toast";

interface FileUploadProps {
    onchange: (url?: string) => void;
    endpoint: keyof typeof ourFileRouter;
}
    
export const FileUpload = ({
    onchange,
    endpoint
}:FileUploadProps) => {
    return(
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res)=>{
                onchange(res?.[0].url);
            }}
            onUploadError={(error: Error)=>{
                toast.error (`${error.message}`)
                console.log(error.message);
            }}
            />
    )
}
