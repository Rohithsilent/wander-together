// Cloudinary unsigned upload service
// TODO: Move to environment variables later
// import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
// import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUD_NAME = "dit1wl6qa";
const UPLOAD_PRESET = "wandermate";

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (
  file: File,
  folder: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || "Image upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

export const validateImageFile = (
  file: File,
  maxSizeMB: number = 3
): string | null => {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file.";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB.`;
  }
  return null;
};
