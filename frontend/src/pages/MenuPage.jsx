import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingBag, Check } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useCart } from '../context/CartContext';

const MenuPage = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [addedItem, setAddedItem] = useState(null);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const data = await apiClient.get('/pizzas', { params });
      if (data.success && data.pizzas) {
        setPizzas(data.pizzas);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pizza menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPizzas();
    }, 250);
    return () => clearTimeout(timer);
  }, [category, search, sort]);

  const handleAddToCart = (pizza) => {
    addToCart({
      pizza: pizza._id,
      isCustom: false,
      name: pizza.name,
      price: pizza.price,
      image: pizza.image,
      quantity: 1,
    });
    setAddedItem(pizza._id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '-0.5px' }}>
          {t('menu.title')}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1rem', marginTop: '6px' }}>
          {t('menu.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Veg', 'Special', 'Bestseller'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 700,
                backgroundColor: category === cat ? 'var(--color-primary)' : '#f1f5f9',
                color: category === cat ? '#ffffff' : 'var(--color-dark)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat === 'All' ? t('menu.all') : cat === 'Veg' ? t('menu.veg') : cat}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '440px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('menu.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-control"
            style={{ width: 'auto', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Pizzas Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-danger)' }}>
          {error}
        </div>
      ) : pizzas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
          <h3>No pizzas match your filter.</h3>
          <p>Try searching for a different keyword or category.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {pizzas.map((pizza) => {
            const isAdded = addedItem === pizza._id;
            return (
              <div
                key={pizza._id}
                className="card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    {pizza.category === 'Veg' && (
                      <span className="badge badge-veg">Veg</span>
                    )}
                    {pizza.category === 'Special' && (
                      <span className="badge badge-special">Special</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                      {pizza.name}
                    </h3>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₹{pizza.price}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '18px', flex: 1, lineHeight: '1.5' }}>
                    {pizza.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(pizza)}
                    disabled={!pizza.isAvailable}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: isAdded ? '#16a34a' : 'var(--color-primary)',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> Added!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> {t('menu.addToCart')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
