import { useState } from "react";
import axios from "axios";

// Define the Cloudinary upload response type
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

interface UseCloudinaryUploadOptions {
  timeout?: number;
  maxRetries?: number;
  maxFileSizeMB?: number;
  compressBeforeUpload?: boolean;
  onProgress?: (progress: number) => void;
}

interface UseCloudinaryUploadReturn {
  uploadImage: (file: File) => Promise<string>;
  isUploading: boolean;
  error: string | null;
  progress: number;
  cancelUpload: () => void;
}

/**
 * Custom hook for uploading images to Cloudinary with enhanced reliability
 * @param uploadPreset Your Cloudinary upload preset name
 * @param cloudName Your Cloudinary cloud name
 * @param options Configuration options
 * @returns Object containing upload function, loading state, and error state
 */
export const useCloudinaryUpload = (
  uploadPreset: string,
  cloudName: string,
  options: UseCloudinaryUploadOptions = {}
): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [cancelTokenSource, setCancelTokenSource] = useState<any>(null);

  const {
    timeout = 60000, 
    maxRetries = 2,
    maxFileSizeMB = 15,
    compressBeforeUpload = true,
    onProgress
  } = options;

  /**
   * Compresses an image file before upload if needed
   * @param file The file to compress
   * @returns A compressed file or blob, or the original file if compression is not needed
   */
  const compressImageIfNeeded = async (file: File): Promise<File | Blob> => {
    // If compression is disabled or file is not an image, return original file
    if (!compressBeforeUpload || !file.type.startsWith("image/")) {
      return file;
    }

    // If file is already smaller than our target size, returns it
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB < maxFileSizeMB * 0.8) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Creating a canvas to resize the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            console.warn("Could not get canvas context for image compression");
            resolve(file);
            return;
          }

          // Calculating dimensions with aspect ratio preserved
          let width = img.width;
          let height = img.height;
          
          // Scaling down if needed (to preserve aspect ratio)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          
          if (width > MAX_WIDTH) {
            const ratio = MAX_WIDTH / width;
            width = MAX_WIDTH;
            height = height * ratio;
          }
          
          if (height > MAX_HEIGHT) {
            const ratio = MAX_HEIGHT / height;
            height = MAX_HEIGHT;
            width = width * ratio;
          }
          
          // Setting canvas size
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed image
          const quality = 0.85; // Adjust quality (0.7-0.85 is usually good)
          const mimeType = file.type || "image/jpeg";
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.warn("Could not compress image");
                resolve(file);
                return;
              }
              
              // Create a new file name
              const newFileName = file.name.replace(
                /\.[^/.]+$/, 
                `.${mimeType.split("/")[1]}`
              );
              
              // Create a new File from the blob
              const compressedFile = new File(
                [blob], 
                newFileName, 
                { type: mimeType }
              );
              
              console.log(
                `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
              );
              
              resolve(compressedFile);
            },
            mimeType,
            quality
          );
        };
        
        img.onerror = () => {
          console.warn("Error loading image for compression");
          resolve(file);
        };
      };
      
      reader.onerror = () => {
        console.warn("Error reading file for compression");
        resolve(file);
      };
    });
  };

  /**
   * Cancels any ongoing upload
   */
  const cancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Upload cancelled by user");
    }
  };

  /**
   * Uploads an image file to Cloudinary with retry logic
   * @param file The file to upload
   * @returns The secure URL of the uploaded image
   */
  const uploadImage = async (file: File, retryCount = 0): Promise<string> => {
    // Validate configuration
    if (!cloudName || cloudName === "your-cloud-name") {
      const errorMsg = "Cloudinary cloud name is not configured";
      console.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!uploadPreset || uploadPreset === "user_profiles") {
      const errorMsg = "Cloudinary upload preset is not configured";
      console.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      const errorMsg = `File is too large (${fileSizeMB.toFixed(2)}MB). Maximum allowed size is ${maxFileSizeMB}MB`;
      console.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // Reset states
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Try to compress the image before uploading
      const fileToUpload = await compressImageIfNeeded(file);

      console.log("Starting Cloudinary upload with:", {
        cloudName,
        uploadPreset,
        fileName: file.name,
        fileSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
        attempt: retryCount + 1,
        maxRetries: maxRetries
      });

      // Create FormData for the file upload
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("upload_preset", uploadPreset);
      
      // Log the upload endpoint
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log("Uploading to:", uploadUrl);

      // Create cancel token
      const source = axios.CancelToken.source();
      setCancelTokenSource(source);

      // Upload to Cloudinary directly from frontend
      const response = await axios.post<CloudinaryUploadResponse>(
        uploadUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: timeout,
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
            if (onProgress) onProgress(percentCompleted);
          }
        }
      );

      console.log("Cloudinary upload successful:", response.data);
      setProgress(100);

      // Return the URL of the uploaded image
      return response.data.secure_url;
    } catch (error: any) {
      // If the upload was canceled by the user, report it
      if (axios.isCancel(error)) {
        const errorMsg = "Upload was cancelled";
        console.log(errorMsg);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.error(`Cloudinary upload error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
      
      // Check if we should retry
      if (retryCount < maxRetries) {
        console.log(`Retrying upload... (${retryCount + 1}/${maxRetries})`);
        setProgress(0);
        return uploadImage(file, retryCount + 1);
      }
      
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        const statusCode = error.response?.status;
        const responseData = error.response?.data;
        
        console.error("Axios error details:", {
          status: statusCode,
          data: responseData,
          message: error.message,
        });
        
        let errorMessage = "Error uploading image";
        
        if (error.code === "ECONNABORTED") {
          errorMessage = `Upload timed out after ${timeout / 1000} seconds. Try using a smaller image or check your internet connection.`;
        } else if (responseData && typeof responseData === 'object') {
          errorMessage = responseData.error?.message || 
                         responseData.message || 
                         `Upload failed (${statusCode}): ${error.message}`;
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        // Handle non-Axios errors
        const errorMessage = error instanceof Error 
          ? error.message 
          : "An unexpected error occurred during upload";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setCancelTokenSource(null);
    }
  };

  return { uploadImage, isUploading, error, progress, cancelUpload };
};