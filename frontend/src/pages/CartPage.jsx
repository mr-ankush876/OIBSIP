import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, tax, deliveryFee, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
          {t('cart.empty')}
        </h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '28px', maxWidth: '440px', marginInline: 'auto' }}>
          Your craving deserves satisfaction! Build a custom handcrafted pizza or explore our chef's signature menu.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/menu" className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>
            {t('cart.startOrdering')}
          </Link>
          <Link to="/builder" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
            <Sparkles size={16} /> Build Custom Pizza
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
          {t('cart.title')} <span style={{ fontSize: '1.1rem', color: 'var(--color-muted)', fontWeight: 600 }}>({itemCount} items)</span>
        </h1>
        <button
          onClick={clearCart}
          style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Trash2 size={14} /> {t('cart.clearCart')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
              )}

              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                    {item.name}
                  </h3>
                  {item.isCustom && (
                    <span className="badge badge-special" style={{ fontSize: '0.65rem' }}>Custom</span>
                  )}
                </div>

                {item.isCustom && item.customDetails && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                    <div><strong>Base:</strong> {item.customDetails.baseName} | <strong>Sauce:</strong> {item.customDetails.sauceName}</div>
                    <div><strong>Cheese:</strong> {item.customDetails.cheeseName}</div>
                    {item.customDetails.vegetableNames?.length > 0 && (
                      <div><strong>Veggies:</strong> {item.customDetails.vegetableNames.join(', ')}</div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '6px' }}>
                  ₹{item.price}
                </div>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    style={{ padding: '6px 10px', color: 'var(--color-dark)' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0 8px', fontWeight: 700, fontSize: '0.9rem', minWidth: '24px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    style={{ padding: '6px 10px', color: 'var(--color-dark)' }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <span style={{ fontWeight: 800, fontSize: '1.05rem', minWidth: '60px', textAlign: 'right' }}>
                  ₹{item.price * item.quantity}
                </span>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeFromCart(item.cartItemId)}
                  style={{ color: '#94a3b8', padding: '6px' }}
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="card" style={{ padding: '28px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '20px' }}>
            Payment Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>{t('cart.subtotal')}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>₹{subtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>{t('cart.tax')}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>₹{tax}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>{t('cart.delivery')}</span>
              <span style={{ fontWeight: 600, color: deliveryFee === 0 ? 'var(--color-success)' : 'var(--color-dark)' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>

            {deliveryFee > 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', backgroundColor: '#fff7ed', padding: '8px 12px', borderRadius: '6px' }}>
                💡 Add ₹{500 - subtotal} more of artisan pizza to get FREE delivery!
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '2px dashed var(--color-border)',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}>
              <span>{t('cart.total')}</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{total}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '24px', borderRadius: 'var(--radius-md)' }}
          >
            {t('cart.proceedToCheckout')}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
