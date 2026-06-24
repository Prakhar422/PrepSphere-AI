import ResumeAnalysis from '../models/ResumeAnalysis.js';
import QuizAttempt from '../models/QuizAttempt.js';
import InterviewSession from '../models/InterviewSession.js';
import InterviewExperience from '../models/InterviewExperience.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import CodingSubmission from '../models/CodingSubmission.js';
import { calculateInterviewStreak } from '../utils/streakUtility.js';

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

/**
 * @desc    Fetch dynamic Aptitude statistics aggregation for the dashboard widgets
 * @route   GET /api/dashboard/aptitude-summary
 * @access  Private (JWT protected)
 */
export const getAptitudeSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch completed attempts for the user
    const completedAttempts = await QuizAttempt.find({ user: userId, status: 'COMPLETED' })
      .sort({ submittedAt: -1 });

    const totalCompleted = completedAttempts.length;

    if (totalCompleted === 0) {
      return res.status(200).json({
        success: true,
        hasAttempts: false,
        overallScore: 0,
        weeklyImprovement: null,
        improvementText: "Start your first aptitude quiz to begin tracking your progress.",
        readiness: 0,
        chartData: [],
        progress: {
          today: 0,
          week: 0,
          month: 0
        },
        recentActivity: []
      });
    }

    // 2. Calculate average score (accuracy)
    const sumScore = completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
    const avgScore = sumScore / totalCompleted;
    const overallScore = Math.round((avgScore / 10) * 100);

    // 3. Weekly improvement text
    let weeklyImprovement = null;
    let improvementText = "";
    if (totalCompleted >= 2) {
      const diff = completedAttempts[0].accuracy - completedAttempts[1].accuracy;
      weeklyImprovement = diff;
      improvementText = `${diff >= 0 ? '+' : ''}${diff}% vs last quiz`;
    } else {
      improvementText = "Complete more quizzes to track improvement.";
    }

    // 4. Placement Readiness (Aptitude only for now)
    const sumAccuracy = completedAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0);
    const readiness = Math.round(sumAccuracy / totalCompleted);

    // 5. Chart Data (up to 7 latest quizzes, newest last for chart left-to-right flow)
    const recentAttemptsForChart = [...completedAttempts].slice(0, 7).reverse();
    const chartData = recentAttemptsForChart.map((attempt, index) => ({
      name: `Quiz ${index + 1}`,
      score: attempt.accuracy
    }));

    // 6. Preparation Progress
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    startOfMonth.setHours(0, 0, 0, 0);

    // Questions attempted today (sum of totalQuestions - skippedQuestions)
    const todayAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: startOfToday }
    });
    let questionsAttemptedToday = 0;
    todayAttempts.forEach(attempt => {
      questionsAttemptedToday += (attempt.totalQuestions - attempt.skippedQuestions) || 0;
    });

    // Quizzes completed this week
    const completedQuizzesThisWeek = await QuizAttempt.countDocuments({
      user: userId,
      status: 'COMPLETED',
      submittedAt: { $gte: startOfWeek }
    });

    // Quizzes completed this month
    const completedQuizzesThisMonth = await QuizAttempt.countDocuments({
      user: userId,
      status: 'COMPLETED',
      submittedAt: { $gte: startOfMonth }
    });

    // 7. Recent Activity (latest 5 completed attempts formatted)
    const recentActivity = completedAttempts.slice(0, 5).map(attempt => {
      const date = new Date(attempt.submittedAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let relativeTime = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (date.toDateString() === today.toDateString()) {
        relativeTime = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        relativeTime = "Yesterday";
      }

      return {
        category: attempt.category,
        score: attempt.score,
        accuracy: attempt.accuracy,
        submittedAt: attempt.submittedAt,
        timeText: relativeTime
      };
    });

    return res.status(200).json({
      success: true,
      hasAttempts: true,
      overallScore,
      weeklyImprovement,
      improvementText,
      readiness,
      chartData,
      progress: {
        today: questionsAttemptedToday,
        week: completedQuizzesThisWeek,
        month: completedQuizzesThisMonth
      },
      recentActivity
    });
  } catch (error) {
    console.error('Error in getAptitudeSummary:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to compile aptitude summary: ${error.message}`
    });
  }
};

/**
 * @desc    Fetch a combined overview summary of all modules (Resume ATS + Aptitude)
 * @route   GET /api/dashboard/summary
 * @access  Private (JWT protected)
 */
export const getCombinedDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch resume history for the authenticated user
    const resumeAnalyses = await ResumeAnalysis.find({ user: userId }).sort({ createdAt: 1 });
    const hasResume = resumeAnalyses.length > 0;
    const latestResume = hasResume ? resumeAnalyses[resumeAnalyses.length - 1] : null;
    const latestAtsScore = latestResume ? (latestResume.atsAnalysis?.score || 0) : 0;
    const latestAtsLabel = latestResume ? (latestResume.atsAnalysis?.label || "Needs Optimization") : "";
    const uploadStatus = latestResume ? (latestResume.uploadStatus || "") : "";
    
    let strengths = [];
    if (latestResume) {
      if (latestResume.sectionAnalysis && latestResume.sectionAnalysis.length > 0) {
        strengths = [...latestResume.sectionAnalysis]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(sec => `${sec.section} (${sec.score}%)`);
      } else if (latestResume.overallReport?.strengths) {
        strengths = latestResume.overallReport.strengths
          .split(/[.,;]/)
          .map(s => s.trim())
          .filter(s => s.length > 5 && s.length < 30)
          .slice(0, 3);
      }
    }
    if (strengths.length === 0) {
      strengths = ["ATS Optimized Layout", "Logical Structure"];
    }
    const missingKeywords = latestResume ? (latestResume.missingKeywords || []) : [];

    // 2. Fetch quiz attempts for user
    const completedAttempts = await QuizAttempt.find({ user: userId, status: 'COMPLETED' })
      .sort({ submittedAt: -1 });
    const allAttempts = await QuizAttempt.find({ user: userId }).sort({ createdAt: -1 });

    const totalCompleted = completedAttempts.length;
    const hasAttempts = totalCompleted > 0;

    let overallScore = 0;
    let averageAccuracy = 0;
    if (hasAttempts) {
      const sumScore = completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
      const avgScore = sumScore / totalCompleted;
      overallScore = Math.round((avgScore / 10) * 100);

      const sumAccuracy = completedAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0);
      averageAccuracy = Math.round(sumAccuracy / totalCompleted);
    }

    // Weekly improvement text
    let weeklyImprovement = null;
    let improvementText = "";
    if (totalCompleted >= 2) {
      const diff = completedAttempts[0].accuracy - completedAttempts[1].accuracy;
      weeklyImprovement = diff;
      improvementText = `${diff >= 0 ? '+' : ''}${diff}% vs last quiz`;
    } else {
      improvementText = hasAttempts 
        ? "Complete more quizzes to track improvement." 
        : "No aptitude activity yet. Start your first aptitude quiz.";
    }

    // 3. Fetch Mock Interview session stats
    const allInterviewSessions = await InterviewSession.find({ user: userId }).sort({ createdAt: -1 });
    const completedInterviews = allInterviewSessions.filter(s => s.status === 'COMPLETED');
    const totalInterviews = completedInterviews.length;
    const hasInterviews = totalInterviews > 0;

    let averageInterviewScore = 0;
    let highestScore = 0;
    let latestInterview = null;

    if (hasInterviews) {
      const scores = completedInterviews.map(s => s.report ? s.report.overallScore : 0);
      const totalScoreSum = scores.reduce((acc, s) => acc + s, 0);
      averageInterviewScore = Math.round(totalScoreSum / totalInterviews);
      highestScore = Math.max(...scores, 0);
      latestInterview = completedInterviews[0];
    }

    const interviewPracticeStreak = await calculateInterviewStreak(completedInterviews);

    // 3.5. Fetch Coding Journey submissions
    const codingSubmissions = await CodingSubmission.find({ user: userId })
      .populate('question', 'title topic difficulty')
      .sort({ submittedAt: -1 })
      .lean();

    const uniqueCodingAttemptedIds = new Set(codingSubmissions.map(s => s.question?._id?.toString()).filter(Boolean));
    const totalCodingAttempted = uniqueCodingAttemptedIds.size;

    const uniqueCodingSolvedIds = new Set(
      codingSubmissions
        .filter(s => s.status === 'passed')
        .map(s => s.question?._id?.toString())
        .filter(Boolean)
    );
    const totalCodingSolved = uniqueCodingSolvedIds.size;

    const totalPassedCodingSubmissions = codingSubmissions.filter(s => s.status === 'passed').length;
    const likelyAcceptanceRate = codingSubmissions.length > 0
      ? Math.round((totalPassedCodingSubmissions / codingSubmissions.length) * 100)
      : 0;

    // 4. Calculate Placement Readiness
    // Weights: Resume (30%), Aptitude (30%), Mock Interview (40%)
    let readiness = 0;
    if (hasResume && hasAttempts && hasInterviews) {
      readiness = Math.round((averageAccuracy * 0.30) + (latestAtsScore * 0.30) + (averageInterviewScore * 0.40));
    } else if (hasResume && hasAttempts) {
      readiness = Math.round((averageAccuracy * 0.40) + (latestAtsScore * 0.60));
    } else if (hasResume) {
      readiness = Math.round(latestAtsScore);
    } else if (hasAttempts) {
      readiness = Math.round(averageAccuracy);
    }

    // 5. Chart Data (up to 7 latest completed quizzes, in chronological order)
    const recentAttemptsForChart = [...completedAttempts].slice(0, 7).reverse();
    const chartData = recentAttemptsForChart.map((attempt, index) => ({
      name: `Quiz ${index + 1}`,
      score: attempt.accuracy
    }));

    // 6. Preparation Progress metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    startOfMonth.setHours(0, 0, 0, 0);

    // Questions attempted today (from all attempts started today)
    const todayAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: startOfToday }
    });
    let questionsAttemptedToday = 0;
    todayAttempts.forEach(attempt => {
      questionsAttemptedToday += (attempt.totalQuestions - attempt.skippedQuestions) || 0;
    });

    const completedQuizzesThisWeek = await QuizAttempt.countDocuments({
      user: userId,
      status: 'COMPLETED',
      submittedAt: { $gte: startOfWeek }
    });

    const completedQuizzesThisMonth = await QuizAttempt.countDocuments({
      user: userId,
      status: 'COMPLETED',
      submittedAt: { $gte: startOfMonth }
    });

    // Helper to calculate relative time text matching exact prompt syntax
    const getRelativeTimeText = (date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHrs = Math.floor(diffMin / 60);
      
      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
      if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
      
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // 7. Build Resume Analyzer Activities list
    const resumeActivities = [];
    for (let i = 0; i < resumeAnalyses.length; i++) {
      const doc = resumeAnalyses[i];
      const timestamp = doc.createdAt;
      
      if (i === 0) {
        resumeActivities.push({
          desc: "Resume uploaded successfully",
          icon: "FileSearch",
          color: "text-blue-400 bg-blue-500/10",
          timestamp
        });
      } else {
        resumeActivities.push({
          desc: "Resume Updated",
          icon: "FileSearch",
          color: "text-blue-400 bg-blue-500/10",
          timestamp
        });
        resumeActivities.push({
          desc: "Resume Re-analyzed",
          icon: "FileSearch",
          color: "text-blue-400 bg-blue-500/10",
          timestamp
        });
      }

      if (doc.atsAnalysis && typeof doc.atsAnalysis.score === 'number') {
        resumeActivities.push({
          desc: "Resume ATS analysis completed",
          detail: `ATS Score ${doc.atsAnalysis.score}%`,
          icon: "FileSearch",
          color: "text-purple-400 bg-purple-500/10",
          timestamp: doc.analysisCompletedAt || doc.createdAt
        });

        if (i > 0 && doc.atsAnalysis.score > resumeAnalyses[i-1].atsAnalysis?.score) {
          resumeActivities.push({
            desc: "ATS Score Improved",
            detail: `Improved to ${doc.atsAnalysis.score}% (from ${resumeAnalyses[i-1].atsAnalysis.score}%)`,
            icon: "Sparkles",
            color: "text-emerald-400 bg-emerald-500/10",
            timestamp: doc.analysisCompletedAt || doc.createdAt
          });
        }
      }
    }

    // 8. Build Aptitude Activities list
    const aptitudeActivities = [];
    for (const attempt of allAttempts) {
      const timestamp = attempt.submittedAt || attempt.startedAt || attempt.createdAt;
      if (attempt.status === 'COMPLETED') {
        aptitudeActivities.push({
          desc: `Completed ${attempt.category} Quiz`,
          detail: `Score ${attempt.score}/10`,
          icon: "Brain",
          color: "text-pink-400 bg-pink-500/10",
          timestamp
        });
        aptitudeActivities.push({
          desc: "Completed Aptitude Assessment",
          detail: `Accuracy ${attempt.accuracy}%`,
          icon: "Brain",
          color: "text-pink-400 bg-pink-500/10",
          timestamp
        });
      } else if (attempt.status === 'IN_PROGRESS') {
        aptitudeActivities.push({
          desc: `Started ${attempt.category} Quiz`,
          icon: "Brain",
          color: "text-pink-400 bg-pink-500/10",
          timestamp
        });
      }
    }

    // 9. Build Mock Interview Activities list
    const interviewActivities = [];
    for (const session of allInterviewSessions) {
      const timestamp = session.completedAt || session.createdAt;
      if (session.status === 'COMPLETED') {
        interviewActivities.push({
          desc: `Completed Mock ${session.interviewType} Interview`,
          detail: `Score ${session.report ? session.report.overallScore : 0}%`,
          icon: "MessageSquareCode",
          color: "text-purple-400 bg-purple-500/10",
          timestamp
        });
      } else if (session.status === 'IN_PROGRESS') {
        interviewActivities.push({
          desc: `Started Mock ${session.interviewType} Interview`,
          detail: `${session.role} at ${session.company}`,
          icon: "MessageSquareCode",
          color: "text-purple-400 bg-purple-500/10",
          timestamp
        });
      }
    }

    // 9.5. Build Interview Experience Activities list
    const myExperiences = await InterviewExperience.find({ author: userId }).sort({ createdAt: -1 });
    const experienceActivities = [];
    for (const exp of myExperiences) {
      experienceActivities.push({
        desc: `Shared a ${exp.company} ${exp.role} interview experience.`,
        detail: `Verdict: ${exp.result} | Package: ${exp.package ? `${exp.package} LPA` : "N/A"}`,
        icon: "Briefcase",
        color: "text-emerald-400 bg-emerald-500/10",
        timestamp: exp.createdAt
      });
    }

    const userLikes = await Like.find({ user: userId }).populate('experience', 'company role').lean();
    const userBookmarks = await Bookmark.find({ user: userId }).populate({
      path: 'experience',
      populate: { path: 'author', select: 'name profileImage college' }
    }).lean();
    const userComments = await Comment.find({ user: userId }).populate('experience', 'company role').lean();
    const userReports = await Report.find({ user: userId }).populate('experience', 'company role').lean();

    const likedSet = new Set(userLikes.map(l => l.experience?._id?.toString()).filter(Boolean));
    const savedExperiences = userBookmarks
      .map(b => b.experience)
      .filter(Boolean)
      .map(e => ({
        ...e,
        isBookmarked: true,
        isLiked: likedSet.has(e._id?.toString())
      }));

    userLikes.forEach(like => {
      if (like.experience) {
        experienceActivities.push({
          desc: `Liked ${like.experience.company}'s interview experience`,
          detail: `Role: ${like.experience.role}`,
          icon: "Heart",
          color: "text-red-400 bg-red-500/10",
          timestamp: like.createdAt
        });
      }
    });

    userBookmarks.forEach(b => {
      if (b.experience) {
        experienceActivities.push({
          desc: `Bookmarked ${b.experience.company}'s interview experience`,
          detail: `Role: ${b.experience.role}`,
          icon: "Bookmark",
          color: "text-indigo-400 bg-indigo-500/10",
          timestamp: b.createdAt
        });
      }
    });

    userComments.forEach(c => {
      if (c.experience) {
        experienceActivities.push({
          desc: `Commented on ${c.experience.company}'s interview experience`,
          detail: `"${c.content.length > 35 ? c.content.substring(0, 35) + '...' : c.content}"`,
          icon: "MessageSquare",
          color: "text-pink-400 bg-pink-500/10",
          timestamp: c.createdAt
        });
      }
    });

    userReports.forEach(r => {
      if (r.experience) {
        experienceActivities.push({
          desc: `Reported ${r.experience.company}'s interview experience`,
          detail: `Reason: ${r.reason}`,
          icon: "AlertTriangle",
          color: "text-yellow-400 bg-yellow-500/10",
          timestamp: r.createdAt
        });
      }
    });

    // Build Coding Journey activities list
    const codingActivities = codingSubmissions.map(sub => {
      const verdictText = sub.status === 'passed' ? 'Likely Accepted' : sub.status === 'partial' ? 'Partially Correct' : 'Likely Wrong Answer';
      return {
        desc: `Submitted solution for ${sub.question?.title || 'Coding Challenge'}`,
        detail: `Verdict: ${verdictText} | Score: ${sub.score}/100`,
        icon: "Code2",
        color: sub.status === 'passed' ? "text-emerald-400 bg-emerald-500/10" : sub.status === 'partial' ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10",
        timestamp: sub.submittedAt
      };
    });

    // Merge and sort all activities chronologically, format relative times
    const combinedActivities = [...resumeActivities, ...aptitudeActivities, ...interviewActivities, ...experienceActivities, ...codingActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(act => ({
        desc: act.desc,
        detail: act.detail,
        icon: act.icon,
        color: act.color,
        time: getRelativeTimeText(new Date(act.timestamp))
      }));

    return res.status(200).json({
      success: true,
      totalExperiencesShared: myExperiences.length,
      totalLikesGiven: userLikes.length,
      totalBookmarkedExperiences: savedExperiences.length,
      totalComments: userComments.length,
      savedExperiences,
      interviewPracticeStreak,
      resumeSummary: {
        hasResume,
        atsScore: latestAtsScore,
        atsLabel: latestAtsLabel,
        uploadStatus,
        strengths,
        missingKeywords
      },
      aptitudeSummary: {
        hasAttempts,
        overallScore,
        weeklyImprovement,
        improvementText,
        readiness: averageAccuracy,
        chartData,
        progress: {
          today: questionsAttemptedToday,
          week: completedQuizzesThisWeek,
          month: completedQuizzesThisMonth
        }
      },
      interviewSummary: {
        hasInterviews,
        totalInterviews,
        averageScore: averageInterviewScore,
        highestScore,
        latestInterview: latestInterview ? {
          id: latestInterview._id,
          company: latestInterview.company,
          role: latestInterview.role,
          score: latestInterview.report ? latestInterview.report.overallScore : 0,
          date: latestInterview.completedAt ? new Date(latestInterview.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
          category: latestInterview.interviewType,
          communicationScore: latestInterview.report ? latestInterview.report.communicationScore : 0
        } : null,
        interviewPracticeStreak
      },
      codingSummary: {
        totalAttempted: totalCodingAttempted,
        totalSolved: totalCodingSolved,
        likelyAcceptanceRate,
        totalSubmissions: codingSubmissions.length
      },
      readiness,
      activities: combinedActivities.slice(0, 10)
    });
  } catch (error) {
    console.error('Error in getCombinedDashboardSummary:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to compile combined dashboard summary: ${error.message}`
    });
  }
};

