import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Adjust if your logo isn't served from /logo/logo.png
// (files placed in /public are served from the site root).
const LOGO_SRC = '/logo/logo.jpeg';

const CARD_W = 600;
const CARD_H = 800;
const GOLD = '#D8B96E';

export default function GreetingCard({ greetingCard, onAddToGift }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [heading, setHeading] = useState(greetingCard?.heading || '');
  const [recipient, setRecipient] = useState(greetingCard?.recipient || '');
  const [signature, setSignature] = useState(greetingCard?.signature || 'With love');
  const [downloading, setDownloading] = useState(false);

  const previewRef = useRef(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      setTemplates(await api.getGreetingTemplates());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chooseTemplate = (tpl) => {
    setSelected(tpl);
    setHeading(tpl.occasion ? `Happy ${tpl.occasion}` : 'A Special Note');
  };

  const card = {
    templateId: selected?._id,
    image: selected?.image,
    occasion: selected?.occasion || '',
    heading: heading.trim() || 'A special gift',
    recipient: recipient.trim() || 'For you',
    signature: signature.trim() || 'With love'
  };

  // ---- Canvas export (draws the background image "cover"-style + text) ----
  const downloadCard = () => {
    if (!selected) return;
    setDownloading(true);

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2.5;
      canvas.width = CARD_W * scale;
      canvas.height = CARD_H * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // cover-fit background image
      const imgRatio = bgImg.width / bgImg.height;
      const cardRatio = CARD_W / CARD_H;
      let dw, dh, dx, dy;
      if (imgRatio > cardRatio) {
        dh = CARD_H; dw = bgImg.width * (CARD_H / bgImg.height);
        dx = (CARD_W - dw) / 2; dy = 0;
      } else {
        dw = CARD_W; dh = bgImg.height * (CARD_W / bgImg.width);
        dx = 0; dy = (CARD_H - dh) / 2;
      }
      ctx.drawImage(bgImg, dx, dy, dw, dh);

      drawTextLayer(ctx, selected.textColor || '#3c322c');

      const finish = (blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `greeting-card-${(selected.name || 'card').toLowerCase().replace(/\s+/g, '-')}.jpg`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
        setDownloading(false);
      };

      try {
        canvas.toBlob((blob) => finish(blob), 'image/jpeg', 0.95);
      } catch (err) {
        // Canvas got tainted by a cross-origin image without CORS headers
        console.error(err);
        alert("Couldn't export this image — the template's image host may not allow downloads. Try a different template or an image URL that allows CORS.");
        setDownloading(false);
      }
    };
    bgImg.onerror = () => {
      setDownloading(false);
      alert('Could not load the template image for export.');
    };
    bgImg.src = selected.image;
  };

  const drawTextLayer = (ctx, textColor) => {
    // Semi-transparent legibility panel behind the text block
    const panelY = 300, panelH = 300;
    ctx.fillStyle = 'rgba(255,255,255,0.84)';
    roundRect(ctx, 40, panelY, CARD_W - 80, panelH, 22);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;

    // heading
    ctx.font = "600 26px Georgia, 'Times New Roman', serif";
    wrapText(ctx, card.heading.toUpperCase(), CARD_W / 2, panelY + 56, CARD_W - 130, 32);

    // gold divider
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(CARD_W / 2 - 40, panelY + 90);
    ctx.lineTo(CARD_W / 2 + 40, panelY + 90);
    ctx.stroke();

    // recipient
    ctx.font = "italic 44px 'Brush Script MT', 'Segoe Script', cursive";
    ctx.fillText(fitText(ctx, card.recipient, CARD_W - 110), CARD_W / 2, panelY + 165);

    // gold divider
    ctx.beginPath();
    ctx.moveTo(CARD_W / 2 - 40, panelY + 200);
    ctx.lineTo(CARD_W / 2 + 40, panelY + 200);
    ctx.stroke();

    // signature
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText(fitText(ctx, card.signature, CARD_W - 130), CARD_W / 2, panelY + 250);
  };

  return (
    <section style={styles.page}>
      <div style={styles.intro}>
        <img src={LOGO_SRC} alt="Shop logo" style={styles.introLogo} />
        <div style={styles.eyebrow}>A little extra love</div>
        <h1 style={styles.h1}>{selected ? 'Personalize your card' : 'Choose a greeting card'}</h1>
        <p style={styles.introText}>
          {selected
            ? 'Add your message below — your card updates live as you type.'
            : 'Pick a design from the gallery, then add your own message.'}
        </p>
      </div>

      {!selected ? (
        loading ? (
          <div style={styles.emptyState}>Loading templates...</div>
        ) : templates.length === 0 ? (
          <div style={styles.emptyState}>No greeting card templates yet — check back soon.</div>
        ) : (
          <div style={styles.gallery}>
            {templates.map((tpl) => (
              <button key={tpl._id} type="button" style={styles.galleryCard} onClick={() => chooseTemplate(tpl)}>
                <div style={{ ...styles.galleryThumbWrap }}>
                  <img src={tpl.image} alt={tpl.name} style={styles.galleryThumb} />
                </div>
                <div style={styles.galleryLabel}>
                  <strong>{tpl.name}</strong>
                  {tpl.occasion && <span style={styles.galleryBadge}>{tpl.occasion}</span>}
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <div style={styles.layout}>
          <div style={styles.form}>
            <button type="button" style={styles.backLink} onClick={() => setSelected(null)}>&larr; Choose a different design</button>

            <label style={styles.label} htmlFor="card-heading">Main message</label>
            <input
              id="card-heading" style={styles.input}
              value={heading} maxLength={40}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Happy Birthday"
            />

            <label style={styles.label} htmlFor="card-recipient">Recipient</label>
            <input
              id="card-recipient" style={styles.input}
              value={recipient} maxLength={32}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Nethmi"
            />

            <label style={styles.label} htmlFor="card-signature">Closing</label>
            <input
              id="card-signature" style={styles.input}
              value={signature} maxLength={40}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Love ❤️"
            />

            <div style={styles.actions}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={downloadCard} disabled={downloading}>
                {downloading ? 'Preparing…' : 'Download as JPG'}
              </button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => onAddToGift(card)}>
                Add to gift
              </button>
            </div>
          </div>

          <div style={styles.cardWrap} ref={previewRef}>
            <div style={{ ...styles.previewBg, backgroundImage: `url(${selected.image})` }}>
              <div style={styles.previewPanel}>
                <div style={{ ...styles.previewHeading, color: selected.textColor || '#3c322c' }}>{card.heading}</div>
                <div style={styles.previewDivider} />
                <div style={{ ...styles.previewRecipient, color: selected.textColor || '#3c322c' }}>{card.recipient}</div>
                <div style={styles.previewDivider} />
                <div style={{ ...styles.previewSignature, color: selected.textColor || '#3c322c' }}>{card.signature}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- canvas text helpers ---------- */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 3 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + '…';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

/* ---------- styles ---------- */

const styles = {
  page: { maxWidth: 1040, margin: '0 auto', padding: '32px 20px 56px', fontFamily: 'Georgia, serif', color: '#3c322c' },
  intro: { textAlign: 'center', marginBottom: 32 },
  introLogo: { width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d9ac4a', marginBottom: 10 },
  eyebrow: { fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a6b4f', marginBottom: 8 },
  h1: { fontSize: 'clamp(24px, 4vw, 34px)', margin: '0 0 10px', fontWeight: 400 },
  introText: { fontSize: 15, color: '#6b5f56', maxWidth: 460, margin: '0 auto', lineHeight: 1.5 },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#8a8390', fontFamily: "'Outfit', sans-serif" },

  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 20,
    maxWidth: 900,
    margin: '0 auto'
  },
  galleryCard: {
    border: '1px solid #eee0d0',
    borderRadius: 18,
    background: '#fffdfa',
    padding: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  galleryThumbWrap: {
    aspectRatio: `${CARD_W} / ${CARD_H}`,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#f3ede4'
  },
  galleryThumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  galleryLabel: { padding: '10px 4px 2px', display: 'flex', flexDirection: 'column', gap: 4 },
  galleryBadge: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a8763f' },

  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 360px) minmax(240px, 320px)',
    gap: 40,
    alignItems: 'start',
    justifyContent: 'center'
  },
  form: { background: '#fffdfa', border: '1px solid #eee0d0', borderRadius: 18, padding: '22px 24px 26px' },
  backLink: { background: 'none', border: 'none', color: '#a8763f', fontFamily: 'Georgia, serif', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 },
  label: { display: 'block', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a6b4f', margin: '16px 0 6px', fontFamily: 'Georgia, serif' },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 15,
    border: '1px solid #e3cdb8', borderRadius: 10, background: '#fffdfa', color: '#3c322c',
    fontFamily: 'Georgia, serif', outline: 'none'
  },
  actions: { display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' },
  btn: { border: 'none', borderRadius: 999, padding: '12px 22px', fontSize: 14, fontFamily: 'Georgia, serif', letterSpacing: '0.03em', cursor: 'pointer' },
  btnPrimary: { background: 'linear-gradient(135deg, #C97E8B, #A86472)', color: '#fff8f2', boxShadow: '0 6px 16px rgba(168,100,114,0.3)' },
  btnSecondary: { background: '#fffdfa', color: '#8a6b4f', border: '1px solid #e3cdb8' },

  cardWrap: { width: '100%', maxWidth: 320, aspectRatio: `${CARD_W} / ${CARD_H}`, margin: '0 auto', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 40px rgba(60,50,44,0.16)' },
  previewBg: { width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10%', boxSizing: 'border-box' },
  previewPanel: { width: '100%', background: 'rgba(255,255,255,0.84)', borderRadius: 18, padding: '22px 18px', textAlign: 'center' },
  previewHeading: { fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 15, letterSpacing: '1px', textTransform: 'uppercase' },
  previewDivider: { width: 44, height: 1, background: '#D8B96E', margin: '14px auto' },
  previewRecipient: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontStyle: 'italic', fontSize: 28 },
  previewSignature: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15 }
};