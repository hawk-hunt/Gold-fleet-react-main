<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageService
{
    /**
     * Process and compress an uploaded image using GD Library
     * 
     * @param UploadedFile $imageFile
     * @param string $storagePath - The storage disk path (e.g., 'drivers', 'vehicles')
     * @param array $options - Compression options
     * @return string - Path to the stored image
     */
    public static function processImage(UploadedFile $imageFile, $storagePath = 'uploads', $options = [])
    {
        $maxWidth = $options['maxWidth'] ?? 1200;
        $maxHeight = $options['maxHeight'] ?? 1200;
        $quality = $options['quality'] ?? 80;

        try {
            $filePath = $imageFile->getRealPath();
            $fileName = time() . '_' . uniqid() . '.jpg';
            $storagePath = $storagePath . '/' . $fileName;

            // Get image info
            $imageInfo = getimagesize($filePath);
            if (!$imageInfo) {
                throw new \Exception('Invalid image file');
            }

            $origWidth = $imageInfo[0];
            $origHeight = $imageInfo[1];
            $mimeType = $imageInfo['mime'];

            // Create image resource based on type
            switch ($mimeType) {
                case 'image/jpeg':
                    $source = imagecreatefromjpeg($filePath);
                    break;
                case 'image/png':
                    $source = imagecreatefrompng($filePath);
                    break;
                case 'image/gif':
                    $source = imagecreatefromgif($filePath);
                    break;
                case 'image/webp':
                    $source = imagecreatefromwebp($filePath);
                    break;
                default:
                    // For any other format, attempt JPEG creation
                    $source = imagecreatefromjpeg($filePath);
            }

            if (!$source) {
                throw new \Exception('Could not create image resource');
            }

            // Calculate new dimensions maintaining aspect ratio
            $newWidth = $origWidth;
            $newHeight = $origHeight;

            if ($origWidth > $origHeight) {
                if ($origWidth > $maxWidth) {
                    $newHeight = intval(($origHeight * $maxWidth) / $origWidth);
                    $newWidth = $maxWidth;
                }
            } else {
                if ($origHeight > $maxHeight) {
                    $newWidth = intval(($origWidth * $maxHeight) / $origHeight);
                    $newHeight = $maxHeight;
                }
            }

            // Create resized image
            $resized = imagecreatetruecolor($newWidth, $newHeight);

            // Preserve transparency for PNG
            if ($mimeType === 'image/png') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
            }

            // Resize
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

            // Save as JPEG with compression
            $tempFile = tempnam(sys_get_temp_dir(), 'img_');
            imagejpeg($resized, $tempFile, $quality);

            // Read and store the image
            $imageContent = file_get_contents($tempFile);
            Storage::disk('public')->put($storagePath, $imageContent);

            // Cleanup
            imagedestroy($source);
            imagedestroy($resized);
            unlink($tempFile);

            $finalSize = Storage::disk('public')->size($storagePath);

            Log::info('[ImageService] Image processed and stored', [
                'original_name' => $imageFile->getClientOriginalName(),
                'original_size' => $imageFile->getSize(),
                'original_dimensions' => $origWidth . 'x' . $origHeight,
                'new_dimensions' => $newWidth . 'x' . $newHeight,
                'stored_path' => $storagePath,
                'final_size' => $finalSize,
            ]);

            return $storagePath;
        } catch (\Exception $e) {
            Log::error('[ImageService] Image processing failed: ' . $e->getMessage(), [
                'file' => $imageFile->getClientOriginalName(),
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    /**
     * Delete an image from storage
     *
     * @param string $imagePath
     * @return bool
     */
    public static function deleteImage($imagePath)
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
            Log::info('[ImageService] Image deleted', ['path' => $imagePath]);
            return true;
        }
        return false;
    }
}

