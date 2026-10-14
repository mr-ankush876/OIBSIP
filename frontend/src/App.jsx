import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LanguageModal from './components/common/LanguageModal';
import DraggableWhatsApp from './components/common/DraggableWhatsApp';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import BuilderPage from './pages/BuilderPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App = () => {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <div className="app-layout">
                {/* Mandatory First-Visit Full-Page Language Selection Modal */}
                <LanguageModal />

                <Navbar />

                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/builder" element={<BuilderPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                    <Route path="/track" element={<OrderTrackingPage />} />
                    <Route path="/track/:id" element={<OrderTrackingPage />} />
                    <Route path="/my-orders" element={<OrderHistoryPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <Footer />

                {/* Floating, Draggable WhatsApp Customer Support Widget */}
                <DraggableWhatsApp />
              </div>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
