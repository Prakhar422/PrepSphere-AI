import InterviewSession from '../models/InterviewSession.js';

/**
 * Helper to convert a Date to a local date string (YYYY-MM-DD) based on timezone
 */
export const formatLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  const localTime = new Date(date.getTime() - offset * 60 * 1000);
  return localTime.toISOString().split('T')[0];
};

/**
 * Helper to compute active streak from completed dates (YYYY-MM-DD sorted descending)
 */
export const getStreakCount = (completedDates) => {
  const uniqueDates = Array.from(new Set(completedDates));
  if (uniqueDates.length === 0) return 0;

  const todayStr = formatLocalDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  let currentCheckDate = new Date();
  let streak = 0;

  if (uniqueDates.includes(todayStr)) {
    streak = 1;
  } else if (uniqueDates.includes(yesterdayStr)) {
    streak = 1;
    currentCheckDate = yesterday;
  } else {
    return 0;
  }

  while (true) {
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    const dateStr = formatLocalDate(currentCheckDate);
    if (uniqueDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Calculates the current interview streak for a user.
 * Can take either a userId or a pre-fetched array of completed sessions to avoid redundant database calls.
 * 
 * @param {string|Array} userIdOrSessions - MongoDB User ID or pre-fetched completed session documents
 * @returns {Promise<number>} Current consecutive active days count
 */
export const calculateInterviewStreak = async (userIdOrSessions) => {
  let sessions;
  if (Array.isArray(userIdOrSessions)) {
    sessions = userIdOrSessions;
  } else {
    sessions = await InterviewSession.find(
      { user: userIdOrSessions, status: 'COMPLETED' },
      { completedAt: 1, status: 1 }
    );
  }

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED' && s.completedAt);
  const dateStrings = completedSessions
    .map(s => formatLocalDate(new Date(s.completedAt)))
    .sort((a, b) => b.localeCompare(a)); // Descending order
    
  return getStreakCount(dateStrings);
};
