import axios from "axios";

/**
 * Uploads a file/blob to Cloudinary
 * @param {File|Blob} fileBlob
 * @param {Object} options
 * @param {boolean} options.isOriginal
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export async function uploadToCloudinary(
  fileBlob,
  { isOriginal = false } = {},
) {
  const formData = new FormData();
  formData.append("file", fileBlob);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );
  formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData,
  );

  return {
    secure_url: response.data.secure_url,
    public_id: response.data.public_id,
    width: response.data.width,
    height: response.data.height,
  };
}
