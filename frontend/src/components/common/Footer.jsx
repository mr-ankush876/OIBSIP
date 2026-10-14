import React from 'react';
import { Pizza, Heart, Shield, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#111827',
      color: '#9ca3af',
      padding: '48px 0 24px 0',
      marginTop: 'auto',
      borderTop: '1px solid #1f2937',
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '36px' }}>
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Pizza size={22} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Slice<span style={{ color: 'var(--color-primary)' }}>Craft</span>
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#9ca3af' }}>
            Artisan handcrafted oven-baked pizzas prepared with 100% natural ingredients, farm-fresh produce, and real mozzarella.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <Shield size={16} color="#16a34a" />
            <span>Razorpay Verified & Secure 256-bit Encryption</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
            EXPLORE
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <li><Link to="/menu" style={{ color: '#9ca3af' }}>Artisan Pizza Menu</Link></li>
            <li><Link to="/builder" style={{ color: '#9ca3af' }}>Custom Pizza Studio</Link></li>
            <li><Link to="/track" style={{ color: '#9ca3af' }}>Live Order Tracking</Link></li>
            <li><Link to="/admin" style={{ color: '#9ca3af' }}>Store Admin Portal</Link></li>
          </ul>
        </div>

        {/* Opening Hours */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
            OPENING HOURS
          </h4>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.8' }}>
            Monday - Thursday: 11:00 AM - 11:00 PM<br/>
            Friday - Sunday: 11:00 AM - 01:00 AM<br/>
            Hot & Fresh Kitchen Delivery Guaranteed
          </p>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
            CUSTOMER CARE
          </h4>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '12px' }}>
            Have a question about your order or ingredients? Chat with us live via our floating WhatsApp icon anytime!
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4ade80' }}>
            <PhoneCall size={16} />
            <span>Dedicated WhatsApp Support Active</span>
          </div>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid #1f2937',
        paddingTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <span>© {new Date().getFullYear()} SliceCraft Pizza Delivery. OIBSIP Task 1 Full-Stack Project.</span>
        <span>Built with MERN Stack • React • Node • Socket.IO • Razorpay</span>
      </div>
    </footer>
  );
};

export default Footer;
