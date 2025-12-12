/**
 * Client-safe utility functions for file handling
 * For server-only utilities (like fileToBase64), see fileUtils.server.ts
 */

/**
 * Gets the media type (MIME type) from a file
 */
export function getMediaType(file: File): string {
  return file.type || 'application/octet-stream'
}

/**
 * Validates if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Validates if a file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

