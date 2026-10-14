import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Pizza, Clock } from 'lucide-react';
import apiClient from '../api/apiClient';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await apiClient.get(`/orders/${id}`);
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '640px', textAlign: 'center' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#dcfce7',
        color: '#16a34a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px auto',
      }}>
        <CheckCircle2 size={48} />
      </div>

      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '8px' }}>
        Order Placed Successfully!
      </h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', marginBottom: '28px' }}>
        Thank you! Your payment was verified and our kitchen is preparing your artisan pizza.
      </p>

      <div className="card" style={{ padding: '24px', textAlign: 'left', marginBottom: '28px', backgroundColor: '#fffaf5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--color-muted)' }}>Order ID:</span>
          <span style={{ fontWeight: 800 }}>#{id?.slice(-8).toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--color-muted)' }}>Payment Status:</span>
          <span className="badge badge-veg">Verified & Paid</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--color-muted)' }}>Initial Status:</span>
          <span className="badge badge-special">Order Received</span>
        </div>
        {order && (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fed7aa', paddingTop: '12px', fontWeight: 800, fontSize: '1.1rem' }}>
            <span>Total Paid:</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{order.totalAmount}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <Link to={`/track/${id}`} className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: 'var(--radius-full)' }}>
          <Clock size={18} />
          Track Live Delivery Status
          <ArrowRight size={18} />
        </Link>
        <Link to="/" className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
