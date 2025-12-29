/**
 * File utility functions for handling file operations
 */

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension without the dot (e.g., "pdf")
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Check if file is a valid image type
 * @param file - The file to validate
 * @returns True if file is a valid image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return validTypes.includes(file.type);
}

/**
 * Check if file is a valid document type
 * @param file - The file to validate
 * @returns True if file is a valid document type
 */
export function isValidDocumentType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return validTypes.includes(file.type);
}

/**
 * Maximum file sizes in bytes
 */
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Accepted file types for inputs
 */
export const ACCEPTED_IMAGE_TYPES = '.jpg,.jpeg,.png';
export const ACCEPTED_DOCUMENT_TYPES = '.pdf,.doc,.docx';

/**
 * Validate photo file
 * @param file - The file to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePhotoFile(file: File): { isValid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return {
      isValid: false,
      error: 'Format file tidak valid. Gunakan JPG, JPEG, atau PNG.',
    };
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return {
      isValid: false,
      error: `Ukuran file maksimal ${formatFileSize(MAX_PHOTO_SIZE)}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate document file
 * @param file - The file to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateDocumentFile(file: File): { isValid: boolean; error?: string } {
  if (!isValidDocumentType(file)) {
    return {
      isValid: false,
      error: 'Format file tidak valid. Gunakan PDF, DOC, atau DOCX.',
    };
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      isValid: false,
      error: `Ukuran file maksimal ${formatFileSize(MAX_DOCUMENT_SIZE)}.`,
    };
  }

  return { isValid: true };
}

/**
 * Get file name without extension
 * @param filename - The filename to process
 * @returns Filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}