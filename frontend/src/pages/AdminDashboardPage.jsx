import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const AdminDashboardPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'inventory', 'alerts'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Filter states
  const [orderFilter, setOrderFilter] = useState('All');
  const [inventoryCategory, setInventoryCategory] = useState('All');

  // Restock modal state
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [newStockQty, setNewStockQty] = useState('');
  const [restockReason, setRestockReason] = useState('RESTOCK');
  const [restockNotes, setRestockNotes] = useState('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Test Alert state
  const [testAlertResult, setTestAlertResult] = useState(null);
  const [triggeringAlert, setTriggeringAlert] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, invRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/orders'),
        apiClient.get('/admin/inventory'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (invRes.success) setInventory(invRes.ingredients);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await apiClient.get('/admin/inventory/logs');
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load inventory logs', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'alerts' && isAdmin) {
      fetchLogs();
    }
  }, [activeTab, isAdmin]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await apiClient.put(`/admin/orders/${orderId}/status`, { newStatus });
      if (res.success) {
        setMessage(`Order #${orderId.slice(-6).toUpperCase()} updated to '${newStatus}'!`);
        fetchDashboardData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleStockUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    setIsUpdatingStock(true);
    try {
      const res = await apiClient.put(`/admin/inventory/${selectedIngredient._id}`, {
        stockQuantity: parseInt(newStockQty, 10),
        reason: restockReason,
        notes: restockNotes,
      });

      if (res.success) {
        setSelectedIngredient(null);
        setNewStockQty('');
        setRestockNotes('');
        setMessage(`Stock updated for ${res.ingredient.name}!`);
        fetchDashboardData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      alert(err.message || 'Stock update failed');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleTriggerAlertTest = async () => {
    setTriggeringAlert(true);
    setTestAlertResult(null);
    try {
      const res = await apiClient.post('/admin/inventory/test-alert', {});
      if (res.success) {
        setTestAlertResult(res.result);
      }
    } catch (err) {
      alert(err.message || 'Failed to trigger low stock alert');
    } finally {
      setTriggeringAlert(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--color-muted)' }}>Loading store administration console...</p>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'All') return true;
    return o.orderStatus === orderFilter;
  });

  const filteredInventory = inventory.filter((i) => {
    if (inventoryCategory === 'All') return true;
    return i.category === inventoryCategory;
  });

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="badge badge-special" style={{ marginBottom: '6px' }}>
            Store Management Panel
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
            SliceCraft Admin Operations
          </h1>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}
        >
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {message && (
        <div style={{
          backgroundColor: 'var(--color-success-light)',
          color: 'var(--color-success)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontWeight: 700,
        }}>
          ✓ {message}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--color-primary)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Revenue
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-dark)', marginTop: '4px' }}>
            ₹{stats?.totalRevenue || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>{stats?.completedOrders || 0} Completed Orders</span>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Kitchen Queue
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-dark)', marginTop: '4px' }}>
            {stats?.pendingOrders || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Orders in Kitchen or Transit</span>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Low-Stock Ingredients
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            {stats?.lowStockCount || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Below configured threshold</span>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Catalogue Items
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-dark)', marginTop: '4px' }}>
            {stats?.totalIngredients || 0}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Bases, Sauces, Cheeses, Veggies</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--color-border)', marginBottom: '28px' }}>
        {[
          { id: 'orders', label: 'Order Management', icon: Package, count: orders.length },
          { id: 'inventory', label: 'Inventory Management', icon: Layers, count: inventory.length },
          { id: 'alerts', label: 'Low-Stock Alerts & Logs', icon: Bell, count: stats?.lowStockCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? '#fee2e2' : '#f1f5f9',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Status Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {['All', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: orderFilter === st ? '#111827' : '#ffffff',
                  color: orderFilter === st ? '#ffffff' : 'var(--color-dark)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                No orders found under selected filter.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                          ORDER #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className={`badge ${order.orderStatus === 'Cancelled' ? 'badge-danger' : order.orderStatus === 'Delivered' ? 'badge-veg' : 'badge-special'}`}>
                          {order.orderStatus}
                        </span>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                          Pay: {order.paymentStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                        Customer: <strong>{order.customer?.name}</strong> ({order.customer?.email}) • {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Status Update Transition Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Update Status:</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                        className="form-control"
                        style={{ width: 'auto', fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        <option value="Order Received" disabled={order.orderStatus !== 'Order Received'}>Order Received</option>
                        <option value="In Kitchen" disabled={order.orderStatus !== 'Order Received'}>In Kitchen</option>
                        <option value="Sent to Delivery" disabled={order.orderStatus !== 'In Kitchen'}>Sent to Delivery</option>
                        <option value="Delivered" disabled={order.orderStatus !== 'Sent to Delivery'}>Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Items & Recipes */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Items & Custom Specifications:</div>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ marginBottom: '6px' }}>
                        • <strong>{it.quantity}x {it.name}</strong> (₹{it.subtotal})
                        {it.isCustom && it.customDetails && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '12px' }}>
                            Base: {it.customDetails.baseName} | Sauce: {it.customDetails.sauceName} | Cheese: {it.customDetails.cheeseName}
                            {it.customDetails.vegetableNames?.length > 0 && ` | Veggies: ${it.customDetails.vegetableNames.join(', ')}`}
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Delivery Address: {order.shippingAddress?.street}, {order.shippingAddress?.city} (Phone: {order.shippingAddress?.phone})</span>
                      <span style={{ color: 'var(--color-primary)' }}>Total: ₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['All', 'base', 'sauce', 'cheese', 'vegetable'].map((cat) => (
              <button
                key={cat}
                onClick={() => setInventoryCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: inventoryCategory === cat ? 'var(--color-primary)' : '#ffffff',
                  color: inventoryCategory === cat ? '#ffffff' : 'var(--color-dark)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                {cat === 'All' ? 'All Ingredients' : `${cat}s`}
              </button>
            ))}
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px' }}>Ingredient</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Price</th>
                  <th style={{ padding: '14px 18px' }}>Current Stock</th>
                  <th style={{ padding: '14px 18px' }}>Low Stock Alert Threshold</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isLow = item.stockQuantity <= item.lowStockThreshold;
                  const isOut = item.stockQuantity < 1;

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>{item.name}</td>
                      <td style={{ padding: '14px 18px', textTransform: 'capitalize', color: 'var(--color-muted)' }}>{item.category}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 600 }}>₹{item.price}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: isOut ? 'var(--color-danger)' : isLow ? '#b45309' : 'var(--color-dark)' }}>
                        {item.stockQuantity} {item.unit || 'units'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--color-muted)' }}>
                        {item.lowStockThreshold} {item.unit || 'units'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isOut ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-special">Low Stock</span>
                        ) : (
                          <span className="badge badge-veg">In Stock</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedIngredient(item);
                            setNewStockQty(item.stockQuantity.toString());
                          }}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALERTS & MOVEMENT LOGS */}
      {activeTab === 'alerts' && (
        <div>
          {/* Low Stock Scheduled Alert Tester (Requirement 16) */}
          <div className="card" style={{ padding: '24px', marginBottom: '28px', backgroundColor: '#fffaf5', border: '1.5px solid #fed7aa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={20} />
                  Automated Low-Stock Email Monitor (node-cron)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#7c2d12', marginTop: '4px' }}>
                  Runs automatically on schedule and scans for items with stock ≤ threshold. Prevents duplicate alerts within 24 hours.
                </p>
              </div>

              <button
                onClick={handleTriggerAlertTest}
                disabled={triggeringAlert}
                className="btn btn-primary"
                style={{ backgroundColor: '#ea580c', padding: '10px 18px', fontSize: '0.88rem' }}
              >
                {triggeringAlert ? 'Testing Dispatch...' : 'Trigger On-Demand Test Scan'}
              </button>
            </div>

            {testAlertResult && (
              <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #fdba74', fontSize: '0.85rem' }}>
                <strong>Test Scan Result:</strong> Checked {testAlertResult.checkedCount} items. Dispatched alerts for {testAlertResult.alertedCount} items.
                {testAlertResult.items?.length > 0 && (
                  <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
                    {testAlertResult.items.map((it) => (
                      <li key={it._id}><strong>{it.name}</strong> (Stock: {it.stockQuantity}, Threshold: {it.lowStockThreshold})</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Movement Logs Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: '1.1rem' }}>
              Audit Trail & Stock Movement History
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Ingredient</th>
                  <th style={{ padding: '12px 16px' }}>Change</th>
                  <th style={{ padding: '12px 16px' }}>Prev ➔ New</th>
                  <th style={{ padding: '12px 16px' }}>Reason</th>
                  <th style={{ padding: '12px 16px' }}>Actor / Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)' }}>
                      No inventory movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        {log.ingredient?.name || 'Item'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: log.change < 0 ? 'var(--color-danger)' : '#16a34a' }}>
                        {log.change > 0 ? `+${log.change}` : log.change}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>
                        {log.previousQuantity} ➔ {log.newQuantity}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--color-dark)', fontSize: '0.7rem' }}>
                          {log.reason}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>
                        {log.actor?.name || 'System'}: {log.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedIngredient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Adjust Stock: {selectedIngredient.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '18px' }}>
              Current stock: <strong>{selectedIngredient.stockQuantity} {selectedIngredient.unit || 'units'}</strong>
            </p>

            <form onSubmit={handleStockUpdateSubmit}>
              <div className="form-group">
                <label className="form-label">New Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Adjustment</label>
                <select
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="form-control"
                >
                  <option value="RESTOCK">Supplier Restock</option>
                  <option value="MANUAL_ADJUSTMENT">Manual Stock Count Correction</option>
                  <option value="ORDER_CANCELLATION">Cancelled Order Return</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Shipment delivered from dairy"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStock}
                  className="btn btn-primary"
                >
                  {isUpdatingStock ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
