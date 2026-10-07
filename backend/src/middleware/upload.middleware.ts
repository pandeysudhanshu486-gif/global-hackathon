import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

// Safe temporary directory for PDF uploads
const tempUploadDir = path.join(os.tmpdir(), 'workproof-resumes');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Multer Disk Storage with collision-safe UUID filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (_req, _file, cb) => {
    const safeFilename = `resume-${uuidv4()}.pdf`;
    cb(null, safeFilename);
  },
});

// File filter checking declared MIME type
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file format. Only PDF files are allowed.'));
  }
};

// 5 MB limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter,
});

/**
 * Validates the file buffer header against the PDF magic bytes signature (%PDF- / 0x25 0x50 0x44 0x46)
 */
export const validatePdfMagicBytes = (filePath: string): boolean => {
  try {
    const buffer = Buffer.alloc(5);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);

    const header = buffer.toString('utf-8');
    return header.startsWith('%PDF-');
  } catch (err) {
    logger.error('Error verifying PDF magic bytes:', err);
    return false;
  }
};

/**
 * Safely removes temporary file
 */
export const cleanupUploadedFile = (filePath?: string): void => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Cleaned up temporary upload: ${filePath}`);
    }
  } catch (err) {
    logger.warn(`Failed to clean up temporary file: ${filePath}`, err);
  }
};

/**
 * Single resume upload middleware with Multer handling, 5MB limit check, and magic bytes verification
 */
export const handleResumeUpload = (req: Request, res: Response, next: NextFunction): void => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size exceeds the maximum limit of 5 MB.'));
        }
        return next(new BadRequestError(`Upload error: ${err.message}`));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new BadRequestError('No resume file provided. Please upload a PDF file under the "resume" field.'));
    }

    // Secondary strict validation: check actual file content header (magic bytes)
    const isValidPdf = validatePdfMagicBytes(req.file.path);
    if (!isValidPdf) {
      cleanupUploadedFile(req.file.path);
      return next(new BadRequestError('Invalid PDF file. The uploaded file does not contain a valid PDF signature.'));
    }

    next();
  });
};
