import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname) || '.bin');
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Invalid file type. Allowed: images, PDF, DOC'), false);
};

const maxSize = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});
