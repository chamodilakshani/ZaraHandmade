import React, { useState } from 'react';
import { api } from '../api';
import { SparkleIcon } from './Icons';

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
      alert('Your custom bouquet order has been sent!');
      setNotes('');
      onOrderPlaced();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section custom-section">
      <div className="card form-card custom-builder">
        <div className="builder-copy">
          <div className="eyebrow">Made just for you</div>
          <h2>
            <SparkleIcon width={22} height={22} /> Build Your Bouquet
          </h2>
          <p>Choose the blooms, wrapping, and message. Zara will handcraft it with a soft romantic finish.</p>
        </div>

        <div className="builder-preview">
          <div className="builder-preview-content">
            <span className="preview-kicker">Your arrangement</span>
            <strong>{flowerType}</strong>
            <span>{wrapColor} wrap selected</span>
            <p>Hand wrapped with premium blooms, ribbon finishing, and your personal note.</p>
          </div>
        </div>

        <label className="field-label" htmlFor="flowerType">Choose flower type</label>
        <select id="flowerType" className="field-input" value={flowerType} onChange={(e) => setFlowerType(e.target.value)}>
          {FLOWERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <label className="field-label">Wrapper color</label>
        <div className="swatch-row">
          {WRAPS.map((color) => (
            <button
              type="button"
              key={color}
              className={`swatch ${wrapColor === color ? 'active' : ''}`}
              onClick={() => setWrapColor(color)}
              aria-pressed={wrapColor === color}
            >
              {color}
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="specialNotes">Special instructions</label>
        <textarea
          id="specialNotes"
          className="field-input"
          placeholder="Occasion, message card, delivery notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="builder-total">
          <span>Live estimate</span>
          <strong>Rs. {BASE_PRICE}.00</strong>
        </div>

        <button className="btn-primary builder-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Sending...' : <>Place Custom Order <SparkleIcon width={16} height={16} /></>}
        </button>
      </div>
    </section>
  );
}
