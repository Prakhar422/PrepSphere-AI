import InterviewExperience from '../models/InterviewExperience.js';

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
  const experience = new InterviewExperience({
    ...experienceData,
    user: userId,
  });
  await experience.save();
  return experience;
};

/**
 * Fetch interview experiences with searching, filtering, sorting, and pagination
 * @param {object} query - Query parameters from request
 * @returns {Promise<object>} Paginated experiences and count metadata
 */
export const getAllExperiences = async (query) => {
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
    sortBy = 'newest'
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
    .populate('user', 'name profileImage college')
    .sort(sort)
    .skip(skipNum)
    .limit(limitNum)
    .lean();

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
export const getExperienceById = async (id) => {
  const experience = await InterviewExperience.findById(id).populate('user', 'name profileImage college');
  if (!experience) {
    const error = new Error('Interview experience not found');
    error.status = 404;
    throw error;
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

  if (experience.user.toString() !== userId.toString()) {
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
    'college',
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

  if (experience.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this experience');
    error.status = 403;
    throw error;
  }

  await InterviewExperience.findByIdAndDelete(id);
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

  const distinctUsers = await InterviewExperience.distinct('user');
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
