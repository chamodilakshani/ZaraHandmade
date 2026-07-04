import React, { useState } from 'react';
import { api } from '../api';
import { StoreIcon, TrashIcon, SparkleIcon } from './Icons';
import ImagePlaceholder from './ImagePlaceholder';

export default function AdminProducts({ products, refresh }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Flower Bouquet');
  const [productType, setProductType] = useState('Handmade');
  const [submitting, setSubmitting] = useState(false);
  const isGiftBox = category === 'Gift Box';

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addProduct({ name, price: Number(price), image, desc, category, productType: isGiftBox ? '' : productType });
      setName(''); setPrice(''); setImage(''); setDesc('');
      setCategory('Flower Bouquet'); setProductType('Handmade');
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
      <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <StoreIcon width={24} height={24} /> Product Management
      </h2>

      <form onSubmit={handleAdd} className="card form-card admin-grid" style={{ marginBottom: 36 }}>
        <input className="field-input" placeholder="Product name" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field-input" type="number" placeholder="Price (Rs)" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <select
          className="field-input"
          value={category}
          onChange={(e) => {
            const nextCategory = e.target.value;
            setCategory(nextCategory);
            setProductType(nextCategory === 'Gift Box' ? '' : 'Handmade');
          }}
        >
          <option value="Flower Bouquet">Flower Bouquet</option>
          <option value="Gift Box">Gift Box</option>
        </select>
        <select
          className="field-input"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          disabled={isGiftBox}
          title={isGiftBox ? 'Gift box products do not use flower type filters' : undefined}
        >
          {isGiftBox && <option value="">Not applicable for gift boxes</option>}
          <option value="Handmade">Handmade</option>
          <option value="Fresh Flowers">Fresh Flowers</option>
        </select>
        <input className="field-input" style={{ gridColumn: 'span 2' }} placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <textarea className="field-input" style={{ gridColumn: 'span 2', height: 80 }} placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button className="btn-primary" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={submitting}>
          <SparkleIcon width={16} height={16} /> {submitting ? 'Saving…' : 'Save Product'}
        </button>
      </form>

      <div className="admin-products-grid">
        {products.map((p) => (
          <div key={p._id} className="card admin-product-card">
            <ImagePlaceholder src={p.image} alt={p.name} className="admin-thumb" />
            <h4 style={{ margin: '4px 0' }}>{p.name}</h4>
            <div className="admin-product-meta">
              <span>{p.category || 'Flower Bouquet'}</span>
              {p.productType && <span>{p.productType}</span>}
            </div>
            <div className="gift-tag" style={{ marginBottom: 10 }}>Rs. {p.price}.00</div>
            <button
              onClick={() => handleDelete(p._id)}
              style={{ background: '#FFE1E9', color: '#D41C4C', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <TrashIcon width={14} height={14} /> Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
