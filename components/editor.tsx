"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill's default theme styles

// Define props for the editor
interface EditorProps {
    onChange: (value: string) => void; // Handler for content changes
    value: string; // The current content
}

export const Editor = ({ onChange, value }: EditorProps) => {
    // Dynamically load ReactQuill to ensure compatibility with Next.js
    const ReactQuill = useMemo(
        () => dynamic(() => import("react-quill"), { ssr: false }),
        []
    );

    // Quill configuration
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }], // Header levels
            ["bold", "italic", "underline", "strike"], // Basic formatting
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            ["blockquote", "code-block"], // Block quotes and code blocks
            ["link", "image"], // Links and images
            ["clean"], // Clear formatting
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "blockquote",
        "code-block",
        "link",
        "image",
    ];

    return (
        <div className="bg-white">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Edit your content here..."
            />
        </div>
    );
};
