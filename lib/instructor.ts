export const isTeacher = (userId?: string | null) => {
    // Define an array of teacher user IDs
    const TeacherUserIds = [
      process.env.NEXT_PUBLIC_TEACHER_ID1,
      process.env.NEXT_PUBLIC_TEACHER_ID2,
      process.env.NEXT_PUBLIC_TEACHER_ID3,
      process.env.NEXT_PUBLIC_TEACHER_ID4,
      // Add more TEACHER IDs as needed
    ];
  
    // Check if the provided userId is in the TEACHERUserIds array
    return TeacherUserIds.includes(userId as string);
  };
  