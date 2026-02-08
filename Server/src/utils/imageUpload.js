// Image Upload Utility using ImgBB API
const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");

/**
 * Upload image to ImgBB
 * @param {Buffer|String} imageData - Image buffer or base64 string
 * @param {String} imageName - Optional image name
 * @returns {Promise<Object>} - Upload result with URL
 */
async function uploadToImgBB(imageData, imageName = "upload") {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error("ImgBB API key not configured");
    }

    const formData = new FormData();

    // If imageData is a buffer, convert to base64
    let base64Image;
    if (Buffer.isBuffer(imageData)) {
      base64Image = imageData.toString("base64");
    } else if (typeof imageData === "string") {
      // Remove data:image/xxx;base64, prefix if present
      base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");
    } else {
      throw new Error("Invalid image data format");
    }

    formData.append("image", base64Image);
    formData.append("name", imageName);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.url,
        displayUrl: response.data.data.display_url,
        deleteUrl: response.data.data.delete_url,
        thumb: response.data.data.thumb,
        medium: response.data.data.medium,
        image: response.data.data.image,
      };
    } else {
      throw new Error("ImgBB upload failed");
    }
  } catch (error) {
    console.error("ImgBB upload error:", error.message);
    throw new Error(
      error.response?.data?.error?.message || "Image upload failed",
    );
  }
}

/**
 * Upload image from file path
 * @param {String} filePath - Path to image file
 * @param {String} imageName - Optional image name
 * @returns {Promise<Object>} - Upload result with URL
 */
async function uploadFileToImgBB(filePath, imageName = "upload") {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return await uploadToImgBB(imageBuffer, imageName);
  } catch (error) {
    console.error("File upload error:", error.message);
    throw new Error("Failed to upload file");
  }
}

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {Boolean} - True if valid
 */
function validateImage(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!file) {
    throw new Error("No file provided");
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
    );
  }

  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB");
  }

  return true;
}

module.exports = {
  uploadToImgBB,
  uploadFileToImgBB,
  validateImage,
};
