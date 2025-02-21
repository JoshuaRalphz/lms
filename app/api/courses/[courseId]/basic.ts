import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { courseId } = req.query;

    const course = await db.course.findUnique({
      where: {
        id: courseId as string,
        instructorId: userId,
      },
      include: {
        sections: true,
      },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });

    const levels = await db.level.findMany();

    res.status(200).json({ course, categories, levels });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
