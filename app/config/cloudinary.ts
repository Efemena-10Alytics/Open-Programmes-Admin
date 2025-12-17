
// Safely access environment variables with fallbacks and validation
const getCloudName = (): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('VITE_CLOUDINARY_CLOUD_NAME environment variable is not set');
    return "";
  }
  
  return cloudName;
};

const getUploadPreset = (): string => {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!uploadPreset) {
    console.warn('VITE_CLOUDINARY_UPLOAD_PRESET environment variable is not set');
    return "";
  }
  
  return uploadPreset;
};

export const cloudinaryConfig = {
  cloudName: getCloudName(),
  uploadPreset: getUploadPreset(),
};