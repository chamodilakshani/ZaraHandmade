import React from 'react';

export default function MyOrders({ orders }) {
  return (
    <section className="section" style={{ maxWidth: 800 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 26 }}>📦 Your Order History</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 40 }}>🌸</p>
          <p>No orders yet. Start shopping!</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="card order-row">
            <div>
              <h4 style={{ margin: '0 0 6px' }}>
                {o.type === 'custom' ? `💐 ${o.customDetails?.flowerType} Bouquet (Custom)` : `🛍️ ${o.items.length} item${o.items.length > 1 ? 's' : ''}`}
              </h4>
              <p style={{ margin: '2px 0', fontSize: 13, color: '#8A7A80' }}>
                {o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}
              </p>
              {o.customDetails?.wrapColor && (
                <p style={{ margin: '2px 0', fontSize: 13, color: '#8A7A80' }}>Wrapper: {o.customDetails.wrapColor}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#8F2A48', marginBottom: 6 }}>Rs. {o.total}.00</div>
              <span className={`status-pill ${o.status === 'Completed' ? 'status-completed' : 'status-processing'}`}>
                {o.status}
              </span>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
