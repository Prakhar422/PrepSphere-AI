import { jsPDF } from "jspdf";

// Helper to determine adaptive metrics by interview type
export const getAdaptiveMetrics = (report) => {
  if (!report) return { radarData: [], overviewCards: [] };
  
  const category = (report.interviewType || report.category || "Technical").toLowerCase();
  const score = report.overallScore ?? report.score ?? 70;
  
  const getVal = (field, offset = 0) => {
    if (report.metrics && report.metrics[field] !== undefined) {
      return report.metrics[field];
    }
    if (report[field + "Score"] !== undefined) {
      return report[field + "Score"];
    }
    if (report[field] !== undefined && typeof report[field] === 'number') {
      return report[field];
    }
    return Math.round(Math.max(50, Math.min(100, score + offset)));
  };

  if (category.includes("tech") || category.includes("system")) {
    const technicalKnowledge = getVal("technicalAccuracy", 2);
    const problemSolving = getVal("problemSolving", 4);
    const communication = getVal("communication", -2);
    const confidence = getVal("confidence", 3);
    const professionalism = getVal("professionalism", 5);
    const criticalThinking = getVal("criticalThinking", 1);

    return {
      radarData: [
        { subject: "Technical Knowledge", value: technicalKnowledge },
        { subject: "Problem Solving", value: problemSolving },
        { subject: "Communication", value: communication },
        { subject: "Confidence", value: confidence },
        { subject: "Professionalism", value: professionalism },
        { subject: "Critical Thinking", value: criticalThinking }
      ],
      overviewCards: [
        { label: "Overall Score", val: `${score}%`, col: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
        { label: "Technical Knowledge", val: `${technicalKnowledge}%`, col: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { label: "Problem Solving", val: `${problemSolving}%`, col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Communication", val: `${communication}%`, col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Confidence", val: `${confidence}%`, col: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
        { label: "Professionalism", val: `${professionalism}%`, col: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
      ]
    };
  } else if (category.includes("hr") || category.includes("behavioral")) {
    const communication = getVal("communication", 5);
    const professionalism = getVal("professionalism", 8);
    const behavioralResponses = getVal("behavioralResponses", 2);
    const leadership = getVal("leadership", -1);
    const companyAlignment = getVal("companyAlignment", 4);
    const confidence = getVal("confidence", 3);

    return {
      radarData: [
        { subject: "Communication", value: communication },
        { subject: "Professionalism", value: professionalism },
        { subject: "Behavioral Responses", value: behavioralResponses },
        { subject: "Leadership", value: leadership },
        { subject: "Company Alignment", value: companyAlignment },
        { subject: "Confidence", value: confidence }
      ],
      overviewCards: [
        { label: "Overall Score", val: `${score}%`, col: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
        { label: "Communication", val: `${communication}%`, col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Professionalism", val: `${professionalism}%`, col: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
        { label: "Behavioral Responses", val: `${behavioralResponses}%`, col: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { label: "Leadership", val: `${leadership}%`, col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Company Alignment", val: `${companyAlignment}%`, col: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
        { label: "Confidence", val: `${confidence}%`, col: "text-pink-400 bg-pink-500/10 border-pink-500/20" }
      ]
    };
  } else if (category.includes("market")) {
    const communication = getVal("communication", 4);
    const creativity = getVal("creativity", 6);
    const businessUnderstanding = getVal("businessUnderstanding", 1);
    const customerThinking = getVal("customerThinking", 3);
    const professionalism = getVal("professionalism", 2);
    const criticalThinking = getVal("criticalThinking", 5);

    return {
      radarData: [
        { subject: "Communication", value: communication },
        { subject: "Creativity", value: creativity },
        { subject: "Business Understanding", value: businessUnderstanding },
        { subject: "Customer Thinking", value: customerThinking },
        { subject: "Professionalism", value: professionalism },
        { subject: "Critical Thinking", value: criticalThinking }
      ],
      overviewCards: [
        { label: "Overall Score", val: `${score}%`, col: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
        { label: "Communication", val: `${communication}%`, col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Creativity", val: `${creativity}%`, col: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
        { label: "Business Understanding", val: `${businessUnderstanding}%`, col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Customer Thinking", val: `${customerThinking}%`, col: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { label: "Professionalism", val: `${professionalism}%`, col: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
      ]
    };
  } else if (category.includes("finance")) {
    const analyticalThinking = getVal("analyticalThinking", 5);
    const domainKnowledge = getVal("technicalAccuracy", 2);
    const problemSolving = getVal("problemSolving", 4);
    const communication = getVal("communication", -2);
    const professionalism = getVal("professionalism", 6);
    const criticalThinking = getVal("criticalThinking", 3);

    return {
      radarData: [
        { subject: "Analytical Thinking", value: analyticalThinking },
        { subject: "Domain Knowledge", value: domainKnowledge },
        { subject: "Problem Solving", value: problemSolving },
        { subject: "Communication", value: communication },
        { subject: "Professionalism", value: professionalism },
        { subject: "Critical Thinking", value: criticalThinking }
      ],
      overviewCards: [
        { label: "Overall Score", val: `${score}%`, col: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
        { label: "Analytical Thinking", val: `${analyticalThinking}%`, col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Domain Knowledge", val: `${domainKnowledge}%`, col: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { label: "Problem Solving", val: `${problemSolving}%`, col: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
        { label: "Communication", val: `${communication}%`, col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Professionalism", val: `${professionalism}%`, col: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
      ]
    };
  } else {
    const communication = getVal("communication", 2);
    const professionalism = getVal("professionalism", 5);
    const problemSolving = getVal("problemSolving", 4);
    const domainKnowledge = getVal("technicalAccuracy", 1);
    const confidence = getVal("confidence", 3);
    const criticalThinking = getVal("criticalThinking", 2);

    return {
      radarData: [
        { subject: "Communication", value: communication },
        { subject: "Professionalism", value: professionalism },
        { subject: "Problem Solving", value: problemSolving },
        { subject: "Domain Knowledge", value: domainKnowledge },
        { subject: "Confidence", value: confidence },
        { subject: "Critical Thinking", value: criticalThinking }
      ],
      overviewCards: [
        { label: "Overall Score", val: `${score}%`, col: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
        { label: "Communication", val: `${communication}%`, col: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Professionalism", val: `${professionalism}%`, col: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
        { label: "Problem Solving", val: `${problemSolving}%`, col: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Domain Knowledge", val: `${domainKnowledge}%`, col: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { label: "Confidence", val: `${confidence}%`, col: "text-pink-400 bg-pink-500/10 border-pink-500/20" }
      ]
    };
  }
};

/**
 * Generate a PDF for a mock interview report
 * @param {object} activeReport - The report data
 * @param {object} user - The user object
 * @param {object} options - Options containing config object and autoSave flag
 * @returns {object} { doc, filename } jsPDF document instance and generated filename
 */
export const generateInterviewReportPDF = (activeReport, user, options = { autoSave: true, config: {} }) => {
  const config = options.config || {};
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });
  
  const candidateName = user?.name || user?.username || "Candidate";
  const companyName = activeReport.company || config.company || "N/A";
  const roleName = activeReport.role || config.jobRole || "N/A";
  const interviewType = activeReport.interviewType || activeReport.category || config.category || "Technical";
  const difficulty = activeReport.difficulty || config.difficulty || "Medium";
  const duration = activeReport.duration || config.duration || 30;
  
  const dateObj = activeReport.completedAt ? new Date(activeReport.completedAt) : new Date();
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  
  const dateStr = activeReport.completedAt 
    ? new Date(activeReport.completedAt).toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric"
      }) 
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    
  const overallScore = activeReport.report?.overallScore || activeReport.overallScore || activeReport.score || 70;
  const overallRating = activeReport.report?.readinessLevel || activeReport.readinessLevel || activeReport.recommendation || "Developing";

  // ----------------------------------------------------
  // COVER PAGE
  // ----------------------------------------------------
  doc.setFillColor(8, 14, 36); // #080E24 - dark premium theme
  doc.rect(0, 0, 595, 842, "F");

  doc.setFillColor(15, 23, 42); // main card container
  doc.rect(40, 40, 515, 762, "F");
  doc.setDrawColor(99, 102, 241, 0.3);
  doc.setLineWidth(1.5);
  doc.rect(40, 40, 515, 762, "D");

  // Logo branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241);
  doc.text("PREPSPHERE AI", 70, 100);

  // Cover Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("Mock Interview Report", 70, 180);

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(4);
  doc.line(70, 205, 170, 205);

  let metaY = 250;
  const drawMetaRow = (label, val) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(label, 70, metaY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(241, 245, 249); // slate-100
    doc.text(String(val), 220, metaY);
    metaY += 32;
  };

  drawMetaRow("Candidate Name", candidateName);
  drawMetaRow("Target Company", companyName);
  drawMetaRow("Target Role", roleName);
  drawMetaRow("Interview Type", interviewType);
  drawMetaRow("Difficulty Level", difficulty);
  drawMetaRow("Interview Date", dateStr);
  drawMetaRow("Duration Limit", `${duration} Minutes`);

  // Score Badge card
  metaY += 15;
  doc.setFillColor(24, 30, 56);
  doc.rect(70, metaY, 200, 90, "F");
  doc.setDrawColor(99, 102, 241, 0.5);
  doc.setLineWidth(1);
  doc.rect(70, metaY, 200, 90, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.text(`${overallScore}%`, 90, metaY + 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(241, 245, 249);
  doc.text("Overall Score", 90, metaY + 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Rating: ${overallRating}`, 90, metaY + 76);

  // Footer on cover
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("PrepSphere AI – Generated Automatically", 70, 750);
  doc.text(`Generation Date: ${formattedDate}`, 70, 765);

  doc.addPage();
  
  let currentY = 50;
  
  const checkPage = (neededSpace) => {
    if (currentY + neededSpace > 780) {
      doc.addPage();
      currentY = 50;
    }
  };

  const drawPageHeaders = () => {
    // Page Top Accent Line
    doc.setDrawColor(99, 102, 241); // indigo-500
    doc.setLineWidth(3);
    doc.line(40, 45, 555, 45);
    
    // Header branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241);
    doc.text("PREPSPHERE AI", 40, 60);
  };
  
  drawPageHeaders();
  currentY = 85;

  // ----------------------------------------------------
  // EXECUTIVE SUMMARY
  // ----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Executive Summary", 40, currentY);
  currentY += 20;

  // Overall Performance Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.rect(40, currentY, 515, 80, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("OVERALL PERFORMANCE", 55, currentY + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text(`${overallScore}%`, 55, currentY + 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(overallRating, 160, currentY + 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Questions Attempted: ${activeReport.totalQuestions || activeReport.report?.totalQuestions || 0}`, 160, currentY + 54);
  doc.text(`Completion Rate: 100%`, 350, currentY + 54);

  currentY += 80 + 20;

  // AI Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("AI Summary", 40, currentY);
  currentY += 15;

  const aiSummaryText = activeReport.report?.interviewSummary || activeReport.interviewSummary || activeReport.report?.overallFeedback || activeReport.overallFeedback || "No summary provided.";
  const aiSummaryLines = doc.splitTextToSize(aiSummaryText, 515);
  checkPage(aiSummaryLines.length * 13 + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(aiSummaryLines, 40, currentY);
  currentY += aiSummaryLines.length * 13 + 20;

  // Key Strengths
  checkPage(70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74); // green-600
  doc.text("Key Strengths", 40, currentY);
  currentY += 15;

  const strengths = activeReport.report?.strengths || activeReport.strengths || [];
  if (strengths.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("- No key strengths documented.", 50, currentY);
    currentY += 15;
  } else {
    strengths.forEach((str) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(`• ${str}`, 505);
      checkPage(lines.length * 13 + 5);
      doc.text(lines, 40, currentY);
      currentY += lines.length * 13 + 3;
    });
  }
  currentY += 15;

  // Major Improvement Areas
  checkPage(70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text("Major Improvement Areas", 40, currentY);
  currentY += 15;

  const weaknesses = activeReport.report?.weaknesses || activeReport.weaknesses || [];
  if (weaknesses.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("- No major improvement areas documented.", 50, currentY);
    currentY += 15;
  } else {
    weaknesses.forEach((weak) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(`• ${weak}`, 505);
      checkPage(lines.length * 13 + 5);
      doc.text(lines, 40, currentY);
      currentY += lines.length * 13 + 3;
    });
  }

  // ----------------------------------------------------
  // PERFORMANCE METRICS
  // ----------------------------------------------------
  doc.addPage();
  currentY = 60;
  drawPageHeaders();
  currentY = 85;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Performance Metrics", 40, currentY);
  currentY += 20;

  const getVal = (field, offset = 0) => {
    if (activeReport.report && activeReport.report[field + "Score"] !== undefined) {
      return activeReport.report[field + "Score"];
    }
    if (activeReport[field + "Score"] !== undefined) {
      return activeReport[field + "Score"];
    }
    if (activeReport[field] !== undefined && typeof activeReport[field] === 'number') {
      return activeReport[field];
    }
    return Math.round(Math.max(50, Math.min(100, overallScore + offset)));
  };

  const metrics = [
    { label: "Communication", value: getVal("communication", 2) },
    { label: "Technical Knowledge", value: getVal("technical", 1) },
    { label: "Problem Solving", value: getVal("problemSolving", 4) },
    { label: "Confidence", value: getVal("confidence", 3) },
    { label: "Clarity", value: getVal("clarity", -2) },
    { label: "Time Management", value: getVal("timeManagement", 2) }
  ];

  metrics.forEach((metric) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(metric.label, 40, currentY);
    
    doc.setFont("helvetica", "bold");
    doc.text(`${metric.value}%`, 555, currentY, { align: "right" });
    
    // Draw progress bar bg
    doc.setFillColor(241, 245, 249);
    doc.rect(40, currentY + 5, 515, 8, "F");
    
    // Progress fill
    doc.setFillColor(99, 102, 241);
    const fillWidth = (metric.value / 100) * 515;
    doc.rect(40, currentY + 5, fillWidth, 8, "F");
    
    currentY += 30;
  });

  currentY += 15;

  // ----------------------------------------------------
  // QUESTION-WISE EVALUATION CARDS
  // ----------------------------------------------------
  const conversationHistory = activeReport.conversationHistory || [];
  if (conversationHistory.length > 0) {
    checkPage(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Question-wise Evaluation", 40, currentY);
    currentY += 20;

    conversationHistory.forEach((q, idx) => {
      const qNum = q.questionNumber || (idx + 1);
      const questionText = q.question || "N/A";
      const answerText = q.userAnswer || "N/A";
      const idealText = q.evaluation?.idealAnswer || q.idealAnswer || "N/A";
      const scoreVal = q.evaluation?.score || q.score || 0;
      const timeVal = q.timeTaken || 0;

      const strengthsList = q.evaluation?.strengths || [];
      const weaknessesList = q.evaluation?.weaknesses || [];
      const suggestionsList = q.evaluation?.suggestions || [];

      const qLines = doc.splitTextToSize(`Question: ${questionText}`, 495);
      const aLines = doc.splitTextToSize(`Candidate Answer: ${answerText}`, 495);
      const iLines = doc.splitTextToSize(`Ideal Answer Reference: ${idealText}`, 495);

      let cardHeight = 45 + (qLines.length + aLines.length + iLines.length) * 12 + 10;
      
      if (strengthsList.length > 0) cardHeight += strengthsList.length * 12 + 12;
      if (weaknessesList.length > 0) cardHeight += weaknessesList.length * 12 + 12;
      if (suggestionsList.length > 0) cardHeight += suggestionsList.length * 12 + 12;

      checkPage(cardHeight + 20);
      drawPageHeaders();

      // Card Container Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(40, currentY, 515, cardHeight, "FD");

      // Card Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text(`Question ${qNum}`, 50, currentY + 18);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(`Score: ${scoreVal}%`, 495, currentY + 18, { align: "right" });
      doc.setTextColor(100, 116, 139);
      doc.text(`Time: ${timeVal}s`, 410, currentY + 18, { align: "right" });

      let lineY = currentY + 34;
      
      // Question
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(qLines, 50, lineY);
      lineY += qLines.length * 12 + 4;

      // Answer
      doc.setTextColor(71, 85, 105);
      doc.text(aLines, 50, lineY);
      lineY += aLines.length * 12 + 4;

      // Ideal Answer
      doc.setTextColor(71, 85, 105);
      doc.text(iLines, 50, lineY);
      lineY += iLines.length * 12 + 6;

      // Strengths
      if (strengthsList.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text("Strengths:", 50, lineY);
        lineY += 12;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        strengthsList.forEach(s => {
          doc.text(`• ${s}`, 60, lineY);
          lineY += 12;
        });
      }

      // Weaknesses
      if (weaknessesList.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("Weaknesses:", 50, lineY);
        lineY += 12;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        weaknessesList.forEach(w => {
          doc.text(`• ${w}`, 60, lineY);
          lineY += 12;
        });
      }

      // Suggestions
      if (suggestionsList.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        doc.text("Suggestions:", 50, lineY);
        lineY += 12;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        suggestionsList.forEach(s => {
          doc.text(`• ${s}`, 60, lineY);
          lineY += 12;
        });
      }

      currentY = currentY + cardHeight + 15;
    });
  }

  currentY += 15;

  // ----------------------------------------------------
  // AI COACH FEEDBACK
  // ----------------------------------------------------
  checkPage(100);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("AI Coach Feedback", 40, currentY);
  currentY += 20;

  const coachFeedback = activeReport.report?.overallFeedback || activeReport.overallFeedback || "N/A";
  const careerAdvice = activeReport.report?.careerAdvice || activeReport.careerAdvice || "N/A";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(79, 70, 229);
  doc.text("Overall Feedback Reference:", 40, currentY);
  currentY += 15;

  const coachFeedbackLines = doc.splitTextToSize(coachFeedback, 515);
  checkPage(coachFeedbackLines.length * 12 + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(coachFeedbackLines, 40, currentY);
  currentY += coachFeedbackLines.length * 12 + 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(79, 70, 229);
  doc.text("Career Development Advice:", 40, currentY);
  currentY += 15;

  const careerAdviceLines = doc.splitTextToSize(careerAdvice, 515);
  checkPage(careerAdviceLines.length * 12 + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(careerAdviceLines, 40, currentY);
  currentY += careerAdviceLines.length * 12 + 25;

  // ----------------------------------------------------
  // PERFORMANCE SUMMARY
  // ----------------------------------------------------
  checkPage(120);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Performance Summary", 40, currentY);
  currentY += 20;

  const questionScores = conversationHistory.map(q => q.evaluation?.score || q.score || 0);
  const highestQScore = questionScores.length > 0 ? Math.max(...questionScores) : 0;
  const lowestQScore = questionScores.length > 0 ? Math.min(...questionScores) : 0;
  const averageQScore = activeReport.report?.averageScore || activeReport.averageScore || 70;
  const totalQuestionsSolved = activeReport.totalQuestions || activeReport.report?.totalQuestions || 0;

  // Calculate completion duration
  const totalSeconds = conversationHistory.reduce((acc, q) => acc + (q.timeTaken || 0), 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const durationStr = totalSeconds > 0 ? `${mins} mins ${secs} secs` : "N/A";

  doc.setFillColor(248, 250, 252);
  doc.rect(40, currentY, 515, 60, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Average Score:", 55, currentY + 22);
  doc.text("Highest Question Score:", 55, currentY + 42);
  doc.text("Lowest Question Score:", 300, currentY + 22);
  doc.text("Questions Attempted:", 300, currentY + 42);
  doc.text("Interview Completion Time:", 55, currentY + 52); // fallback inline detail

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`${averageQScore}%`, 180, currentY + 22);
  doc.text(`${highestQScore}%`, 180, currentY + 42);
  doc.text(`${lowestQScore}%`, 450, currentY + 22);
  doc.text(String(totalQuestionsSolved), 450, currentY + 42);
  doc.text(durationStr, 200, currentY + 52);

  currentY += 75;

  // ----------------------------------------------------
  // RECOMMENDED LEARNING AREAS
  // ----------------------------------------------------
  checkPage(100);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Recommended Learning Areas", 40, currentY);
  currentY += 20;

  const recommendations = activeReport.report?.recommendations || activeReport.recommendations || [];
  if (recommendations.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    recommendations.forEach(rec => {
      const recLines = doc.splitTextToSize(`• ${rec}`, 505);
      checkPage(recLines.length * 12 + 5);
      doc.text(recLines, 40, currentY);
      currentY += recLines.length * 12 + 3;
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text("- No learning areas recommended from results.", 50, currentY);
    currentY += 15;
  }

  // ----------------------------------------------------
  // RUNNING HEADERS & FOOTERS (page 2 onwards)
  // ----------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Running Header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("PrepSphere AI – Mock Interview Report", 40, 25);
    
    // Running Footer
    doc.text(`Page ${i} of ${totalPages}`, 555, 820, { align: "right" });
    doc.text("Confidential – Prepared by PrepSphere AI Engine", 40, 820);
    doc.text(`Generation Date: ${formattedDate}`, 300, 820, { align: "center" });
    
    // Header & Footer lines
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.5);
    doc.line(40, 30, 555, 30);
    doc.line(40, 810, 555, 810);
  }
  
  const filename = `PrepSphere_Interview_Report_${formattedDate}.pdf`;
  
  if (options.autoSave) {
    doc.save(filename);
  }
  
  return { doc, filename };
};

/**
 * Generate a PDF Account Summary Report
 * @param {object} data - Consolidated user account data
 * @param {object} user - Authenticated user details
 * @param {object} options - Options containing autoSave flag
 * @returns {object} { doc, filename } jsPDF document instance and generated filename
 */
export const generateAccountSummaryPDF = async (data, user, options = { autoSave: true }) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const dateObj = new Date();
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  const filename = `PrepSphere_Account_Summary_${formattedDate}.pdf`;

  let currentY = 50;
  
  const checkPage = (neededSpace) => {
    if (currentY + neededSpace > 780) {
      doc.addPage();
      currentY = 50;
    }
  };

  const drawPageHeaders = () => {
    // Page Top Accent Line
    doc.setDrawColor(99, 102, 241); // indigo-500
    doc.setLineWidth(3);
    doc.line(40, 45, 555, 45);
    
    // Header branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241);
    doc.text("PREPSPHERE AI", 40, 60);
  };

  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // ----------------------------------------------------
  // COVER PAGE
  // ----------------------------------------------------
  doc.setFillColor(8, 14, 36); // #080E24 - dark premium theme
  doc.rect(0, 0, 595, 842, "F");

  doc.setFillColor(15, 23, 42); // main card container
  doc.rect(40, 40, 515, 762, "F");
  doc.setDrawColor(99, 102, 241, 0.3);
  doc.setLineWidth(1.5);
  doc.rect(40, 40, 515, 762, "D");

  // Logo branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241);
  doc.text("PREPSPHERE AI", 70, 100);

  // Cover Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("Account Summary", 70, 180);

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(4);
  doc.line(70, 205, 170, 205);

  const userName = data.profile?.name || user?.name || "User";
  const userEmail = data.profile?.email || user?.email || "N/A";

  // Render Profile Picture
  const avatarUrl = user?.profileImage || data.profile?.profileImage || "";
  let avatarLoaded = null;
  if (avatarUrl) {
    avatarLoaded = await loadImage(avatarUrl);
  }

  if (avatarLoaded) {
    try {
      doc.addImage(avatarLoaded, "JPEG", 70, 240, 90, 90);
    } catch (err) {
      console.warn("Failed to draw profile image onto PDF cover:", err.message);
      // Fallback avatar
      doc.setFillColor(99, 102, 241, 0.2);
      doc.rect(70, 240, 90, 90, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(99, 102, 241);
      doc.text(userName.charAt(0).toUpperCase(), 105, 295);
    }
  } else {
    // Fallback avatar with initials
    doc.setFillColor(99, 102, 241, 0.2);
    doc.rect(70, 240, 90, 90, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(99, 102, 241);
    doc.text(userName.charAt(0).toUpperCase(), 105, 295);
  }

  // Cover details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("User Name:", 70, 370);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text(userName, 180, 370);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Email Address:", 70, 400);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text(userEmail, 180, 400);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Generation Date:", 70, 430);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text(formattedDate, 180, 430);

  // Footer on cover
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("PrepSphere AI – Generated Automatically", 70, 750);
  doc.text(`Generation Date: ${formattedDate}`, 70, 765);

  doc.addPage();
  currentY = 60;
  drawPageHeaders();
  currentY = 85;

  // ----------------------------------------------------
  // SECTION 1: PROFILE INFORMATION
  // ----------------------------------------------------
  checkPage(150);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Section 1: Profile Information", 40, currentY);
  currentY += 15;

  // Profile Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.rect(40, currentY, 515, 110, "FD");

  const collegeName = data.profile?.college || "N/A";
  const degreeVal = data.profile?.degree || "N/A";
  const branchVal = data.profile?.branch || "N/A";
  const gradYearVal = data.profile?.graduationYear || "N/A";
  const bioVal = data.profile?.bio || "No biography provided.";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Full Name:", 55, currentY + 20);
  doc.text("College:", 55, currentY + 35);
  doc.text("Degree:", 55, currentY + 50);
  doc.text("Branch / Specialization:", 55, currentY + 65);
  doc.text("Graduation Year:", 55, currentY + 80);
  doc.text("Bio / About:", 55, currentY + 95);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(userName, 200, currentY + 20);
  doc.text(collegeName, 200, currentY + 35);
  doc.text(degreeVal, 200, currentY + 50);
  doc.text(branchVal, 200, currentY + 65);
  doc.text(String(gradYearVal), 200, currentY + 80);
  
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  const bioLines = doc.splitTextToSize(bioVal, 335);
  doc.text(bioLines, 200, currentY + 95);
  currentY += 110 + 25;

  // ----------------------------------------------------
  // SECTION 2: OVERALL STATISTICS
  // ----------------------------------------------------
  checkPage(160);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Section 2: Overall Statistics", 40, currentY);
  currentY += 15;

  // Draw Grid of Premium Stat Cards
  const stats = data.statistics || {};
  const cards = [
    { label: "Resume Analyses", val: String(stats.totalResumeAnalyses || 0) },
    { label: "Mock Interviews", val: String(stats.totalMockInterviews || 0) },
    { label: "Aptitude Tests", val: String(stats.totalAptitudeTests || 0) },
    { label: "Coding Solved", val: String(stats.totalCodingQuestionsSolved || 0) },
    { label: "Practice Streak", val: String(stats.practiceStreak || "0 Days") },
    { label: "Avg Interview Score", val: String(stats.averageInterviewScore || "0%") },
    { label: "Avg ATS Score", val: String(stats.averageAtsScore || "0%") }
  ];

  let gridX = 40;
  let gridY = currentY;
  cards.forEach((card, idx) => {
    if (idx > 0 && idx % 3 === 0) {
      gridX = 40;
      gridY += 60;
    }
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(gridX, gridY, 160, 50, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, gridX + 10, gridY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(99, 102, 241); // indigo
    doc.text(card.val, gridX + 10, gridY + 38);

    gridX += 175;
  });

  currentY = gridY + 50 + 25;

  // Helper to extract numbers from score strings like "85%"
  const getNumVal = (val) => {
    if (!val) return 0;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // ----------------------------------------------------
  // SECTION 3: RESUME ANALYSIS SUMMARY
  // ----------------------------------------------------
  checkPage(120);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Section 3: Resume Analysis Summary", 40, currentY);
  currentY += 15;

  const resumesList = data.resumeHistory || [];
  const totalResumes = resumesList.length;
  const highestAts = totalResumes > 0 ? Math.max(...resumesList.map(r => getNumVal(r.atsScore))) : 0;
  const latestAts = totalResumes > 0 ? resumesList[resumesList.length - 1].atsScore : "N/A";
  const latestAtsDate = totalResumes > 0 ? resumesList[resumesList.length - 1].analysisDate : "N/A";

  doc.setFillColor(248, 250, 252);
  doc.rect(40, currentY, 515, 60, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Total Analyses:", 55, currentY + 22);
  doc.text("Highest ATS Score:", 55, currentY + 42);
  doc.text("Latest ATS Score:", 300, currentY + 22);
  doc.text("Latest Analysis Date:", 300, currentY + 42);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(String(totalResumes), 170, currentY + 22);
  doc.text(`${highestAts}%`, 170, currentY + 42);
  doc.text(String(latestAts), 430, currentY + 22);
  doc.text(String(latestAtsDate), 430, currentY + 42);

  currentY += 60 + 25;

  // ----------------------------------------------------
  // SECTION 4: MOCK INTERVIEW SUMMARY
  // ----------------------------------------------------
  checkPage(140);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Section 4: Mock Interview Summary", 40, currentY);
  currentY += 15;

  const interviewsList = data.interviewHistory || [];
  const totalInterviews = interviewsList.length;
  const highestInterview = totalInterviews > 0 ? Math.max(...interviewsList.map(i => getNumVal(i.overallScore))) : 0;
  const avgInterview = stats.averageInterviewScore || "N/A";
  const latestInterviewDate = totalInterviews > 0 ? interviewsList[interviewsList.length - 1].interviewDate : "N/A";

  // Calculate favorite interview type
  const typeCounts = {};
  interviewsList.forEach(i => {
    typeCounts[i.interviewType] = (typeCounts[i.interviewType] || 0) + 1;
  });
  let favType = "N/A";
  let maxCount = 0;
  Object.keys(typeCounts).forEach(type => {
    if (typeCounts[type] > maxCount) {
      maxCount = typeCounts[type];
      favType = type;
    }
  });

  doc.setFillColor(248, 250, 252);
  doc.rect(40, currentY, 515, 75, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Total Interviews:", 55, currentY + 22);
  doc.text("Highest Interview Score:", 55, currentY + 42);
  doc.text("Average Interview Score:", 55, currentY + 62);
  doc.text("Latest Interview Date:", 300, currentY + 22);
  doc.text("Favorite Interview Type:", 300, currentY + 42);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(String(totalInterviews), 200, currentY + 22);
  doc.text(`${highestInterview}%`, 200, currentY + 42);
  doc.text(String(avgInterview), 200, currentY + 62);
  doc.text(String(latestInterviewDate), 450, currentY + 22);
  doc.text(String(favType), 450, currentY + 42);

  currentY += 75 + 25;

  // ----------------------------------------------------
  // SECTION 5: APTITUDE PRACTICE SUMMARY
  // ----------------------------------------------------
  checkPage(120);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Section 5: Aptitude Practice Summary", 40, currentY);
  currentY += 15;

  const aptitudeList = data.aptitudeHistory || [];
  const testsAttempted = aptitudeList.length;
  const highestAptScore = testsAttempted > 0 ? Math.max(...aptitudeList.map(a => getNumVal(a.score))) : 0;
  const avgAccuracy = testsAttempted > 0 
    ? Math.round(aptitudeList.reduce((acc, a) => acc + getNumVal(a.accuracy), 0) / testsAttempted) 
    : 0;
  const questionsSolved = testsAttempted > 0 
    ? aptitudeList.reduce((acc, a) => acc + (a.questionsAttempted || 0), 0) 
    : 0;

  doc.setFillColor(248, 250, 252);
  doc.rect(40, currentY, 515, 60, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Tests Attempted:", 55, currentY + 22);
  doc.text("Highest Score:", 55, currentY + 42);
  doc.text("Average Accuracy:", 300, currentY + 22);
  doc.text("Total Questions Solved:", 300, currentY + 42);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(String(testsAttempted), 170, currentY + 22);
  doc.text(`${highestAptScore}%`, 170, currentY + 42);
  doc.text(`${avgAccuracy}%`, 450, currentY + 22);
  doc.text(String(questionsSolved), 450, currentY + 42);

  currentY += 60 + 25;

  // ----------------------------------------------------
  // SECTION 6: CODING JOURNEY SUMMARY
  // ----------------------------------------------------
  checkPage(120);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Section 6: Coding Journey Summary", 40, currentY);
  currentY += 15;

  const coding = data.codingJourney || {};
  doc.setFillColor(248, 250, 252);
  doc.rect(40, currentY, 515, 60, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Questions Solved:", 55, currentY + 22);
  doc.text("Easy / Medium / Hard:", 55, currentY + 42);
  doc.text("Current Streak:", 300, currentY + 22);
  doc.text("Last Practice Date:", 300, currentY + 42);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(String(coding.totalQuestionsSolved || 0), 170, currentY + 22);
  doc.text(`${coding.easy || 0} / ${coding.medium || 0} / ${coding.hard || 0}`, 170, currentY + 42);
  doc.text(String(coding.currentStreak || "0 Days"), 430, currentY + 22);
  doc.text(String(coding.lastActivity || "N/A"), 430, currentY + 42);

  currentY += 60 + 25;

  // ----------------------------------------------------
  // SECTION 7: RECENT ACTIVITY
  // ----------------------------------------------------
  checkPage(140);
  drawPageHeaders();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Section 7: Recent Activity", 40, currentY);
  currentY += 15;

  const activities = [];
  if (resumesList.length > 0) {
    const r = resumesList[resumesList.length - 1];
    activities.push(`Resume Analysed: ${r.resumeName} (ATS Score: ${r.atsScore}) on ${r.analysisDate}`);
  }
  if (interviewsList.length > 0) {
    const i = interviewsList[interviewsList.length - 1];
    activities.push(`Mock Interview Completed: ${i.role} at ${i.company} (Score: ${i.overallScore}) on ${i.interviewDate}`);
  }
  if (aptitudeList.length > 0) {
    const a = aptitudeList[aptitudeList.length - 1];
    activities.push(`Aptitude Quiz Attempted: ${a.quizTopic} (Score: ${a.score}) on ${a.completionDate}`);
  }
  if (coding.lastActivity) {
    activities.push(`Coding Problem Solved on LeetCode on ${coding.lastActivity}`);
  }

  if (activities.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text("- No recent activities recorded.", 50, currentY);
    currentY += 20;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    activities.forEach(act => {
      const actLines = doc.splitTextToSize(`• ${act}`, 490);
      checkPage(actLines.length * 12 + 5);
      doc.text(actLines, 40, currentY);
      currentY += actLines.length * 12 + 4;
    });
  }

  // ----------------------------------------------------
  // RUNNING HEADERS & FOOTERS (skip cover page)
  // ----------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("PrepSphere AI – Account Summary Report", 40, 25);

    // Running Footer
    doc.text(`Page ${i} of ${totalPages}`, 555, 820, { align: "right" });
    doc.text("PrepSphere AI – Generated Automatically", 40, 820);
    doc.text(`Generation Date: ${formattedDate}`, 300, 820, { align: "center" });

    // Lines
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.5);
    doc.line(40, 30, 555, 30);
    doc.line(40, 810, 555, 810);
  }

  if (options.autoSave) {
    doc.save(filename);
  }

  return { doc, filename };
};
