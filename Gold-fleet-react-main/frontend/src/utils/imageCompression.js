/**
 * Compress image file to a reasonable size for upload and display
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<{file: File, preview: string}>} - Compressed file and preview URL
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            // Create preview URL
            const previewUrl = URL.createObjectURL(blob);

            // Create new File object
            const fileName = file.name.split('.')[0];
            const fileExtension = file.name.split('.').pop();
            const compressedFile = new File([blob], `${fileName}_compressed.${fileExtension}`, {
              type: file.type,
              lastModified: Date.now()
            });

            console.log('[imageCompression] Original size:', (file.size / 1024).toFixed(2), 'KB');
            console.log('[imageCompression] Compressed size:', (compressedFile.size / 1024).toFixed(2), 'KB');
            console.log('[imageCompression] Dimensions:', width, 'x', height);

            resolve({
              file: compressedFile,
              preview: previewUrl
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};
