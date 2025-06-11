import fs from 'fs';
import path from 'path';

// Helper to check if a file exists
export const fileExists = async (filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

// Helper to delete a file
export const deleteFile = async (filePath) => {
  try {
    if (await fileExists(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper to clean up unused images
export const cleanupUnusedImages = async (uploadsDir, usedPaths) => {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const relativePath = path.join('uploads', file).replace(/\\/g, '/');
      
      // Skip if file is in use
      if (usedPaths.includes(relativePath)) continue;
      
      // Check if file is older than 24 hours
      const stats = await fs.promises.stat(filePath);
      const now = new Date();
      const fileAge = now - stats.mtime;
      const hoursSinceModified = fileAge / (1000 * 60 * 60);
      
      // Delete if file is unused and older than 24 hours
      if (hoursSinceModified > 24) {
        await deleteFile(filePath);
        console.log(`Deleted unused file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up unused images:', error);
  }
};
