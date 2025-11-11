const supabase = require('../config/database');

/**
 * Upload file to Supabase Storage
 * @param {Buffer|Uint8Array} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} bucket - Bucket name (default: 'proposals')
 * @returns {Promise<{url: string, path: string}>}
 */
const uploadFile = async (fileBuffer, fileName, bucket = 'proposals') => {
  try {
    // Generate unique file name to avoid conflicts
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}_${randomStr}.${fileExtension}`;
    const filePath = `uploads/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      throw new Error(`Storage upload error: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 * @param {string} filePath - File path in storage
 * @param {string} bucket - Bucket name (default: 'proposals')
 * @returns {Promise<boolean>}
 */
const deleteFile = async (filePath, bucket = 'proposals') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Storage delete error: ${error.message}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get signed URL for private file access
 * @param {string} filePath - File path in storage
 * @param {string} bucket - Bucket name (default: 'proposals')
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>}
 */
const getSignedUrl = async (filePath, bucket = 'proposals', expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Storage signed URL error: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
};
