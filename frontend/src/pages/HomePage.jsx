import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pizza, Sparkles, Clock, ShieldCheck, ArrowRight, ShoppingBag, Flame } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useCart } from '../context/CartContext';

const HomePage = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await apiClient.get('/pizzas');
        if (data.success && data.pizzas) {
          setFeaturedPizzas(data.pizzas.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch featured pizzas', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #fffaf5 0%, #fef2f2 100%)',
        padding: '72px 0',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}>
          <div>
            <span className="badge badge-special" style={{ marginBottom: '14px' }}>
              <Flame size={14} color="#ea580c" /> {t('hero.badge')}
            </span>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--color-dark)',
              letterSpacing: '-1px',
              marginBottom: '18px',
            }}>
              {t('hero.title')}
            </h1>
            <p style={{
              fontSize: '1.08rem',
              color: 'var(--color-muted)',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '540px',
            }}>
              {t('hero.subtitle')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link to="/builder" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}>
                <Sparkles size={18} />
                {t('hero.buildPizza')}
              </Link>
              <Link to="/menu" className="btn btn-outline" style={{ padding: '14px 26px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}>
                {t('hero.viewMenu')}
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Quality Trust Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '1px solid #fed7aa',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-dark)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--color-primary)" />
                <span>30-Min Fast Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pizza size={16} color="var(--color-secondary)" />
                <span>100% Real Mozzarella</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#16a34a" />
                <span>Verified Razorpay Gate</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80"
              alt="Artisan Pizza SliceCraft"
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-xl)',
                border: '4px solid #ffffff',
              }}
            />
          </div>
        </div>
      </section>

      {/* 4-Step Customizer Promo */}
      <section style={{ padding: '64px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.5px' }}>
              The 4-Step Artisan Pizza Studio
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '1rem', marginTop: '6px' }}>
              Tailor every single layer to perfection with real-time price preview
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { num: '1', title: '5 Artisan Bases', desc: 'Thin Crust, Cheese Burst, Hand Tossed, Pan Crust, or Gluten-Free.' },
              { num: '2', title: '5 Gourmet Sauces', desc: 'Classic Marinara, Spicy Peri-Peri, Creamy Alfredo, BBQ, or Pesto Basil.' },
              { num: '3', title: 'Melting Cheeses', desc: '100% Mozzarella, aged Cheddar, shaved Parmesan, 4-Cheese, or Vegan.' },
              { num: '4', title: 'Farm-Fresh Veggies', desc: 'Black Olives, Bell Peppers, Mushrooms, Onions, Jalapenos, Spinach & more.' },
            ].map((step) => (
              <div key={step.num} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/builder" className="btn btn-secondary" style={{ padding: '12px 28px', borderRadius: 'var(--radius-full)' }}>
              Start Customizing Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section style={{ padding: '64px 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                {t('menu.title')}
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
                {t('menu.subtitle')}
              </p>
            </div>
            <Link to="/menu" style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Pizzas <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
              {featuredPizzas.map((pizza) => (
                <div key={pizza._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                        {pizza.name}
                      </h3>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        ₹{pizza.price}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '16px', flex: 1 }}>
                      {pizza.description}
                    </p>
                    <button
                      onClick={() => addToCart({ pizza: pizza._id, isCustom: false, name: pizza.name, price: pizza.price, image: pizza.image, quantity: 1 })}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px' }}
                    >
                      <ShoppingBag size={16} />
                      {t('menu.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
