import { diskStorage, FileFilterCallback } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

/**
 * Configuration for photo uploads (employee profile photos)
 * - Accepts: jpg, jpeg, png
 * - Max size: 5MB
 * - Storage: ./uploads/photos
 */
export const photoUploadConfig = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      callback: DestinationCallback,
    ) => {
      callback(null, './uploads/photos');
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: FilenameCallback,
    ) => {
      const uniqueName = `${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(
        new BadRequestException(
          'Only image files (jpg, jpeg, png) are allowed',
        ),
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

/**
 * Configuration for document uploads (employee documents)
 * - Accepts: pdf, doc, docx
 * - Max size: 10MB
 * - Storage: ./uploads/documents
 */
export const documentUploadConfig = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      callback: DestinationCallback,
    ) => {
      callback(null, './uploads/documents');
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: FilenameCallback,
    ) => {
      const uniqueName = `${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (
      !file.mimetype.match(
        /\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
      )
    ) {
      return callback(
        new BadRequestException('Only PDF and DOC files are allowed'),
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};

/**
 * Configuration for Excel file uploads (employee import)
 * - Accepts: xlsx, xls
 * - Max size: 20MB
 * - Storage: ./uploads/temp
 */
export const excelUploadConfig = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      callback: DestinationCallback,
    ) => {
      callback(null, './uploads/temp');
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: FilenameCallback,
    ) => {
      const uniqueName = `${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (
      !file.mimetype.match(
        /\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/,
      )
    ) {
      return callback(
        new BadRequestException('Only Excel files (.xlsx, .xls) are allowed'),
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
};

/**
 * Configuration for product photo uploads
 * - Accepts: jpg, jpeg, png, gif
 * - Max size: 5MB
 * - Storage: ./uploads/products
 */
export const productPhotoUploadConfig = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      callback: DestinationCallback,
    ) => {
      callback(null, './uploads/products');
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: FilenameCallback,
    ) => {
      const uniqueName = `product-${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(
        new BadRequestException(
          'Only image files (jpg, jpeg, png, gif) are allowed',
        ),
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

/**
 * Upload directories configuration
 */
export const uploadDirectories = {
  photos: './uploads/photos',
  documents: './uploads/documents',
  temp: './uploads/temp',
  products: './uploads/products',
};