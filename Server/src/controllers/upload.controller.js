// Upload controller for handling image uploads to ImgBB
const { uploadToImgBB, validateImage } = require("../utils/imageUpload");

/**
 * Upload single image to ImgBB
 * POST /api/upload/image
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate the uploaded file
    try {
      validateImage(req.file);
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }

    // Get image name from request or use original filename
    const imageName =
      req.body.name || req.file.originalname.split(".")[0] || "upload";

    // Upload to ImgBB
    const result = await uploadToImgBB(req.file.buffer, imageName);

    return res.status(200).json({
      message: "Image uploaded successfully",
      url: result.url,
      displayUrl: result.displayUrl,
      thumb: result.thumb,
      medium: result.medium,
      deleteUrl: result.deleteUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: error.message || "Failed to upload image",
    });
  }
};

/**
 * Upload multiple images to ImgBB
 * POST /api/upload/images
 */
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = req.files.map(async (file, index) => {
      try {
        validateImage(file);
        const imageName =
          req.body[`name_${index}`] ||
          file.originalname.split(".")[0] ||
          `upload_${index}`;
        return await uploadToImgBB(file.buffer, imageName);
      } catch (error) {
        return { error: error.message, filename: file.originalname };
      }
    });

    const results = await Promise.all(uploadPromises);

    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);

    return res.status(200).json({
      message: `${successful.length} image(s) uploaded successfully`,
      successful: successful.map((r) => ({
        url: r.url,
        displayUrl: r.displayUrl,
        thumb: r.thumb,
      })),
      failed: failed,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    return res.status(500).json({
      message: error.message || "Failed to upload images",
    });
  }
};
