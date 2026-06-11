import ResumeAnalysis from '../models/ResumeAnalysis.js';

/**
 * @desc    Fetch the summary of the latest resume analysis for the authenticated user
 * @route   GET /api/dashboard/resume-summary
 * @access  Private (JWT protected)
 */
export const getResumeSummary = async (req, res, next) => {
  try {
    // Always return the latest analysis sorted by createdAt in descending order
    const doc = await ResumeAnalysis.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!doc) {
      return res.status(200).json({
        success: true,
        hasResume: false
      });
    }

    // Extract strengths from top scoring sections, falling back to overall report sentences
    let strengths = [];
    if (doc.sectionAnalysis && doc.sectionAnalysis.length > 0) {
      strengths = [...doc.sectionAnalysis]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(sec => `${sec.section} (${sec.score}%)`);
    } else if (doc.overallReport?.strengths) {
      // Split by punctuation, grab short chunks
      strengths = doc.overallReport.strengths
        .split(/[.,;]/)
        .map(s => s.trim())
        .filter(s => s.length > 5 && s.length < 30)
        .slice(0, 3);
    }
    
    // Final default fallback if no strengths found
    if (strengths.length === 0) {
      strengths = ["ATS Optimized Layout", "Logical Structure"];
    }

    return res.status(200).json({
      success: true,
      hasResume: true,
      atsScore: doc.atsAnalysis?.score || 0,
      atsLabel: doc.atsAnalysis?.label || "Needs Optimization",
      strengths,
      missingKeywords: doc.missingKeywords || []
    });
  } catch (error) {
    console.error('Error in getResumeSummary controller:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve resume summary: ${error.message}`
    });
  }
};
