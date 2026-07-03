import React, { useState } from 'react';
import { api } from '../api';

const FLOWERS = ['Roses', 'Lilies', 'Tulips', 'Sunflowers', 'Orchids'];
const WRAPS = ['Pink', 'White', 'Blue', 'Gold', 'Sage'];
const BASE_PRICE = 1500;

export default function CustomBouquet({ onOrderPlaced }) {
  const [flowerType, setFlowerType] = useState(FLOWERS[0]);
  const [wrapColor, setWrapColor] = useState(WRAPS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.placeOrder({
        type: 'custom',
        customDetails: { flowerType, wrapColor, notes },
        items: [{ name: `Custom ${flowerType} Bouquet`, price: BASE_PRICE, qty: 1, image: '' }],
        total: BASE_PRICE
      });
      alert('Your custom bouquet order has been sent! 🌸');
      setNotes('');
      onOrderPlaced();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="card form-card">
        <div className="eyebrow">Made just for you</div>
        <h2 style={{ margin: '6px 0 24px' }}>Build Your Bouquet ✨</h2>

        <label className="field-label">Choose flower type</label>
        <select className="field-input" value={flowerType} onChange={(e) => setFlowerType(e.target.value)}>
          {FLOWERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <label className="field-label">Wrapper color</label>
        <div className="swatch-row">
          {WRAPS.map((color) => (
            <div
              key={color}
              className={`swatch ${wrapColor === color ? 'active' : ''}`}
              onClick={() => setWrapColor(color)}
            >
              {color}
            </div>
          ))}
        </div>

        <label className="field-label">Special instructions</label>
        <textarea
          className="field-input"
          style={{ height: 100, resize: 'vertical' }}
          placeholder="Occasion, message card, delivery notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="gift-tag" style={{ marginBottom: 18 }}>Starting at Rs. {BASE_PRICE}.00</div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Sending…' : 'Place Custom Order ✨'}
        </button>
      </div>
    </section>
  );
}
