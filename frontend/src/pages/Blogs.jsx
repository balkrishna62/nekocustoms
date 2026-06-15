import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings, API_BASE_URL } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { Calendar, ArrowRight } from 'lucide-react';

const Blogs = () => {
  const { isFeatureActive } = useSettings();
  const { language, t } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFeatureActive('show_blog')) {
      return;
    }

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/blogs?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [language, isFeatureActive]);

  if (!isFeatureActive('show_blog')) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>This section has been temporarily disabled by the administrator.</h2>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="blog-page container animate-fade-in">
      <SchemaMarkup 
        title={t('nav_blog')}
        description={t('blog_subtitle')}
      />

      <h2 className="section-title">{t('blog_title')}</h2>
      <p className="section-subtitle">{t('blog_subtitle')}</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : blogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <p>{t('no_blogs')}</p>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog, index) => (
            <article 
              key={blog.id} 
              className="blog-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="blog-img-wrapper">
                <img 
                  src={blog.cover_image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'} 
                  alt={blog.title} 
                  className="blog-img"
                />
                <span className="blog-card-badge">
                  {blog.category}
                </span>
              </div>
              <div className="blog-card-content">
                <div className="blog-card-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {formatDate(blog.created_at)}
                </div>
                <h3 className="blog-card-title">{blog.title}</h3>
                <p className="blog-card-excerpt">{blog.excerpt}</p>
                <Link to={`/blog/${blog.slug}`} className="blog-card-link">
                  {t('btn_read_more')} <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
