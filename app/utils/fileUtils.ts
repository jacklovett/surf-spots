/**
 * Client-safe utility functions for file handling
 * For server-only utilities (like fileToBase64), see fileUtils.server.ts
 */

/**
 * Gets the media type (MIME type) from a file
 */
export const getMediaType = (file: File): string =>
  file.type || 'application/octet-stream'

/**
 * Validates if a file is an image
 */
export const isImageFile = (file: File): boolean =>
  file.type.startsWith('image/')

/**
 * Validates if a file is a video
 */
export const isVideoFile = (file: File): boolean =>
  file.type.startsWith('video/')

