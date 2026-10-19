import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resumeStorage() {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(process.cwd(), UPLOAD_DIR, 'resumes');
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `resume_${uuidv4()}${ext}`);
    },
  });
}

function photoStorage() {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(process.cwd(), UPLOAD_DIR, 'photos');
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `photo_${uuidv4()}${ext}`);
    },
  });
}

function resumeFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed for resumes'));
  }
}

function photoFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const allowed = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG files are allowed for profile photos'));
  }
}

export const uploadResume = multer({
  storage: resumeStorage(),
  fileFilter: resumeFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
}).single('resume');

export const uploadPhoto = multer({
  storage: photoStorage(),
  fileFilter: photoFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for photos
}).single('photo');
