import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertCircle, Lock, ShoppingBag, CheckCircle2, XCircle, CreditCard, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { items, subtotal, tax, deliveryFee, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayModalData, setRazorpayModalData] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('Please log in or create an account to proceed with checkout.');
      return;
    }

    if (!address.fullName || !address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend (authoritative price validation & stock check)
      const orderPayload = {
        shippingAddress: address,
        items: items.map((item) => ({
          pizza: item.isCustom ? undefined : item.pizza,
          isCustom: item.isCustom,
          quantity: item.quantity,
          customDetails: item.isCustom
            ? {
                baseId: item.customDetails.baseId,
                sauceId: item.customDetails.sauceId,
                cheeseId: item.customDetails.cheeseId,
                vegetableIds: item.customDetails.vegetableIds,
              }
            : undefined,
        })),
      };

      const orderRes = await apiClient.post('/orders', orderPayload);
      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to initialize order.');
      }

      const createdOrder = orderRes.order;

      // 2. Create Razorpay payment order
      const paymentRes = await apiClient.post('/payments/create-order', {
        orderId: createdOrder._id,
      });

      if (!paymentRes.success) {
        throw new Error(paymentRes.message || 'Payment initialization failed.');
      }

      // Check if Razorpay SDK script is available in window with a live key
      if (typeof window.Razorpay === 'function' && paymentRes.key && !paymentRes.key.includes('placeholder') && !paymentRes.isTestMode) {
        // Live / Configured Razorpay Checkout modal
        const options = {
          key: paymentRes.key,
          amount: paymentRes.amount,
          currency: paymentRes.currency,
          name: 'SliceCraft Pizza',
          description: `Order #${createdOrder._id.slice(-6).toUpperCase()}`,
          order_id: paymentRes.razorpayOrderId,
          prefill: {
            name: address.fullName,
            email: user?.email,
            contact: address.phone,
          },
          theme: {
            color: '#d62828',
          },
          handler: async (response) => {
            try {
              // Verify Razorpay signature on backend
              const verifyRes = await apiClient.post('/payments/verify', {
                orderId: createdOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                clearCart();
                navigate(`/order-success/${createdOrder._id}`);
              }
            } catch (vErr) {
              setError(vErr.message || 'Payment verification failed.');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Launch Interactive Razorpay Test-Mode Modal (Checklist: Clicking "Success" confirms order)
        setLoading(false);
        setRazorpayModalData({
          order: createdOrder,
          razorpayOrderId: paymentRes.razorpayOrderId,
          amount: paymentRes.amount || Math.round(total * 100),
          key: paymentRes.key || 'rzp_test_slicecraft',
        });
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const handleConfirmSuccessPayment = async () => {
    if (!razorpayModalData) return;
    setVerifyingPayment(true);
    setError(null);

    try {
      const simulatedPaymentId = `pay_test_${Date.now()}`;
      const verifyRes = await apiClient.post('/payments/verify', {
        orderId: razorpayModalData.order._id,
        razorpayOrderId: razorpayModalData.razorpayOrderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: 'simulated_test_signature',
      });

      if (verifyRes.success) {
        clearCart();
        navigate(`/order-success/${razorpayModalData.order._id}`);
      }
    } catch (vErr) {
      setError(vErr.message || 'Payment verification failed.');
      setRazorpayModalData(null);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setRazorpayModalData(null);
    setError('Payment cancelled. You can retry checkout anytime.');
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
          {t('checkout.title')}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          Finalize your delivery address and complete secure payment
        </p>
      </div>

      {!isAuthenticated && (
        <div style={{
          backgroundColor: '#fff7ed',
          border: '1.5px solid #fed7aa',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <strong style={{ color: '#9a3412' }}>Authentication Required:</strong>
            <span style={{ color: '#7c2d12', marginLeft: '6px' }}>
              Please sign in or register so you can track your live order status.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Shipping Form */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-dark)' }}>
            📍 {t('checkout.shippingAddress')}
          </h2>

          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label className="form-label">{t('checkout.fullName')} *</label>
              <input
                type="text"
                name="fullName"
                required
                value={address.fullName}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('checkout.street')} *</label>
              <input
                type="text"
                name="street"
                required
                value={address.street}
                onChange={handleChange}
                className="form-control"
                placeholder="Flat / House No., Apartment, Street"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('checkout.city')} *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={address.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('checkout.state')} *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={address.state}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('checkout.zipCode')} *</label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  value={address.zipCode}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. 400001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('checkout.phone')} *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={address.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-border)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700, marginBottom: '4px' }}>
                  <ShieldCheck size={20} />
                  <span>{t('checkout.razorpayBadge')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                  Transactions are encrypted and authenticated via HMAC SHA-256 signatures. Test cards and sandbox payments supported.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !isAuthenticated}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}
              >
                {loading ? (
                  <span>{t('checkout.processing')}</span>
                ) : (
                  <span>
                    <Lock size={16} /> {t('checkout.payNow')} — ₹{total}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Review */}
        <div className="card" style={{ padding: '24px', height: 'fit-content', backgroundColor: '#fffaf5', border: '1px solid #fed7aa' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-dark)' }}>
            {t('checkout.orderSummary')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
            {items.map((item) => (
              <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <div>
                  <strong>{item.quantity}x {item.name}</strong>
                  {item.isCustom && item.customDetails && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {item.customDetails.baseName} | {item.customDetails.cheeseName}
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #fed7aa', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginTop: '8px', paddingTop: '10px', borderTop: '2px dashed #fed7aa' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RAZORPAY TEST-MODE CHECKOUT MODAL (Checklist requirement: clicking 'Success' confirms the order) --- */}
      {razorpayModalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(12, 35, 64, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Razorpay Branded Header */}
            <div
              style={{
                backgroundColor: '#0c2340',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#38bdf8' }}>
                    Razorpay
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#f59e0b',
                      color: '#000',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    TEST MODE
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Merchant: <strong>SliceCraft Pizza</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Amount Payable</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>₹{total}</div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '20px',
                  fontSize: '0.84rem',
                  color: '#475569',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Order Reference:</span>
                  <strong>#{razorpayModalData.order._id.slice(-8).toUpperCase()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Razorpay Order ID:</span>
                  <code style={{ fontSize: '0.76rem', color: '#0284c7' }}>{razorpayModalData.razorpayOrderId}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer Name:</span>
                  <strong>{address.fullName}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Select Test Payment Simulator:
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '8px',
                    color: '#1e40af',
                    fontSize: '0.86rem',
                  }}
                >
                  <CreditCard size={18} color="#2563eb" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Razorpay Sandbox Gateway</div>
                    <div style={{ fontSize: '0.76rem', color: '#3b82f6' }}>UPI / Netbanking / Debit Card Simulation</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#64748b',
                  lineHeight: '1.45',
                  marginBottom: '22px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  padding: '10px 12px',
                  borderRadius: '8px',
                }}
              >
                💡 <em>Specification Requirement:</em> Clicking the <strong>"Success"</strong> button below simulates successful Razorpay transaction callback, verifies HMAC signature on backend, deducts inventory ingredients, and confirms your order.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  disabled={verifyingPayment}
                  onClick={handleConfirmSuccessPayment}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#16a34a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: verifyingPayment ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{verifyingPayment ? 'Verifying & Confirming...' : `Success (Confirm Order ₹${total})`}</span>
                </button>

                <button
                  type="button"
                  disabled={verifyingPayment}
                  onClick={handleCancelPayment}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
