import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryUpload.js';
import { extractTextFromBuffer } from '../services/extractionService.js';
import { analyzeResumeWithGemini } from '../services/geminiService.js';

/**
 * Helper to map Gemini JSON to frontend-friendly fields for compatibility.
 */
const mapAnalysisForFrontend = (analysis, fileName, fileSize, cloudinaryUrl) => {
  // Convert placement readiness currentStage (1-4) to string for UI compatibility
  const stageMap = {
    1: 'Foundation',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Placement Ready'
  };
  const uiPlacementReadiness = stageMap[analysis.placementReadiness?.currentStage] || 'Advanced';

  // Map improvement suggestions to include color classes and id
  const uiSuggestions = (analysis.improvementSuggestions || []).map((sug, idx) => {
    const priority = sug.priority || 'MEDIUM';
    let color = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; // Medium default
    if (priority.toUpperCase() === 'HIGH') {
      color = 'text-red-400 bg-red-500/10 border-red-500/20';
    } else if (priority.toUpperCase() === 'LOW') {
      color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
    return {
      id: idx + 1,
      text: sug.title || '',
      explanation: sug.description || '',
      priority: priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase(),
      color
    };
  });

  // Map section analysis array to object map
  const uiSectionAnalysis = {};
  const allowedSections = ['education', 'projects', 'skills', 'experience', 'achievements', 'certifications'];
  
  // Set default values
  allowedSections.forEach(section => {
    uiSectionAnalysis[section] = {
      score: 80,
      status: 'Good',
      suggestions: 'No recommendations.'
    };
  });

  if (Array.isArray(analysis.sectionAnalysis)) {
    analysis.sectionAnalysis.forEach(sec => {
      if (sec && sec.section) {
        const key = sec.section.toLowerCase();
        if (allowedSections.includes(key)) {
          uiSectionAnalysis[key] = {
            score: typeof sec.score === 'number' ? sec.score : 80,
            status: sec.status || 'Good',
            suggestions: sec.suggestions || ''
          };
        }
      }
    });
  }

  // Format rating
  let uiRatingStr = '4.0 / 5.0';
  if (analysis.overallReport?.rating !== undefined) {
    const r = analysis.overallReport.rating;
    uiRatingStr = r.toString().includes('/') ? r.toString() : `${r} / 5.0`;
  }

  const documentSource = {
    fileName,
    fileSize,
    cloudinaryUrl
  };

  return {
    // Exact schema keys as requested in user's prompt
    atsAnalysis: analysis.atsAnalysis,
    diagnostics: analysis.diagnostics,
    documentSource,
    placementReadiness: {
      currentStage: analysis.placementReadiness?.currentStage || 3,
      stages: analysis.placementReadiness?.stages || []
    },
    improvementSuggestions: analysis.improvementSuggestions || [],
    missingKeywords: analysis.missingKeywords || [],
    sectionAnalysis: analysis.sectionAnalysis || [],
    overallReport: analysis.overallReport,

    // Frontend UI compatibility fields to prevent any UI breakage if bound directly
    atsScore: analysis.atsAnalysis?.score || 0,
    atsScoreLabel: analysis.atsAnalysis?.label || '',
    atsScoreDescription: analysis.diagnostics?.description || '',
    skillsMatch: analysis.diagnostics?.skillsMatch || 0,
    formattingScore: analysis.diagnostics?.formatting || 0,
    formattingScoreLabel: (analysis.diagnostics?.formatting || 0) >= 90 ? 'Professional Layout' : 'Standard Layout',
    placementReadinessStr: uiPlacementReadiness,
    suggestions: uiSuggestions,
    sectionAnalysisObj: uiSectionAnalysis,
    overallFeedback: {
      rating: uiRatingStr,
      strengths: analysis.overallReport?.strengths || '',
      weaknesses: analysis.overallReport?.weaknesses || '',
      recruiterPerspective: analysis.overallReport?.recruiterPerspective || '',
      finalRecommendation: analysis.overallReport?.finalAdvice || ''
    }
  };
};

/**
 * @desc    Upload resume, extract plain text directly from buffer, analyze with Gemini, store in Cloudinary + DB
 * @route   POST /api/resume/upload
 * @access  Private (JWT protected)
 */
export const uploadResumeMetadata = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { originalname, buffer, mimetype, size } = req.file;

    // Create independent copies
    const extractionBuffer = Buffer.from(buffer);
    const uploadBuffer = Buffer.from(buffer);

    // 1. Extract text from the buffer in-memory
    const extractedText = await extractTextFromBuffer(
      extractionBuffer,
      mimetype
    );

    // 2. Send extracted text to Gemini and receive analysis
    const geminiAnalysis = await analyzeResumeWithGemini(extractedText);
    console.log('geminiAnalysis:', geminiAnalysis);
    if (!geminiAnalysis) {
      throw new Error('Invalid JSON returned by Gemini AI analyzer.');
    }

    // 3. Upload resume to Cloudinary (only after successful Gemini validation)
    const cloudinaryResult = await uploadToCloudinary(
      uploadBuffer,
      originalname
    );

    const formattedSize = `${(size / 1024).toFixed(1)} KB`;

    // 4. Create a new ResumeAnalysis document mapping to the authenticated user ID
    const resumeAnalysis = new ResumeAnalysis({
      user: req.user._id,
      resumeName: originalname,
      resumeUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      fileType: mimetype,
      fileSize: size,
      uploadStatus: 'analyzed',
      
      // Save AI report fields to MongoDB schema
      atsAnalysis: geminiAnalysis.atsAnalysis,
      diagnostics: geminiAnalysis.diagnostics,
      placementReadiness: geminiAnalysis.placementReadiness,
      improvementSuggestions: geminiAnalysis.improvementSuggestions,
      missingKeywords: geminiAnalysis.missingKeywords,
      sectionAnalysis: geminiAnalysis.sectionAnalysis,
      overallReport: geminiAnalysis.overallReport,
      analysisStatus: 'completed',
      analysisCompletedAt: new Date(),
      
      // Save recruiter-oriented profile details
      candidateName: geminiAnalysis.candidateName,
      professionalSummary: geminiAnalysis.professionalSummary,
      technicalSkills: geminiAnalysis.technicalSkills,
      projects: geminiAnalysis.projects,
      experience: geminiAnalysis.experience,
      education: geminiAnalysis.education,
      certifications: geminiAnalysis.certifications,
      achievements: geminiAnalysis.achievements,
      relevantKeywords: geminiAnalysis.relevantKeywords
    });

    // 5. Save metadata + analysis record in MongoDB
    await resumeAnalysis.save();

    // 6. Map analysis for frontend consumption
    const finalAnalysis = mapAnalysisForFrontend(
      geminiAnalysis,
      originalname,
      formattedSize,
      cloudinaryResult.secure_url
    );

    // 7. Respond with success, resume object, and analysis object
    return res.status(201).json({
      success: true,
      resume: {
        id: resumeAnalysis._id,
        resumeName: resumeAnalysis.resumeName,
        resumeUrl: resumeAnalysis.resumeUrl,
        fileSize: resumeAnalysis.fileSize,
        createdAt: resumeAnalysis.createdAt,
      },
      analysis: finalAnalysis
    });
  } catch (error) {
    console.error('Error in uploadResumeMetadata controller:', error);
    
    const errorMsg = error?.message || "Unknown error";
    
    // Check if it is a validation or custom format parsing error to return 400
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

    // Return 500 Internal Server Error for Gemini failures or other backend errors
    return res.status(500).json({
      success: false,
      message: `Gemini AI analysis failed: ${errorMsg}`,
    });
  }
};

/**
 * @desc    Fetch resume history summaries for the authenticated user
 * @route   GET /api/resume/history
 * @access  Private (JWT protected)
 */
export const getResumeHistory = async (req, res, next) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id })
      .select('_id resumeName createdAt atsAnalysis overallReport analysisStatus resumeUrl fileType fileSize')
      .sort({ createdAt: -1 });

    const history = analyses.map(doc => ({
      id: doc._id,
      resumeName: doc.resumeName,
      createdAt: doc.createdAt,
      atsScore: doc.atsAnalysis?.score !== undefined ? doc.atsAnalysis.score : 0,
      overallRating: doc.overallReport?.rating !== undefined ? doc.overallReport.rating : 0,
      analysisStatus: doc.analysisStatus || 'completed',
      resumeUrl: doc.resumeUrl,
      fileType: doc.fileType,
      fileSize: doc.fileSize
    }));

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error in getResumeHistory controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch history: ${error.message}`
    });
  }
};

/**
 * @desc    Fetch a complete resume analysis record by ID
 * @route   GET /api/resume/:id
 * @access  Private (JWT protected)
 */
export const getResumeAnalysisById = async (req, res, next) => {
  try {
    const doc = await ResumeAnalysis.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found'
      });
    }

    // Verify ownership
    if (doc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this analysis record'
      });
    }

    const formattedSize = `${(doc.fileSize / 1024).toFixed(1)} KB`;
    const finalAnalysis = mapAnalysisForFrontend(
      doc,
      doc.resumeName,
      formattedSize,
      doc.resumeUrl
    );

    return res.status(200).json({
      success: true,
      resume: {
        id: doc._id,
        resumeName: doc.resumeName,
        resumeUrl: doc.resumeUrl,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
      },
      analysis: finalAnalysis
    });
  } catch (error) {
    console.error('Error in getResumeAnalysisById controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch analysis details: ${error.message}`
    });
  }
};

/**
 * @desc    Delete a resume analysis record and its corresponding Cloudinary file
 * @route   DELETE /api/resume/:id
 * @access  Private (JWT protected)
 */
export const deleteResumeAnalysis = async (req, res, next) => {
  try {
    const doc = await ResumeAnalysis.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found'
      });
    }

    // Verify ownership
    if (doc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this analysis record'
      });
    }

    // Delete from Cloudinary if public ID is present
    if (doc.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(doc.cloudinaryPublicId);
      } catch (cloudinaryErr) {
        console.warn('Failed to delete resume from Cloudinary during record deletion:', cloudinaryErr);
      }
    }

    // Delete from MongoDB
    await ResumeAnalysis.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Resume analysis and associated storage files deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteResumeAnalysis controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete record: ${error.message}`
    });
  }
};

