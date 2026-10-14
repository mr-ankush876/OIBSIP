import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, ChefHat, Truck, PackageCheck, XCircle, MessageCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../api/apiClient';

const OrderTimeline = ({ orderId, initialOrder = null }) => {
  const { t } = useTranslation();
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const STATUS_STEPS = [
    { key: 'Order Received', label: t('tracking.statusReceived'), icon: Clock },
    { key: 'In Kitchen', label: t('tracking.statusKitchen'), icon: ChefHat },
    { key: 'Sent to Delivery', label: t('tracking.statusDelivery'), icon: Truck },
    { key: 'Delivered', label: t('tracking.statusDelivered'), icon: PackageCheck },
  ];

  // Fetch order data
  const fetchOrder = async () => {
    try {
      if (!orderId) return;
      const data = await apiClient.get(`/orders/${orderId}`);
      if (data.success && data.order) {
        setOrder(data.order);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(`[Tracking Error] ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Subscribe to Socket.IO order room
    if (orderId) {
      joinOrderRoom(orderId);
    }

    if (socket) {
      const handleStatusUpdate = (data) => {
        if (data.orderId === orderId) {
          console.log(`[Socket.IO Event] Order status updated in real-time to: ${data.orderStatus}`);
          setOrder((prev) => (prev ? { ...prev, orderStatus: data.orderStatus, statusHistory: data.statusHistory || prev.statusHistory } : prev));
          setLastUpdated(new Date());
        }
      };

      socket.on('order_status_updated', handleStatusUpdate);

      return () => {
        socket.off('order_status_updated', handleStatusUpdate);
        leaveOrderRoom(orderId);
      };
    }
  }, [orderId, socket]);

  // Polling fallback every 5 seconds (Requirement 12)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
        Order not found or tracking unavailable.
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  const getStatusTimestamp = (statusName) => {
    if (!order.statusHistory) return null;
    const historyItem = order.statusHistory.find((h) => h.status === statusName);
    return historyItem ? new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  };

  const openOrderWhatsAppSupport = () => {
    const msg = encodeURIComponent(`Hello! I need help with my Order #${order._id.slice(-6).toUpperCase()} on SliceCraft Pizza. Current Status: ${order.orderStatus}`);
    window.open(`https://wa.me/919876543210?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card" style={{ padding: '32px 24px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            {t('tracking.orderNumber')}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark)', letterSpacing: '0.5px' }}>
            #{order._id.slice(-8).toUpperCase()}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            {t('tracking.placedOn')}: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div style={{ marginTop: '4px' }}>
            <span className={`badge ${isCancelled ? 'badge-danger' : order.paymentStatus === 'COMPLETED' ? 'badge-veg' : 'badge-special'}`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled ? (
        <div style={{
          backgroundColor: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          fontWeight: 700,
        }}>
          <XCircle size={28} />
          <div>
            <div style={{ fontSize: '1.1rem' }}>Order Cancelled</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              This order was cancelled and inventory was restored.
            </div>
          </div>
        </div>
      ) : (
        /* Progress Steps Timeline */
        <div style={{ margin: '36px 0', position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            position: 'relative',
          }}>
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;
              const time = getStatusTimestamp(step.key);

              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                  {/* Step Circle */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--color-primary)' : isPast ? '#16a34a' : '#f1f5f9',
                    color: isPast ? '#ffffff' : 'var(--color-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    boxShadow: isCurrent ? '0 0 0 6px rgba(214, 40, 40, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {isPast && !isCurrent ? <CheckCircle2 size={24} /> : <StepIcon size={24} />}
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: isCurrent ? 800 : isPast ? 700 : 500,
                    color: isCurrent ? 'var(--color-primary)' : isPast ? 'var(--color-dark)' : 'var(--color-muted)',
                    lineHeight: '1.2',
                    marginBottom: '4px',
                  }}>
                    {step.label}
                  </span>

                  {/* Timestamp */}
                  {time && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                      {time}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Badge & Fallback Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8rem',
        color: 'var(--color-muted)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            display: 'inline-block',
            animation: 'pulse 1.5s infinite',
          }} />
          <span>{t('tracking.liveUpdates')}</span>
        </div>
        <span>Last checked: {lastUpdated.toLocaleTimeString()}</span>
      </div>

      {/* Order Item Details */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-dark)' }}>
          Items in this Order
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <strong>{item.quantity}x {item.name}</strong>
                {item.isCustom && item.customDetails && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                    Base: {item.customDetails.baseName} | Sauce: {item.customDetails.sauceName} | Cheese: {item.customDetails.cheeseName}
                    {item.customDetails.vegetableNames?.length > 0 && ` | Veggies: ${item.customDetails.vegetableNames.join(', ')}`}
                  </div>
                )}
              </div>
              <span style={{ fontWeight: 700 }}>₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
          <span>Total Paid</span>
          <span style={{ color: 'var(--color-primary)' }}>₹{order.totalAmount}</span>
        </div>
      </div>

      {/* WhatsApp Help CTA (Section 19.6 Order-Specific Support) */}
      <div style={{ marginTop: '28px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={openOrderWhatsAppSupport}
          className="btn btn-outline"
          style={{
            borderColor: '#25D366',
            color: '#128C7E',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <MessageCircle size={18} color="#25D366" />
          {t('tracking.chatWhatsApp')}
        </button>
      </div>
    </div>
  );
};

export default OrderTimeline;
