import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSettings, API_BASE_URL } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import SchemaMarkup from '../components/SchemaMarkup';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const { isFeatureActive } = useSettings();
  const { t } = useTranslation();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFeatureActive('show_blog')) {
      return;
    }

    const fetchBlogPost = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Network failure loading article.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug, isFeatureActive]);

  if (!isFeatureActive('show_blog')) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>This section has been temporarily disabled by the administrator.</h2>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderContent = (content) => {
    if (!content) return null;

    const sections = content.split('\n\n');
    let insideList = false;
    const renderedElements = [];

    sections.forEach((sec, idx) => {
      const trimmed = sec.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('### ')) {
        closeListIfNeeded();
        renderedElements.push(<h3 key={`h3-${idx}`}>{trimmed.slice(4)}</h3>);
      } else if (trimmed.startsWith('## ')) {
        closeListIfNeeded();
        renderedElements.push(<h2 key={`h2-${idx}`}>{trimmed.slice(3)}</h2>);
      } else if (trimmed.startsWith('# ')) {
        closeListIfNeeded();
        renderedElements.push(<h2 key={`h1-${idx}`}>{trimmed.slice(2)}</h2>);
      } 
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!insideList) {
          insideList = true;
        }
        const listItems = trimmed
          .split('\n')
          .map(item => item.replace(/^[-*]\s+/, ''))
          .filter(item => item.length > 0);
          
        renderedElements.push(
          <ul key={`ul-${idx}`} style={{ paddingLeft: '24px', marginBottom: '24px', listStyleType: 'disc' }}>
            {listItems.map((li, lIdx) => <li key={`li-${idx}-${lIdx}`} style={{ marginBottom: '8px' }}>{li}</li>)}
          </ul>
        );
        insideList = false;
      }
      else if (/^\d+\.\s+/.test(trimmed)) {
        closeListIfNeeded();
        const listItems = trimmed
          .split('\n')
          .map(item => item.replace(/^\d+\.\s+/, ''))
          .filter(item => item.length > 0);

        renderedElements.push(
          <ol key={`ol-${idx}`} style={{ paddingLeft: '24px', marginBottom: '24px', listStyleType: 'decimal' }}>
            {listItems.map((li, lIdx) => <li key={`li-${idx}-${lIdx}`} style={{ marginBottom: '8px' }}>{li}</li>)}
          </ol>
        );
      }
      else if (trimmed.startsWith('```')) {
        closeListIfNeeded();
        const lines = trimmed.split('\n');
        const codeLines = lines.slice(1, lines.length - 1).join('\n');
        renderedElements.push(
          <pre key={`pre-${idx}`}>
            <code>{codeLines}</code>
          </pre>
        );
      }
      else {
        closeListIfNeeded();
        renderedElements.push(<p key={`p-${idx}`} style={{ marginBottom: '20px' }}>{trimmed}</p>);
      }
    });

    function closeListIfNeeded() {
      if (insideList) {
        insideList = false;
      }
    }

    return renderedElements;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="spinner" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>{error || 'Article not found.'}</h2>
        <Link to="/blog" className="btn btn-secondary" style={{ marginTop: '20px' }}>
          Back to Blog List
        </Link>
      </div>
    );
  }

  return (
    <article className="blog-post-page container animate-fade-in">
      <SchemaMarkup 
        title={blog.title}
        description={blog.excerpt}
        keywords={`${blog.category.toLowerCase()}, custom clearance biratnagar, icd dry port`}
      />

      <div className="blog-post-container">
        <Link to="/blog" className="blog-post-back">
          <ArrowLeft size={16} /> {t('back_to_blog')}
        </Link>

        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} /> {formatDate(blog.created_at)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={14} /> {blog.category}
            </span>
          </div>
          <h1 className="blog-post-title">{blog.title}</h1>
        </header>

        {blog.cover_image && (
          <img 
            src={blog.cover_image} 
            alt={blog.title} 
            className="blog-post-hero-img" 
          />
        )}

        <div className="blog-post-body">
          {renderContent(blog.content)}
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
