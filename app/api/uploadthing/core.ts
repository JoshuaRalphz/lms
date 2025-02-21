import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  courseBanner: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
  .middleware(handleAuth)
  .onUploadComplete(() => {}),
  sectionVideo: f({ video: { maxFileSize: "512GB", maxFileCount: 1 } })
  .middleware(handleAuth)
  .onUploadComplete(() => {}),
  sectionResource: f({
    text: { maxFileSize: "16MB" },
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "512MB" },
    audio: { maxFileSize: "32MB" },
    pdf: { maxFileSize: "16MB" },
    blob: { maxFileSize: "16MB" }
  }).middleware(handleAuth)
  .onUploadComplete(() => {}),
  certificateImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
