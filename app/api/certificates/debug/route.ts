import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const certificates = await db.certificate.findMany({
      include: {
        student: true,
        course: true
      }
    });

    console.log("All Certificates:");
    certificates.forEach(cert => {
      console.log("-----------------------------");
      console.log(`Certificate ID: ${cert.certificateId}`);
      console.log(`Verification Code: ${cert.verificationCode}`);
      console.log(`Student: ${cert.student.firstName} ${cert.student.lastName}`);
      console.log(`Course: ${cert.course.title}`);
      console.log(`Issued At: ${cert.issuedAt}`);
      console.log("-----------------------------");
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.log("[CERTIFICATE_DEBUG_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 