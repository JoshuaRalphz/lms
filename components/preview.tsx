"use client";
import React from "react";

interface PreviewProps {
  value: string;
}

export const Preview = ({ value }: PreviewProps) => {
  return (
    <div
      className="fr-view bg-white"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};
