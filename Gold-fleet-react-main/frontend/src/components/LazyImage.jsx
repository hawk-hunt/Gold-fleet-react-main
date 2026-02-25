import React, { useEffect, useRef, useState } from 'react';

/**
 * LazyImage Component
 * Efficiently loads images only when they're about to enter the viewport
 * 
 * Props:
 *   - src: string (required) - image URL
 *   - alt: string (optional) - alt text for accessibility
 *   - className: string (optional) - additional CSS classes
 *   - placeholderBg: string (optional) - background color while loading (default: #f0f0f0)
 *   - width: number (optional) - image width for aspect ratio preservation
 *   - height: number (optional) - image height for aspect ratio preservation
 */
const LazyImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholderBg = '#e5e7eb',
  width,
  height,
  onLoad = () => {}
}) => {
  const imgRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const aspectRatioStyle = width && height 
    ? { aspectRatio: `${width} / ${height}` } 
    : {};

  return (
    <div
      ref={imgRef}
      style={{
        backgroundColor: imageSrc && isLoaded ? 'transparent' : placeholderBg,
        overflow: 'hidden',
        ...aspectRatioStyle,
      }}
      className={`transition-all duration-300 ${className}`}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ ...aspectRatioStyle }}
        />
      )}
    </div>
  );
};

export default LazyImage;
