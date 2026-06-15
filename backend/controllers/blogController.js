const { getPool } = require('../config/db');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

exports.getAllBlogs = async (req, res) => {
  const pool = getPool();
  const showDrafts = req.query.all === 'true'; // For admin dashboards
  const lang = req.query.lang || 'en';

  try {
    let query = 'SELECT id, title, slug, excerpt, category, cover_image, status, language, created_at FROM blogs';
    const params = [];

    if (showDrafts) {
      // Admin might want to see all languages or filter, let's let them filter if lang is specified
      if (req.query.lang) {
        query += ' WHERE language = ?';
        params.push(req.query.lang);
      }
    } else {
      query += " WHERE language = ? AND status = 'published'";
      params.push(lang);
    }
    
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return res.status(500).json({ message: 'Server error retrieving blog posts.' });
  }
};

exports.getBlogBySlug = async (req, res) => {
  const { slug } = req.params;
  const pool = getPool();

  try {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    return res.status(500).json({ message: 'Server error retrieving blog details.' });
  }
};

exports.createBlog = async (req, res) => {
  const { title, excerpt, content, category, cover_image, status, language } = req.body;
  const pool = getPool();

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    let slug = slugify(title);
    
    // Ensure slug is unique
    const [existing] = await pool.query('SELECT id FROM blogs WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const [result] = await pool.query(
      'INSERT INTO blogs (title, slug, excerpt, content, category, cover_image, status, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        slug,
        excerpt || '',
        content,
        category || 'Custom Clearance',
        cover_image || '',
        status || 'published',
        language || 'en'
      ]
    );

    return res.status(201).json({
      message: 'Blog post created successfully.',
      blogId: result.insertId,
      slug
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    return res.status(500).json({ message: 'Server error creating blog post.' });
  }
};

exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, cover_image, status, language } = req.body;
  const pool = getPool();

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }

    let slug = rows[0].slug;
    if (rows[0].title !== title) {
      slug = slugify(title);
      const [existing] = await pool.query('SELECT id FROM blogs WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    await pool.query(
      'UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, category = ?, cover_image = ?, status = ?, language = ? WHERE id = ?',
      [
        title,
        slug,
        excerpt || '',
        content,
        category || 'Custom Clearance',
        cover_image || '',
        status || 'published',
        language || 'en',
        id
      ]
    );

    return res.json({ message: 'Blog post updated successfully.', slug });
  } catch (err) {
    console.error('Error updating blog post:', err);
    return res.status(500).json({ message: 'Server error updating blog post.' });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog post not found.' });
    }
    return res.json({ message: 'Blog post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    return res.status(500).json({ message: 'Server error deleting blog post.' });
  }
};
