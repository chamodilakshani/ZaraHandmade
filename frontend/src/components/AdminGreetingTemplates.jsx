import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Resizes + compresses an image file in the browser before sending it to the
// backend as a base64 string, so uploads stay small and don't need a file server.
function fileToCompressedDataUrl(file, maxWidth = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Could not read that image file'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.readAsDataURL(file);
  });
}

export default function AdminGreetingTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'url'
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [processingFile, setProcessingFile] = useState(false);
  const [textColor, setTextColor] = useState('#3c322c');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setTemplates(await api.getGreetingTemplates());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setError('');
    setProcessingFile(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImage(dataUrl);
      setImagePreview(dataUrl);
    } catch (err) {
      setError(err.message || 'Could not process that image');
    } finally {
      setProcessingFile(false);
    }
  };

  const switchSource = (source) => {
    setImageSource(source);
    setImage('');
    setImagePreview('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !image.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.addGreetingTemplate({ name: name.trim(), occasion: occasion.trim(), image: image.trim(), textColor });
      setName('');
      setOccasion('');
      setImage('');
      setImagePreview('');
      setTextColor('#3c322c');
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err) {
      setError(err.message || 'Failed to add template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template? Customers will no longer be able to pick it.')) return;
    try {
      await api.deleteGreetingTemplate(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete template');
    }
  };

  return (
    <section style={styles.page}>
      <div style={styles.heading}>
        <div style={styles.eyebrow}>Greeting cards</div>
        <h1 style={styles.h1}>Manage greeting card templates</h1>
        <p style={styles.sub}>Upload a background image and pick a text color — customers will choose from these in the gallery.</p>
      </div>

      <form onSubmit={handleAdd} style={styles.form}>
        <div style={styles.row}>
          <label style={styles.field}>
            <span>Template name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Golden Birthday" required />
          </label>
          <label style={styles.field}>
            <span>Occasion (optional)</span>
            <input value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Birthday" />
          </label>
        </div>
        <label style={styles.field}>
          <span>Background image</span>
          <div style={styles.sourceToggle}>
            <button
              type="button"
              style={{ ...styles.sourceBtn, ...(imageSource === 'upload' ? styles.sourceBtnActive : {}) }}
              onClick={() => switchSource('upload')}
            >
              Upload from device
            </button>
            <button
              type="button"
              style={{ ...styles.sourceBtn, ...(imageSource === 'url' ? styles.sourceBtnActive : {}) }}
              onClick={() => switchSource('url')}
            >
              Image URL
            </button>
          </div>

          {imageSource === 'upload' ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={styles.input}
              />
              {processingFile && <span style={styles.hint}>Processing image…</span>}
            </>
          ) : (
            <input
              value={image}
              onChange={(e) => { setImage(e.target.value); setImagePreview(e.target.value); }}
              placeholder="https://..."
              style={styles.input}
            />
          )}

          {imagePreview && (
            <div style={styles.previewThumbWrap}>
              <img src={imagePreview} alt="Preview" style={styles.previewThumb} onError={() => setError('Could not load that image')} />
            </div>
          )}
        </label>
        <label style={{ ...styles.field, maxWidth: 220 }}>
          <span>Text color (for legibility over the image)</span>
          <div style={styles.colorRow}>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={styles.colorSwatch} />
            <input value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ ...styles.input, flex: 1 }} />
          </div>
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.btnPrimary} disabled={saving || processingFile}>
          {saving ? 'Adding…' : 'Add template'}
        </button>
      </form>

      {loading ? (
        <div style={styles.empty}>Loading templates...</div>
      ) : templates.length === 0 ? (
        <div style={styles.empty}>No templates yet — add your first one above.</div>
      ) : (
        <div style={styles.grid}>
          {templates.map((t) => (
            <div key={t._id} style={styles.card}>
              <div style={styles.thumbWrap}>
                <img src={t.image} alt={t.name} style={styles.thumb} />
              </div>
              <div style={styles.cardBody}>
                <strong>{t.name}</strong>
                {t.occasion && <span style={styles.badge}>{t.occasion}</span>}
                <div style={styles.swatchRow}>
                  <span style={{ ...styles.swatchDot, background: t.textColor }} />
                  <span style={styles.swatchLabel}>{t.textColor}</span>
                </div>
                <button type="button" style={styles.btnDelete} onClick={() => handleDelete(t._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  page: { maxWidth: 980, margin: '0 auto', padding: '32px 20px 56px' },
  heading: { marginBottom: 24 },
  eyebrow: { fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C97E8B', fontWeight: 700 },
  h1: { fontFamily: "'Fraunces', serif", fontSize: 28, margin: '6px 0' },
  sub: { color: '#526158', fontSize: 14, margin: 0 },

  form: { background: '#fff', border: '1px solid #E6E0D6', borderRadius: 18, padding: 24, marginBottom: 32, boxShadow: '0 10px 30px rgba(70,85,76,0.08)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'block', marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#526158' },
  input: { display: 'block', width: '100%', marginTop: 6, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E6E0D6', fontSize: 14, fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' },
  sourceToggle: { display: 'flex', gap: 8, marginTop: 6, marginBottom: 10 },
  sourceBtn: { flex: 1, padding: '9px 0', borderRadius: 999, border: '1.5px solid #E6E0D6', background: '#fff', color: '#526158', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' },
  sourceBtnActive: { background: '#6F947C', borderColor: '#6F947C', color: '#fff' },
  hint: { display: 'block', marginTop: 8, fontSize: 12.5, color: '#7E827A' },
  previewThumbWrap: { marginTop: 12, width: 140, aspectRatio: '600 / 800', borderRadius: 10, overflow: 'hidden', border: '1px solid #E6E0D6', background: '#F3EDE4' },
  previewThumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  colorRow: { display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' },
  colorSwatch: { width: 44, height: 40, padding: 2, border: '1.5px solid #E6E0D6', borderRadius: 8, cursor: 'pointer' },
  error: { color: '#A86472', fontSize: 13, fontWeight: 700, margin: '0 0 12px' },
  btnPrimary: { background: '#6F947C', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 999, fontWeight: 700, fontSize: 14, cursor: 'pointer' },

  empty: { textAlign: 'center', padding: '50px 20px', color: '#7E827A' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 },
  card: { border: '1px solid #E6E0D6', borderRadius: 16, overflow: 'hidden', background: '#fff' },
  thumbWrap: { aspectRatio: '600 / 800', background: '#F3EDE4' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardBody: { padding: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  badge: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A86472', fontWeight: 700 },
  swatchRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 },
  swatchDot: { width: 14, height: 14, borderRadius: '50%', border: '1px solid #E6E0D6' },
  swatchLabel: { fontSize: 12, color: '#7E827A' },
  btnDelete: { marginTop: 10, background: 'none', border: '1px solid #E6E0D6', color: '#A86472', padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }
};