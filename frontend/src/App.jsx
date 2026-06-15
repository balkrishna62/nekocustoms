import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import NoticePopup from './components/NoticePopup';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Notices from './pages/Notices';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <Router>
          <div className="app-container">
            {/* Main sticky navigation header */}
            <Header />

            {/* Core content wrapper */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/blog" element={<Blogs />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/services" element={<Services />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Protected dashboard endpoints */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>

            {/* Landing page alert notice popups */}
            <NoticePopup />

            {/* SEO localized footer details */}
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;
