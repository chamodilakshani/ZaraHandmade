import React, { useState } from 'react';
import { api } from '../api';

export default function AdminProducts({ products, refresh }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addProduct({ name, price: Number(price), image, desc });
      setName(''); setPrice(''); setImage(''); setDesc('');
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteProduct(id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="section" style={{ maxWidth: 900 }}>
      <h2 style={{ marginBottom: 24 }}>🛍️ Product Management</h2>

      <form onSubmit={handleAdd} className="card form-card admin-grid" style={{ marginBottom: 36 }}>
        <input className="field-input" placeholder="Product name" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field-input" type="number" placeholder="Price (Rs)" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="field-input" style={{ gridColumn: 'span 2' }} placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <textarea className="field-input" style={{ gridColumn: 'span 2', height: 80 }} placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button className="btn-primary" style={{ gridColumn: 'span 2' }} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Product ✨'}
        </button>
      </form>

      <div className="admin-products-grid">
        {products.map((p) => (
          <div key={p._id} className="card admin-product-card">
            <img src={p.image || 'https://placehold.co/300x200/FCEEE9/B3355A?text=🌸'} alt={p.name} />
            <h4 style={{ margin: '4px 0' }}>{p.name}</h4>
            <div className="gift-tag" style={{ marginBottom: 10 }}>Rs. {p.price}.00</div>
            <button
              onClick={() => handleDelete(p._id)}
              style={{ background: '#FCEAEA', color: '#B3355A', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13 }}
            >
              Delete 🗑️
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
