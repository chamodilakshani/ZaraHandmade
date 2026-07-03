import React from 'react';
import { api } from '../api';

export default function AdminOrders({ orders, refresh }) {
  const handleComplete = async (id) => {
    try {
      await api.completeOrder(id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="section" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
        <h2 style={{ margin: 0 }}>📊 Order Management</h2>
        <div className="gift-tag">Total: {orders.length}</div>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">No orders yet.</div>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="card order-row">
            <div>
              <h4 style={{ margin: '0 0 6px' }}>
                {o.type === 'custom' ? `💐 Custom ${o.customDetails?.flowerType} Bouquet` : o.items.map((i) => i.name).join(', ')}
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: '#8A7A80' }}>By: <strong>{o.username}</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#8F2A48', marginBottom: 8 }}>Rs. {o.total}.00</div>
              {o.status === 'Completed' ? (
                <span className="status-pill status-completed">Completed</span>
              ) : (
                <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => handleComplete(o._id)}>
                  Mark Complete ✅
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
