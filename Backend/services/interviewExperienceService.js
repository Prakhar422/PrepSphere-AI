import InterviewExperience from '../models/InterviewExperience.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

/**
 * Escapes regex special characters to prevent regex injection attacks.
 * @param {string} string - Input query string
 * @returns {string} Escaped string
 */
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Create a new interview experience
 * @param {string} userId - ID of the creating user
 * @param {object} experienceData - Input experience details
 * @returns {Promise<object>} Saved experience document
 */
export const createExperience = async (userId, experienceData) => {
  const { college, ...restData } = experienceData; // exclude college from saving to schema
  const experience = new InterviewExperience({
    ...restData,
    author: userId,
  });
  await experience.save();
  return experience;
};

/**
 * Fetch interview experiences with searching, filtering, sorting, and pagination
 * @param {object} query - Query parameters from request
 * @returns {Promise<object>} Paginated experiences and count metadata
 */
export const getAllExperiences = async (query, userId) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    company = '',
    role = '',
    difficulty = '',
    interviewType = '',
    minPackage = '',
    maxPackage = '',
    graduationYear = '',
    result = '',
    sortBy = 'newest',
    tag = ''
  } = query;

  const filter = {};

  // Filters
  if (company) {
    filter.company = { $regex: new RegExp(`^${escapeRegex(company.trim())}$`, 'i') };
  }
  if (role) {
    filter.role = { $regex: new RegExp(`^${escapeRegex(role.trim())}$`, 'i') };
  }
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  if (interviewType) {
    filter.interviewType = interviewType;
  }
  if (graduationYear) {
    filter.graduationYear = Number(graduationYear);
  }
  if (result) {
    filter.result = result;
  }
  if (minPackage || maxPackage) {
    filter.package = {};
    if (minPackage) filter.package.$gte = Number(minPackage);
    if (maxPackage) filter.package.$lte = Number(maxPackage);
  }
  if (tag) {
    filter.tags = { $regex: new RegExp(`^${escapeRegex(tag.trim())}$`, 'i') };
  }

  // Keyword Search
  if (search) {
    const escapedSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(escapedSearch, 'i');
    filter.$or = [
      { company: searchRegex },
      { role: searchRegex },
      { overallExperience: searchRegex },
      { preparationTips: searchRegex }
    ];
  }

  // Sorting
  let sort = { createdAt: -1 };
  if (sortBy === 'oldest') {
    sort = { createdAt: 1 };
  } else if (sortBy === 'highestPackage') {
    sort = { package: -1, createdAt: -1 };
  } else if (sortBy === 'lowestPackage') {
    sort = { package: 1, createdAt: -1 };
  }

  // Pagination details
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skipNum = (pageNum - 1) * limitNum;

  const totalResults = await InterviewExperience.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limitNum);

  const experiences = await InterviewExperience.find(filter)
    .populate('author', 'name profileImage college')
    .sort(sort)
    .skip(skipNum)
    .limit(limitNum)
    .lean();

  if (userId && experiences.length > 0) {
    const expIds = experiences.map(e => e._id);
    const userLikes = await Like.find({ user: userId, experience: { $in: expIds } }).lean();
    const userBookmarks = await Bookmark.find({ user: userId, experience: { $in: expIds } }).lean();
    const likedSet = new Set(userLikes.map(l => l.experience.toString()));
    const bookmarkedSet = new Set(userBookmarks.map(b => b.experience.toString()));

    experiences.forEach(e => {
      e.isLiked = likedSet.has(e._id.toString());
      e.isBookmarked = bookmarkedSet.has(e._id.toString());
    });
  }

  return {
    experiences,
    currentPage: pageNum,
    totalPages,
    totalResults
  };
};

/**
 * Fetch a single interview experience by ID
 * @param {string} id - Experience ObjectId string
 * @returns {Promise<object>} Experience document populated with user details
 */
export const getExperienceById = async (id, userId) => {
  const experience = await InterviewExperience.findById(id).populate('author', 'name profileImage college').lean();
  if (!experience) {
    const error = new Error('Interview experience not found');
    error.status = 404;
    throw error;
  }
  if (userId) {
    const isLiked = await Like.exists({ user: userId, experience: id });
    const isBookmarked = await Bookmark.exists({ user: userId, experience: id });
    experience.isLiked = !!isLiked;
    experience.isBookmarked = !!isBookmarked;
  }
  return experience;
};

/**
 * Update an existing interview experience
 * @param {string} id - Experience ObjectId string
 * @param {string} userId - Authenticated user ID (for owner verification)
 * @param {object} updateData - Modified fields
 * @returns {Promise<object>} Saved updated experience document
 */
export const updateExperience = async (id, userId, updateData) => {
  const experience = await InterviewExperience.findById(id);
  if (!experience) {
    const error = new Error('Interview experience not found');
    error.status = 404;
    throw error;
  }

  if (experience.author.toString() !== userId.toString()) {
    const error = new Error('Not authorized to update this experience');
    error.status = 403;
    throw error;
  }

  // Update only supported fields (prevent modifying user, id, or timestamps directly)
  const updatableFields = [
    'company',
    'role',
    'interviewType',
    'package',
    'graduationYear',
    'difficulty',
    'onlineAssessment',
    'technicalRound1',
    'technicalRound2',
    'technicalRound3',
    'hrRound',
    'preparationTips',
    'overallExperience',
    'result',
    'tags'
  ];

  updatableFields.forEach(field => {
    if (updateData[field] !== undefined) {
      experience[field] = updateData[field];
    }
  });

  await experience.save();
  return experience;
};

/**
 * Delete an interview experience
 * @param {string} id - Experience ObjectId string
 * @param {string} userId - Authenticated user ID (for owner verification)
 * @returns {Promise<object>} Success status
 */
export const deleteExperience = async (id, userId) => {
  const experience = await InterviewExperience.findById(id);
  if (!experience) {
    const error = new Error('Interview experience not found');
    error.status = 404;
    throw error;
  }

  if (experience.author.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this experience');
    error.status = 403;
    throw error;
  }

  await InterviewExperience.findByIdAndDelete(id);
  // Clean up associated interactions in parallel
  await Promise.all([
    Like.deleteMany({ experience: id }),
    Bookmark.deleteMany({ experience: id }),
    Comment.deleteMany({ experience: id }),
    Report.deleteMany({ experience: id })
  ]);
  return { success: true };
};

/**
 * Fetch dynamic community statistics from MongoDB
 * @returns {Promise<object>} Integrated statistics
 */
export const getCommunityStats = async () => {
  const totalExperiences = await InterviewExperience.countDocuments({});

  const distinctCompanies = await InterviewExperience.distinct('company');
  const totalCompanies = distinctCompanies.length;

  const distinctUsers = await InterviewExperience.distinct('author');
  const totalContributors = distinctUsers.length;

  const packageAgg = await InterviewExperience.aggregate([
    { $group: { _id: null, avgPkg: { $avg: '$package' } } }
  ]);
  const averagePackage = packageAgg.length > 0 && packageAgg[0].avgPkg ? Math.round(packageAgg[0].avgPkg) : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyPosts = await InterviewExperience.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  return {
    totalExperiences,
    totalCompanies,
    totalContributors,
    averagePackage,
    monthlyPosts
  };
};

/**
 * Fetch top featured companies dynamically sorted by experience counts
 * @returns {Promise<Array>} List of companies with package and difficulty metrics
 */
export const getFeaturedCompanies = async () => {
  const results = await InterviewExperience.aggregate([
    {
      $group: {
        _id: '$company',
        count: { $sum: 1 },
        avgPackage: { $avg: '$package' },
        difficulties: { $push: '$difficulty' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const logoColors = [
    'bg-red-500/10 border-red-500/20 text-red-400',
    'bg-blue-500/10 border-blue-500/20 text-blue-400',
    'bg-orange-500/10 border-orange-500/20 text-orange-400',
    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    'bg-pink-500/10 border-pink-500/20 text-pink-400'
  ];

  return results.map((item, index) => {
    const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
    item.difficulties.forEach(d => {
      if (diffCounts[d] !== undefined) diffCounts[d]++;
    });
    let predominant = 'Medium';
    if (diffCounts.Easy > diffCounts.Medium && diffCounts.Easy > diffCounts.Hard) predominant = 'Easy';
    if (diffCounts.Hard > diffCounts.Medium && diffCounts.Hard > diffCounts.Easy) predominant = 'Hard';

    return {
      name: item._id,
      logoColor: logoColors[index % logoColors.length],
      count: `${item.count} Experience${item.count > 1 ? 's' : ''}`,
      difficulty: predominant,
      package: item.avgPackage ? `${Math.round(item.avgPackage)} LPA` : 'N/A'
    };
  });
};

/**
 * Fetch trending companies based on recent experience count
 * @returns {Promise<Array>} List of company names
 */
export const getTrendingCompanies = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const results = await InterviewExperience.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: '$company',
        recentCount: { $sum: 1 }
      }
    },
    { $sort: { recentCount: -1 } },
    { $limit: 5 }
  ]);

  if (results.length < 5) {
    const overall = await InterviewExperience.aggregate([
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    return overall.map(item => item._id);
  }

  return results.map(item => item._id);
};

/**
 * Fetch all interview experiences created by a specific user
 * @param {string} userId - ID of the creating user
 * @returns {Promise<Array>} List of experience documents
 */
export const getMyExperiences = async (userId) => {
  return await InterviewExperience.find({ author: userId })
    .populate('author', 'name profileImage college')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Fetch similar interview experiences by company or role
 * @param {string} id - Current experience ID to compare against
 * @param {string} userId - Authenticated user ID (optional)
 * @returns {Promise<Array>} List of similar experiences (up to 5)
 */
export const getSimilarExperiences = async (id, userId) => {
  const current = await InterviewExperience.findById(id);
  if (!current) {
    const error = new Error('Interview experience not found');
    error.status = 404;
    throw error;
  }

  // Find experiences with same company or role, excluding the current one
  const experiences = await InterviewExperience.find({
    _id: { $ne: current._id },
    $or: [
      { company: { $regex: new RegExp(`^${escapeRegex(current.company.trim())}$`, 'i') } },
      { role: { $regex: new RegExp(`^${escapeRegex(current.role.trim())}$`, 'i') } }
    ]
  })
  .populate('author', 'name profileImage college')
  .limit(5)
  .lean();

  if (userId && experiences.length > 0) {
    const expIds = experiences.map(e => e._id);
    const userLikes = await Like.find({ user: userId, experience: { $in: expIds } }).lean();
    const userBookmarks = await Bookmark.find({ user: userId, experience: { $in: expIds } }).lean();
    const likedSet = new Set(userLikes.map(l => l.experience.toString()));
    const bookmarkedSet = new Set(userBookmarks.map(b => b.experience.toString()));

    experiences.forEach(e => {
      e.isLiked = likedSet.has(e._id.toString());
      e.isBookmarked = bookmarkedSet.has(e._id.toString());
    });
  }

  return experiences;
};

/**
 * Toggle Like/Unlike on an experience
 * @param {string} experienceId 
 * @param {string} userId 
 * @returns {Promise<object>} { liked: boolean, likes: number }
 */
export const likeExperience = async (experienceId, userId) => {
  const exp = await InterviewExperience.findById(experienceId);
  if (!exp) {
    const err = new Error('Interview experience not found');
    err.status = 404;
    throw err;
  }

  const existingLike = await Like.findOne({ user: userId, experience: experienceId });
  let liked = false;

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    exp.likes = Math.max(0, (exp.likes || 0) - 1);
    liked = false;
  } else {
    const newLike = new Like({ user: userId, experience: experienceId });
    await newLike.save();
    exp.likes = (exp.likes || 0) + 1;
    liked = true;
  }

  await exp.save();
  return { liked, likes: exp.likes };
};

/**
 * Toggle Bookmark/Remove Bookmark on an experience
 * @param {string} experienceId 
 * @param {string} userId 
 * @returns {Promise<object>} { bookmarked: boolean }
 */
export const bookmarkExperience = async (experienceId, userId) => {
  const exp = await InterviewExperience.findById(experienceId);
  if (!exp) {
    const err = new Error('Interview experience not found');
    err.status = 404;
    throw err;
  }

  const existingBookmark = await Bookmark.findOne({ user: userId, experience: experienceId });
  let bookmarked = false;

  if (existingBookmark) {
    await Bookmark.findByIdAndDelete(existingBookmark._id);
    bookmarked = false;
  } else {
    const newBookmark = new Bookmark({ user: userId, experience: experienceId });
    await newBookmark.save();
    bookmarked = true;
  }

  return { bookmarked };
};

/**
 * Get all bookmarked experiences for a user
 * @param {string} userId 
 * @returns {Promise<Array>} List of experience documents
 */
export const getBookmarks = async (userId) => {
  const bookmarks = await Bookmark.find({ user: userId }).populate({
    path: 'experience',
    populate: { path: 'author', select: 'name profileImage college' }
  }).lean();

  // Filter out any null experiences (e.g. if the experience was deleted)
  const experiences = bookmarks
    .map(b => b.experience)
    .filter(Boolean);

  // Since the user bookmarked them, mark them as isBookmarked: true
  // Also check if liked by user
  if (experiences.length > 0) {
    const expIds = experiences.map(e => e._id);
    const userLikes = await Like.find({ user: userId, experience: { $in: expIds } }).lean();
    const likedSet = new Set(userLikes.map(l => l.experience.toString()));

    experiences.forEach(e => {
      e.isBookmarked = true;
      e.isLiked = likedSet.has(e._id.toString());
    });
  }

  return experiences;
};

/**
 * Submit a report on an experience
 * @param {string} experienceId 
 * @param {string} userId 
 * @param {object} reportData 
 * @returns {Promise<object>} Saved report document
 */
export const reportExperience = async (experienceId, userId, reportData) => {
  const exp = await InterviewExperience.findById(experienceId);
  if (!exp) {
    const err = new Error('Interview experience not found');
    err.status = 404;
    throw err;
  }

  const existingReport = await Report.findOne({ user: userId, experience: experienceId });
  if (existingReport) {
    const err = new Error('You have already reported this experience');
    err.status = 400;
    throw err;
  }

  const report = new Report({
    user: userId,
    experience: experienceId,
    reason: reportData.reason,
    description: reportData.description || '',
  });

  await report.save();
  return report;
};

/**
 * Increment view count for an experience (preventing artificial session inflation)
 * @param {string} experienceId 
 * @returns {Promise<number>} Updated views count
 */
export const incrementViews = async (experienceId) => {
  const exp = await InterviewExperience.findById(experienceId);
  if (!exp) {
    const err = new Error('Interview experience not found');
    err.status = 404;
    throw err;
  }

  exp.views = (exp.views || 0) + 1;
  await exp.save();
  return exp.views;
};

/**
 * Get comments for an experience
 * @param {string} experienceId 
 * @returns {Promise<Array>} List of comments
 */
export const getComments = async (experienceId) => {
  return await Comment.find({ experience: experienceId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: 1 })
    .lean();
};

/**
 * Add a comment to an experience
 * @param {string} experienceId 
 * @param {string} userId 
 * @param {string} content 
 * @returns {Promise<object>} Created comment
 */
export const addComment = async (experienceId, userId, content) => {
  const exp = await InterviewExperience.findById(experienceId);
  if (!exp) {
    const err = new Error('Interview experience not found');
    err.status = 404;
    throw err;
  }

  const comment = new Comment({
    user: userId,
    experience: experienceId,
    content,
  });

  await comment.save();

  // Increment commentsCount
  exp.commentsCount = (exp.commentsCount || 0) + 1;
  await exp.save();

  // Populate user info for immediate display
  await comment.populate('user', 'name profileImage');
  return comment;
};

/**
 * Delete a comment by ID (must be the owner)
 * @param {string} commentId 
 * @param {string} userId 
 * @returns {Promise<object>} Success status
 */
export const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error('Comment not found');
    err.status = 404;
    throw err;
  }

  if (comment.user.toString() !== userId.toString()) {
    const err = new Error('Not authorized to delete this comment');
    err.status = 403;
    throw err;
  }

  const experienceId = comment.experience;
  await Comment.findByIdAndDelete(commentId);

  // Decrement commentsCount
  await InterviewExperience.findByIdAndUpdate(experienceId, {
    $inc: { commentsCount: -1 }
  });

  return { success: true };
};

/**
 * Fetch unique company names dynamically from database for searchable autocompletes
 * @param {string} search - Search keyword
 * @returns {Promise<Array>} List of unique company names
 */
export const getUniqueCompanies = async (search) => {
  const filter = {};
  if (search) {
    filter.company = { $regex: new RegExp(escapeRegex(search.trim()), 'i') };
  }
  
  const pipeline = [
    { $match: filter },
    { $group: { _id: "$company" } },
    { $sort: { _id: 1 } }
  ];
  if (search) {
    pipeline.push({ $limit: 15 });
  }
  
  const results = await InterviewExperience.aggregate(pipeline);
  return results.map(r => r._id);
};

/**
 * Fetch unique role titles dynamically from database for searchable autocompletes
 * @param {string} search - Search keyword
 * @returns {Promise<Array>} List of unique roles
 */
export const getUniqueRoles = async (search) => {
  const filter = {};
  if (search) {
    filter.role = { $regex: new RegExp(escapeRegex(search.trim()), 'i') };
  }
  
  const pipeline = [
    { $match: filter },
    { $group: { _id: "$role" } },
    { $sort: { _id: 1 } }
  ];
  if (search) {
    pipeline.push({ $limit: 15 });
  }
  
  const results = await InterviewExperience.aggregate(pipeline);
  return results.map(r => r._id);
};

/**
 * Dynamically calculate and return the top contributors (up to 10)
 * @returns {Promise<Array>} List of dynamic contributors
 */
export const getTopContributors = async () => {
  const results = await InterviewExperience.aggregate([
    {
      $group: {
        _id: "$author",
        experiencesCount: { $sum: 1 },
        totalLikes: { $sum: "$likes" },
        totalComments: { $sum: "$commentsCount" }
      }
    },
    {
      $sort: { experiencesCount: -1, totalLikes: -1, totalComments: -1 }
    },
    { $limit: 10 }
  ]);

  const populated = [];
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    if (!item._id) continue;
    const userDoc = await User.findById(item._id).select('name profileImage college');
    if (userDoc) {
      let badge = 'Top Contributor';
      if (i === 0) badge = 'Gold';
      else if (i === 1) badge = 'Silver';
      else if (i === 2) badge = 'Bronze';

      populated.push({
        name: userDoc.name,
        profileImage: userDoc.profileImage || '',
        college: userDoc.college || '',
        shared: item.experiencesCount,
        votes: item.totalLikes,
        badge,
        avatarBg: i === 0 ? "bg-yellow-500/10 text-yellow-400" :
                  i === 1 ? "bg-slate-400/10 text-slate-300" :
                  i === 2 ? "bg-amber-600/10 text-amber-500" : "bg-pink-500/10 text-pink-400"
      });
    }
  }
  return populated;
};

/**
 * Dynamic popular tags sorted by occurrences count
 * @returns {Promise<Array>} List of tags
 */
export const getPopularTags = async () => {
  const results = await InterviewExperience.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  return results.map(r => r._id);
};
