import React, { useState, useEffect, useRef } from 'react';
import { useSettings, API_BASE_URL } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
  const { isFeatureActive } = useSettings();
  const { t } = useTranslation();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lightbox Presentation state
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isFeatureActive('show_gallery')) {
      return;
    }

    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gallery`);
        if (res.ok) {
          const data = await res.json();
          setGallery(data);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [isFeatureActive]);

  // Adjust scroll position inside presentation on index update
  useEffect(() => {
    if (lightboxIndex !== null && containerRef.current) {
      const container = containerRef.current;
      const slideWidth = container.offsetWidth;
      // Scroll to the selected slide index (without smooth animation for initial click, or smooth for arrows)
      container.scrollLeft = slideWidth * lightboxIndex;
    }
  }, [lightboxIndex]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') navigateSlide(1);
      if (e.key === 'ArrowLeft') navigateSlide(-1);
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, gallery]);

  if (!isFeatureActive('show_gallery')) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>{t('no_gallery')}</h2>
      </div>
    );
  }

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleScroll = (e) => {
    const container = e.target;
    const slideWidth = container.offsetWidth;
    if (slideWidth > 0) {
      const newIndex = Math.round(container.scrollLeft / slideWidth);
      if (newIndex !== lightboxIndex && newIndex >= 0 && newIndex < gallery.length) {
        setLightboxIndex(newIndex);
      }
    }
  };

  const navigateSlide = (direction) => {
    let nextIndex = lightboxIndex + direction;
    if (nextIndex < 0) nextIndex = gallery.length - 1;
    if (nextIndex >= gallery.length) nextIndex = 0;
    
    if (containerRef.current) {
      const container = containerRef.current;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: slideWidth * nextIndex,
        behavior: 'smooth'
      });
      setLightboxIndex(nextIndex);
    }
  };

  const scrollToSlide = (index) => {
    if (index >= 0 && index < gallery.length && containerRef.current) {
      const container = containerRef.current;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setLightboxIndex(index);
    }
  };

  return (
    <div className="gallery-page container animate-fade-in">
      <SchemaMarkup 
        title={t('nav_gallery')}
        description={t('gallery_subtitle')}
      />

      <h2 className="section-title">{t('gallery_title')}</h2>
      <p className="section-subtitle">{t('gallery_subtitle')}</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : gallery.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <p>{t('no_gallery')}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {gallery.map((item, index) => (
            <div 
              key={item.id} 
              className="gallery-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => openLightbox(index)}
            >
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="gallery-card-img" 
                loading="lazy"
              />
              <div className="gallery-card-overlay">
                <ZoomIn size={20} style={{ marginBottom: '8px' }} />
                <h3 className="gallery-card-title">{item.title}</h3>
                {item.description && <p className="gallery-card-desc">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modernised Scroll-Snap Lightbox Presentation Slider */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          {/* Slideshow main block */}
          <div className="lightbox-content" style={{ width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Action Bar */}
            <button className="lightbox-close-btn" style={{ top: '24px', right: '24px', zIndex: '100' }} onClick={closeLightbox}>
              <X size={32} />
            </button>

            {/* Left Navigate Arrow */}
            <button className="theme-toggle-btn" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: '100', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigateSlide(-1)}>
              <ChevronLeft size={24} />
            </button>

            {/* Scroll snapping slide deck container */}
            <div 
              ref={containerRef}
              className="presentation-container" 
              style={{ height: '100%', display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
              onScroll={handleScroll}
            >
              {gallery.map((item, index) => (
                <div 
                  key={item.id} 
                  className="presentation-slide"
                  style={{ width: '100vw', flexShrink: 0, scrollSnapAlign: 'start', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div 
                    className="presentation-bg" 
                    style={{ 
                      backgroundImage: `url(${item.image_url})`, 
                      filter: 'brightness(0.25) blur(15px)', 
                      transform: 'scale(1.1)', 
                      position: 'absolute', 
                      width: '100%', 
                      height: '100%' 
                    }}
                  />
                  <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      style={{ 
                        maxHeight: '70vh', 
                        maxWidth: '85vw', 
                        objectFit: 'contain', 
                        borderRadius: 'var(--radius-sm)', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                        transition: 'transform 0.5s ease',
                        transform: index === lightboxIndex ? 'scale(1)' : 'scale(0.95)'
                      }} 
                    />
                  </div>
                  {/* Localized sliding Caption overlay */}
                  <div 
                    className="presentation-content" 
                    style={{ 
                      padding: '24px 32px 48px', 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      width: '100%',
                      textAlign: 'center',
                      opacity: index === lightboxIndex ? 1 : 0,
                      transform: index === lightboxIndex ? 'translateY(0)' : 'translateY(15px)',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <h3 style={{ fontSize: '1.75rem', color: 'white', marginBottom: '8px' }}>{item.title}</h3>
                    {item.description && <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Navigate Arrow */}
            <button className="theme-toggle-btn" style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: '100', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigateSlide(1)}>
              <ChevronRight size={24} />
            </button>

            {/* Bottom dots list */}
            <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: '100' }}>
              {gallery.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => scrollToSlide(index)}
                  style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    border: 'none', 
                    background: index === lightboxIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
