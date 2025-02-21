import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateCertificatePDF } from "@/lib/certificate-generator";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    const { courseId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user info from Clerk
    const clerkClientInstance = await clerkClient();
    const clerkUser = await clerkClientInstance.users.getUser(userId);
    const studentName = `${clerkUser.firstName} ${clerkUser.lastName}`;

    if (!studentName) {
      return new NextResponse("User name not found", { status: 400 });
    }

    // Check if user is instructor
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const isInstructor = course?.instructorId === userId;

    // Generate certificate regardless of completion status
    const base64 = await generateCertificatePDF({
      studentName: studentName,
      courseName: course.title,
      date: new Date().toLocaleDateString(),
    });

    // Update or create the certificate
    await db.certificate.upsert({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        }
      },
      update: {
        pdfData: base64
      },
      create: {
        studentId: userId,
        courseId,
        pdfData: base64
      }
    });

    return NextResponse.json({ pdfData: base64 });
  } catch (error) {
    console.log("[CERTIFICATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};