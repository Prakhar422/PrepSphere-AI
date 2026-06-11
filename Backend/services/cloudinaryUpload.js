
import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a binary buffer to Cloudinary using upload streams
 * @param {Buffer} buffer - In-memory file buffer from Multer
 * @param {string} originalName - Original filename for sanitization and naming
 * @returns {Promise<object>} Resolves with secure_url and public_id from Cloudinary
 */
export const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    // Sanitize filename to preserve alphanumeric, dots, hyphens, and underscores
    const sanitizedOriginal = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const publicIdName = `${uniqueSuffix}-${sanitizedOriginal}`;

    // Create a Cloudinary upload stream
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'PrepSphereAI/Resumes',
        resource_type: 'raw',
        public_id: publicIdName,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Convert the buffer to a readable stream and pipe it to Cloudinary upload stream
    stream.end(buffer);
  });
};

/**
 * Deletes a file from Cloudinary using its public_id
 * @param {string} publicId - The Cloudinary public ID of the resource
 * @returns {Promise<object>} Resolves with Cloudinary destroy result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

