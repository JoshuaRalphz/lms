// npx prisma db push ----------- to deploy your changes to the database. - 2

//node scripts\seed.ts -------- to seed the database - 3

// npx prisma studio to open the prisma database
// npx prisma migrate reset ---------- reset database delete all - 1



const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();

async function main() {
  try {
    const categories = [
  { "name": "Cybersecurity" },
  { "name": "UI/UX Design" },
  { "name": "Productivity Software" },
  { "name": "3D Design & Animation" },
  { "name": "Web Development" },
  { "name": "Software Development" },
  { "name": "Cloud Computing & DevOps" },
  { "name": "Data Science & Analytics" },
    ];

    // Sequentially create each category
    for (const category of categories) {
      const createdCategory = await database.category.upsert({
        where: { name: category.name },
        update: {},
        create: {
          name: category.name,
        },
      });
      console.log(`Created category: ${createdCategory.name} with ID: ${createdCategory.id}`);
    }

    await database.level.createMany({
      data: [
        { name: "Beginner" },
        { name: "Intermediate" },
        { name: "Expert" },
      ],
    });

    console.log("Seeding successfully");
  } catch (error) {
    console.log("Seeding failed", error);
  } finally {
    await database.$disconnect();
  }
}

main();
