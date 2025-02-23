"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    studentName?: string;
    courseName?: string;
    issuedAt?: Date;
    subtitle?: string;
  } | null>(null);

  const handleVerify = async () => {
    try {
      console.log("Initiating verification for code:", code);
      console.log("Verification Code Sent:", code);
      const response = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationCode: code }),
      });

      const data = await response.json();
      setResult(data);
      
      // Log the verification result
      if (data.valid) {
        console.log("Verified Certificate Details:", {
          studentName: data.studentName,
          courseName: data.courseName,
          issuedAt: data.issuedAt,
          subtitle: data.subtitle
        });
      } else {
        console.log("Invalid Certificate");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setResult({ valid: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center">Verify Certificate</h1>
        
        <div className="space-y-4">
          <Input
            placeholder="Enter Certificate ID here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
          />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleVerify}
              className="w-full sm:w-auto"
            >
              Verify
            </Button>
            
            <Link href="/learning" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full"
              >
                Back
              </Button>
            </Link>
          </div>

          {result && (
            <div className="mt-4 p-4 border rounded-lg text-center">
              {result.valid ? (
                <>
                  <h2 className="text-xl font-bold text-green-600 mb-2">Valid Certificate</h2>
                  <p className="mb-1">Student: {result.studentName}</p>
                  <p className="mb-1">Course: {result.courseName}</p>
                  <p className="mb-1">Speaker: {result.subtitle}</p>
                  <p>Issued: {new Date(result.issuedAt!).toLocaleDateString()}</p>
                </>
              ) : (
                <h2 className="text-xl font-bold text-red-600">Invalid Certificate</h2>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 