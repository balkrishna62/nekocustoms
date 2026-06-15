-- Database Initialization Schema for Neko Customs Clearance Service Website

-- 1. Users Table (Admin Portal Authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Settings Table (For dynamic UI visibility, customization, contact configurations)
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Blogs Table (News, Custom Guidelines, Tariff Updates)
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Custom Clearance',
  cover_image VARCHAR(500) DEFAULT '',
  status ENUM('draft', 'published') DEFAULT 'published',
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Notices Table (Announcements, holiday alerts, and Landing Page pop-ups)
CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('regular', 'popup', 'alert') DEFAULT 'regular',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Contact Messages (Inquiries directly routed from the site contact form)
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT '',
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read') DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Gallery Table (For port cargo operations and clearance checkpoints visuals)
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews Table (Client feedback supporting text, ratings, photos, and video media elements)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(150) DEFAULT '',
  rating INT DEFAULT 5,
  review_text TEXT NOT NULL,
  media_type ENUM('photo', 'video', 'none') DEFAULT 'none',
  media_url VARCHAR(500) DEFAULT '',
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Push Subscriptions Table (Web Push for Admin notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
