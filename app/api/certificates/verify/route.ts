import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { verificationCode } = await req.json();

    if (!verificationCode) {
      return new NextResponse("Verification code is required", { status: 400 });
    }

    const certificate = await db.certificate.findUnique({
      where: { verificationCode },
      include: {
        course: true,
        student: true
      }
    });

    console.log("Verification Code Input:", verificationCode);
    console.log("Certificate Found:", certificate);

    if (!certificate) {
      return NextResponse.json({ 
        valid: false,
        error: `Certificate with code ${verificationCode} not found`
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
      courseName: certificate.course.title,
      issuedAt: certificate.issuedAt,
      subtitle: certificate.course.subtitle
    });
  } catch (error) {
    console.log("[CERTIFICATE_VERIFICATION_ERROR]", error);
    return NextResponse.json({ 
      valid: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}; 