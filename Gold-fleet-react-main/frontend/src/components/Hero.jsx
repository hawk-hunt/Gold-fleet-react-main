import React, { useState, useEffect, useRef } from 'react'
import './Hero.css'

const Hero = () => {
  const videos = [
    '/videos/4336529-uhd_3840_2160_30fps-00.00.05.805-00.00.09.526.mp4',
    '/videos/13197481_1920_1080_30fps.mp4',
    '/videos/recording3.mp4',
  ];
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);
  const indexRef = useRef(0);
  const hasShownIntroRef = useRef(false);
  const intervalRef = useRef(null);

  // Preload all videos
  useEffect(() => {
    videos.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  // Set up smooth video rotation without state dependencies causing re-renders
  useEffect(() => {
    const rotateVideo = () => {
      indexRef.current = (indexRef.current + 1) % videos.length;
      if (indexRef.current === 0) hasShownIntroRef.current = true;
      setIndex(indexRef.current);
    };

    // Initial delay for intro video (5 seconds), then 3 seconds for others
    const firstDelay = 5000;
    const rotationDelay = 3000;

    // Set first rotation
    intervalRef.current = setTimeout(() => {
      rotateVideo();
      // After first rotation, set consistent interval
      intervalRef.current = setInterval(rotateVideo, rotationDelay);
    }, firstDelay);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        clearInterval(intervalRef.current);
      }
    };
  }, [videos.length]);

  return (
    <section className="hero">
      <video 
        ref={videoRef}
        autoPlay
        muted 
        playsInline 
        className="hero-video"
        key={videos[index]}
      >
        <source src={videos[index]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">GoldFleet Management Services</h1>
          <p className="hero-sub">Cloud-based vehicle tracking and fleet management software</p>
          <div className="hero-actions">
            <a href="/login" className="hero-cta">Login / Sign up</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
