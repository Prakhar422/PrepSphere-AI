import multer from 'multer';


const storage = multer.memoryStorage();

// File criteria filter (type validation)
const fileFilter = (req, file, cb) => {
  // Check extensions
  const allowedExtensions = ['.pdf', '.docx'];
  const ext = file.originalname.includes(".")
  ? "." + file.originalname.split(".").pop().toLowerCase()
  : "";

  const isAllowedExt = allowedExtensions.includes(ext);

  // Check MIME types
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only PDF and DOCX files are allowed!'), false);
  }
};

// Set up Multer instance with 5 MB file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
  },
}).single('resume');

// Wrapper middleware to intercept and return client-friendly errors
export const uploadResume = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File is too large. Maximum size allowed is 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      // Catch custom file type filter errors or others
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Verify a file was indeed received
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    next();
  });
};

// Profile image upload configuration
const imageFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = file.originalname.includes('.')
    ? '.' + file.originalname.split('.').pop().toLowerCase()
    : '';

  const isAllowedExt = allowedExtensions.includes(ext);
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only JPG, JPEG, PNG and WEBP files are allowed!'), false);
  }
};

const uploadImg = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).single('profileImage');

export const uploadProfileImage = (req, res, next) => {
  uploadImg(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File is too large. Maximum size allowed is 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    next();
  });
};
