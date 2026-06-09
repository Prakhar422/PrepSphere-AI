import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure env variables are loaded if not loaded in parent
dotenv.config();

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
