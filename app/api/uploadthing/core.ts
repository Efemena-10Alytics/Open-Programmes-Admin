import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      console.log("Middleware for imageUploader");
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed:", file.url);
      return { fileUrl: file.url };
    }),

  courseAttachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 3 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    text: { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { 
      maxFileSize: "16MB", 
      maxFileCount: 1 
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { 
      maxFileSize: "16MB", 
      maxFileCount: 1 
    },
    "application/vnd.ms-excel": { 
      maxFileSize: "16MB", 
      maxFileCount: 1 
    }
  })
    .middleware(async ({ req }) => {
      console.log("Middleware for courseAttachment");
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Course attachment upload completed:", file);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;