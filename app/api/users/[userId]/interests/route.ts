import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { interests } = await request.json();
    
    // If interests array is empty, delete all user interests
    if (interests.length === 0) {
      await db.userInterest.deleteMany({
        where: { userId: params.userId }
      });
    }

    const updatedUser = await clerkClient.users.updateUser(params.userId, {
      publicMetadata: {
        interests: interests
      }
    });
    
    return NextResponse.json(updatedUser.publicMetadata);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update interests" },
      { status: 500 }
    );
  }
} 