import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { uploadToCloudinary } from '../services/cloudinaryUpload.js';
import { extractTextFromBuffer } from '../services/extractionService.js';

/**
 * @desc    Upload resume, extract plain text directly from buffer, store in Cloudinary + DB
 * @route   POST /api/resume/upload
 * @access  Private (JWT protected)
 */
export const uploadResumeMetadata = async (req, res, next) => {
  try {
    
    const { originalname, buffer, mimetype, size } = req.file;

// Create two independent copies
const extractionBuffer = Buffer.from(buffer);
const uploadBuffer = Buffer.from(buffer);

// Extract text
const extractedText = await extractTextFromBuffer(
  extractionBuffer,
  mimetype
);

// ...



const result = await uploadToCloudinary(
  uploadBuffer,
  originalname
);

    // 4. Create a new ResumeAnalysis document mapping to the authenticated user ID
    const resumeAnalysis = new ResumeAnalysis({
      user: req.user._id,
      resumeName: originalname,
      resumeUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileType: mimetype,
      fileSize: size,
      uploadStatus: 'uploaded',
    });

    // 5. Save metadata record in MongoDB
    await resumeAnalysis.save();

    // 6. Respond with success keys and the extracted text alongside metadata block
    return res.status(201).json({
      success: true,
      resumeUrl: resumeAnalysis.resumeUrl,
      text: extractedText,
      resume: {
        id: resumeAnalysis._id,
        resumeName: resumeAnalysis.resumeName,
        resumeUrl: resumeAnalysis.resumeUrl,
        fileSize: resumeAnalysis.fileSize,
        createdAt: resumeAnalysis.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in uploadResumeMetadata controller:', error);
    
    // Check if it is a validation or custom format parsing error to return 400
    const errorMsg = error?.message || "Unknown error";
    if (
      errorMsg.includes('Unsupported') || 
      errorMsg.includes('corrupted') || 
      errorMsg.includes('empty') || 
      errorMsg.includes('invalid')
    ) {
      return res.status(400).json({
        success: false,
        message: errorMsg,
      });
    }

    return next(error);
  }
};
