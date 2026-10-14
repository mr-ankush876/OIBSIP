import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

const OrderHistoryPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiClient.get('/orders/my-orders');
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '840px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
          {t('nav.myOrders')}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          View and track all your previous SliceCraft pizza deliveries
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '40px 0' }}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Package size={48} style={{ margin: '0 auto 16px auto', color: 'var(--color-muted)' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>You haven't ordered any pizzas yet.</p>
          <Link to="/menu" className="btn btn-primary">Order Now</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700 }}>
                    ORDER #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${order.orderStatus === 'Cancelled' ? 'badge-danger' : order.orderStatus === 'Delivered' ? 'badge-veg' : 'badge-special'}`}>
                    {order.orderStatus}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ fontSize: '0.88rem', color: 'var(--color-dark)', padding: '10px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                {order.items.map((i, idx) => (
                  <span key={idx}>
                    {i.quantity}x {i.name}{idx < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  to={`/track/${order._id}`}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
                >
                  <Clock size={16} /> Track Live Progress <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
