import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Clock, ArrowRight } from 'lucide-react';
import OrderTimeline from '../components/tracking/OrderTimeline';

const OrderTrackingPage = () => {
  const { t } = useTranslation();
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim()}`);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
          {t('tracking.title')}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          Follow your pizza from the hot oven to your front doorstep in real time
        </p>
      </div>

      {/* Search Order Bar if no paramId */}
      {!paramId && (
        <div className="card" style={{ maxWidth: '520px', margin: '0 auto 40px auto', padding: '24px' }}>
          <form onSubmit={handleSearch}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Enter Your Order ID to Track:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="e.g. 666ab... or check My Orders"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="form-control"
                required
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Search size={16} /> Track
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Render Timeline */}
      {paramId ? (
        <div>
          <OrderTimeline orderId={paramId} />
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--color-muted)', marginTop: '20px' }}>
          <Clock size={48} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <p>Please enter an order ID above or view your previous orders from your account profile.</p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
