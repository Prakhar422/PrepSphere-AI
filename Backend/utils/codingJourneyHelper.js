import { formatLocalDate } from './streakUtility.js';

/**
 * Calculates current streak and longest streak of unique calendar submission days.
 * 10 submissions on one day count as 1 streak day.
 */
export const calculateCodingStreaks = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique local dates in YYYY-MM-DD format
  const uniqueDates = Array.from(new Set(
    submissions.map(s => {
      const date = new Date(s.submittedAt || s.createdAt);
      return formatLocalDate(date);
    })
  )).sort((a, b) => a.localeCompare(b));

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    lastDate = currentDate;
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  // Calculate current streak
  const todayStr = formatLocalDate(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  let currentStreak = 0;
  let streakActive = false;
  let checkDate = new Date();

  if (uniqueDates.includes(todayStr)) {
    streakActive = true;
    checkDate = new Date(todayStr);
  } else if (uniqueDates.includes(yesterdayStr)) {
    streakActive = true;
    checkDate = new Date(yesterdayStr);
  }

  if (streakActive) {
    currentStreak = 1;
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = formatLocalDate(checkDate);
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

/**
 * Generates activity log messages matching exact prompt requirements:
 * - "Solved Two Sum"
 * - "Generated Google Hard Graph Question"
 * - "Bookmarked Microsoft Graph Question"
 * - "Submitted Amazon Medium DP Question"
 * - "Improved score on Google Array Question"
 * - "Started practicing Dynamic Programming"
 */
export const generateActivities = (questions, submissions, userId) => {
  const activities = [];

  // Group submissions by question to find score improvements
  const subsByQuestion = {};
  submissions.forEach(sub => {
    const qId = sub.question?._id?.toString() || sub.question?.toString();
    if (qId) {
      if (!subsByQuestion[qId]) subsByQuestion[qId] = [];
      subsByQuestion[qId].push(sub);
    }
  });

  // Sort each question's submissions chronologically ascending
  Object.keys(subsByQuestion).forEach(qId => {
    subsByQuestion[qId].sort((a, b) => new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt));
  });

  // Keep track of first time topics are touched to generate "Started practicing Topic"
  const topicFirstTouch = {};

  const registerTouch = (topic, timestamp) => {
    if (!topic) return;
    const time = new Date(timestamp).getTime();
    if (!topicFirstTouch[topic] || time < topicFirstTouch[topic]) {
      topicFirstTouch[topic] = time;
    }
  };

  // 1. Process submissions
  submissions.forEach(sub => {
    const q = sub.question;
    if (!q) return;

    const qId = q._id?.toString();
    const timestamp = sub.submittedAt || sub.createdAt;
    registerTouch(q.topic, timestamp);

    // Check if this submission is a score improvement
    const qSubs = subsByQuestion[qId] || [];
    const subIndex = qSubs.findIndex(s => s._id?.toString() === sub._id?.toString());
    
    let isImprovement = false;
    if (subIndex > 0) {
      const maxPrevScore = Math.max(...qSubs.slice(0, subIndex).map(s => s.score || 0));
      if ((sub.score || 0) > maxPrevScore) {
        isImprovement = true;
      }
    }

    if (sub.status === 'passed') {
      activities.push({
        text: `Solved ${q.title}`,
        timestamp,
        type: 'solved',
        icon: 'Code2',
        color: 'text-emerald-400 bg-emerald-500/10'
      });
    } else if (isImprovement) {
      activities.push({
        text: `Improved score on ${q.company} ${q.topic} Question`,
        timestamp,
        type: 'improvement',
        icon: 'Sparkles',
        color: 'text-indigo-400 bg-indigo-500/10'
      });
    } else {
      activities.push({
        text: `Submitted ${q.company} ${q.difficulty} ${q.topic} Question`,
        timestamp,
        type: 'submitted',
        icon: 'Code',
        color: 'text-amber-400 bg-amber-500/10'
      });
    }
  });

  // 2. Process generated questions
  questions.forEach(q => {
    const timestamp = q.createdAt;
    registerTouch(q.topic, timestamp);

    // If generated by user
    if (q.user?.toString() === userId.toString()) {
      activities.push({
        text: `Generated ${q.company} ${q.difficulty} ${q.topic} Question`,
        timestamp,
        type: 'generated',
        icon: 'PlusCircle',
        color: 'text-blue-400 bg-blue-500/10'
      });
    }

    // If bookmarked by user
    const bookmarkedByStrs = (q.bookmarkedBy || []).map(id => id.toString());
    if (bookmarkedByStrs.includes(userId.toString())) {
      activities.push({
        text: `Bookmarked ${q.company} ${q.topic} Question`,
        timestamp: q.updatedAt || q.createdAt,
        type: 'bookmarked',
        icon: 'Bookmark',
        color: 'text-pink-400 bg-pink-500/10'
      });
    }
  });

  // 3. Process "Started practicing {topic}"
  Object.keys(topicFirstTouch).forEach(topic => {
    activities.push({
      text: `Started practicing ${topic}`,
      timestamp: new Date(topicFirstTouch[topic]),
      type: 'started',
      icon: 'Activity',
      color: 'text-purple-400 bg-purple-500/10'
    });
  });

  // Sort all activities chronologically descending
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
