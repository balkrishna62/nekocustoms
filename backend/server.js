const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const { seedDatabase } = require('./database/seeder');

// Controllers
const adminController = require('./controllers/adminController');
const settingController = require('./controllers/settingController');
const blogController = require('./controllers/blogController');
const noticeController = require('./controllers/noticeController');
const messageController = require('./controllers/messageController');
const galleryController = require('./controllers/galleryController');
const reviewController = require('./controllers/reviewController');
const pushController = require('./controllers/pushController');
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const chatController = require('./controllers/chatController');

// Push Notifications Setup
const webpush = require('web-push');

// Middlewares
const auth = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  socket.on('join_portal', (userId) => {
    socket.join('portal_room');
    if(userId) socket.join(`user_${userId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const pool = require('./config/db').getPool();
      const [result] = await pool.query(
        'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [data.sender_id, data.receiver_id || null, data.message]
      );
      
      const [messages] = await pool.query(
        'SELECT c.*, u.username as sender_name FROM chat_messages c JOIN users u ON c.sender_id = u.id WHERE c.id = ?',
        [result.insertId]
      );

      if (data.receiver_id) {
        io.to(`user_${data.receiver_id}`).to(`user_${data.sender_id}`).emit('receive_message', messages[0]);
      } else {
        io.to('portal_room').emit('receive_message', messages[0]);
      }
    } catch(err) {
      console.error('Socket DB Error', err);
    }
  });
});

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Global Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Expose Static Uploads Directory
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure File Upload Filter
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Format rejected. Only standard photos (jpg, png, webp, gif) and videos (mp4, webm, avi, mov) are allowed!'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit for videos
});

// ==========================================
// API Routes Map
// ==========================================

// 1. Admin Auth Routes
app.post('/api/admin/login', adminController.login);
app.get('/api/admin/verify', auth, adminController.verifyToken);
app.put('/api/admin/password', auth, adminController.changePassword);

// 2. Settings Routes
app.get('/api/settings', settingController.getSettings);
app.put('/api/settings', auth, settingController.updateSettings);

// 3. Blogs Routes
app.get('/api/blogs', blogController.getAllBlogs);
app.get('/api/blogs/:slug', blogController.getBlogBySlug);
app.post('/api/blogs', auth, blogController.createBlog);
app.put('/api/blogs/:id', auth, blogController.updateBlog);
app.delete('/api/blogs/:id', auth, blogController.deleteBlog);

// 4. Notices Routes
app.get('/api/notices', noticeController.getActiveNotices);
app.get('/api/notices/popup', noticeController.getPopupNotice);
app.get('/api/admin/notices', auth, noticeController.getAllNotices);
app.post('/api/notices', auth, noticeController.createNotice);
app.put('/api/notices/:id', auth, noticeController.updateNotice);
app.delete('/api/notices/:id', auth, noticeController.deleteNotice);

// 5. Contact Inquiries Routes
app.post('/api/contact', messageController.submitMessage);
app.get('/api/admin/messages', auth, messageController.getMessages);
app.get('/api/admin/messages/unread-count', auth, messageController.getUnreadCount);
app.put('/api/admin/messages/:id', auth, messageController.updateMessageStatus);
app.delete('/api/admin/messages/:id', auth, messageController.deleteMessage);

// 6. Gallery Routes
app.get('/api/gallery', galleryController.getGallery);
app.post('/api/gallery', auth, galleryController.createGalleryItem);
app.put('/api/gallery/:id', auth, galleryController.updateGalleryItem);
app.delete('/api/gallery/:id', auth, galleryController.deleteGalleryItem);

// 7. Reviews Routes
app.get('/api/reviews', reviewController.getReviews);
app.post('/api/reviews', auth, reviewController.createReview);
app.put('/api/reviews/:id', auth, reviewController.updateReview);
app.delete('/api/reviews/:id', auth, reviewController.deleteReview);

// 8. Push Notifications Routes
app.get('/api/admin/push/vapid-public-key', auth, pushController.getVapidPublicKey);
app.post('/api/admin/push/subscribe', auth, pushController.subscribe);

// 10. Portal Users Routes
app.get('/api/admin/users', auth, userController.getUsers);
app.post('/api/admin/users', auth, userController.createUser);
app.delete('/api/admin/users/:id', auth, userController.deleteUser);
app.put('/api/admin/users/:id/record', auth, userController.updateUserRecord);
app.post('/api/admin/users/:id/reviews', auth, userController.createStaffReview);
app.get('/api/admin/users/:id/reviews', auth, userController.getStaffReviews);

// 11. Portal Tasks Routes
app.get('/api/portal/dashboard/stats', auth, taskController.getDashboardStats);
app.get('/api/portal/dashboard/workload', auth, taskController.getStaffWorkload);
app.get('/api/portal/tasks', auth, taskController.getTasks);
app.get('/api/portal/tasks/search', auth, taskController.searchTasks);
app.get('/api/portal/tasks/me', auth, taskController.getTasksByUser);
app.post('/api/portal/tasks', auth, taskController.createTask);
app.put('/api/portal/tasks/:id', auth, taskController.updateTaskStatus);
app.put('/api/portal/tasks/:id/details', auth, taskController.updateTaskDetails);
app.delete('/api/portal/tasks/:id', auth, taskController.deleteTask);

// 12. Portal Chat Routes
app.get('/api/portal/chat/global', auth, chatController.getGlobalChat);
app.get('/api/portal/chat/:userId', auth, chatController.getChatHistory);

// 9. Admin Upload Endpoint
app.post('/api/upload', auth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.status(201).json({
      message: 'File uploaded successfully.',
      filename: req.file.filename,
      url: fileUrl
    });
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// App Startup Sequence
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 0. Configure Web Push
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:test@test.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
      console.log('Web Push VAPID details configured.');
    } else {
      console.warn('WARNING: VAPID keys not found. Web Push will not work.');
    }

    // 1. Verify/establish database
    await initializeDatabase();
    
    // 2. Seed tables and content defaults
    await seedDatabase();

    // 3. Bind port
    server.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL Base: http://localhost:${PORT}/api`);
      console.log(`Uploads URL: http://localhost:${PORT}/uploads`);
      console.log(`WebSockets enabled on path /socket.io/`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('CRITICAL ERROR: Failed to start the server due to database blockages.');
    console.error(err.message);
    process.exit(1);
  }
}

startServer();
