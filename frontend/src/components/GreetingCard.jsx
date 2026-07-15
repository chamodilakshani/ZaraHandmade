import React, { useMemo, useRef, useState } from 'react';

/* ---------- config ---------- */

// Adjust this if your logo isn't served from /logo/logo.jpeg
// (files placed in /public are served from the site root, so
// public/logo/logo.jpeg becomes reachable at "/logo/logo.jpeg").
const LOGO_SRC = '/logo/logo.jpeg';

const CARD_W = 600;
const CARD_H = 800;

/* ---------- helpers ---------- */

// Shrinks font size a touch when the text runs long, so nothing ever spills off the card.
const fitFontSize = (text, base, min, maxChars) => {
  if (!text || text.length <= maxChars) return base;
  const ratio = maxChars / text.length;
  return Math.max(min, Math.round(base * ratio));
};

/* ---------- decorative sub-components (pure SVG, no external assets) ---------- */

function Leaf({ x, y, rotate = 0, scale = 1, color }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0 C 14 -6, 26 -18, 26 -34 C 10 -30, -2 -18, 0 0 Z" fill={color} opacity="0.85" />
    </g>
  );
}

function Bloom({ x = 0, y = 0, rotate = 0, scale = 1, petal, center }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      {petals.map((a) => (
        <ellipse key={a} cx="0" cy="-11" rx="7.5" ry="12" fill={petal} opacity="0.92" transform={`rotate(${a})`} />
      ))}
      <circle r="5.5" fill={center} />
    </g>
  );
}

function CornerSprig({ flip = false, palette }) {
  const t = flip ? 'scale(-1,-1)' : '';
  return (
    <g transform={t}>
      <Leaf x={18} y={70} rotate={-20} scale={1.05} color={palette.leafDark} />
      <Leaf x={34} y={46} rotate={10} scale={0.9} color={palette.leaf} />
      <Leaf x={12} y={40} rotate={-55} scale={0.8} color={palette.leaf} />
      <Bloom x={30} y={26} rotate={-8} scale={1.15} petal={palette.petalDark} center={palette.gold} />
      <Bloom x={12} y={18} rotate={12} scale={0.85} petal={palette.petal} center={palette.gold} />
      <Bloom x={44} y={12} rotate={30} scale={0.65} petal={palette.petalLight} center={palette.gold} />
    </g>
  );
}

function Flourish({ palette, width = 220 }) {
  const half = width / 2;
  return (
    <g>
      <path d={`M ${-half} 0 C ${-half + 40} -10, -18 -10, 0 0`} stroke={palette.gold} strokeWidth="1.4" fill="none" />
      <path d={`M ${half} 0 C ${half - 40} -10, 18 -10, 0 0`} stroke={palette.gold} strokeWidth="1.4" fill="none" />
      <Bloom scale={0.7} petal={palette.petalDark} center={palette.gold} />
      <Leaf x={-14} y={-3} rotate={-140} scale={0.5} color={palette.leaf} />
      <Leaf x={14} y={-3} rotate={140} scale={0.5} color={palette.leaf} />
    </g>
  );
}

/* ---------- occasion emblem icons (share the same x,y,scale,color signature) ---------- */

function HeartIcon({ x = 0, y = 0, scale = 1, color }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0,10 C-14,0 -14,-12 -4,-12 C0,-12 0,-8 0,-6 C0,-8 0,-12 4,-12 C14,-12 14,0 0,10 Z" fill={color} />
    </g>
  );
}

function RingsIcon({ x = 0, y = 0, scale = 1, color }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx="-6" cy="0" r="8.5" fill="none" stroke={color} strokeWidth="2.6" />
      <circle cx="6" cy="0" r="8.5" fill="none" stroke={color} strokeWidth="2.6" />
    </g>
  );
}

function CapIcon({ x = 0, y = 0, scale = 1, color }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon points="-15,-3 0,-10 15,-3 0,4 -15,-3" fill={color} />
      <rect x="-2" y="4" width="4" height="11" fill={color} />
      <circle cx="13" cy="4" r="2.2" fill={color} />
    </g>
  );
}

function BowIcon({ x = 0, y = 0, scale = 1, color }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0,0 L-13,-10 L-13,3 Z" fill={color} />
      <path d="M0,0 L13,-10 L13,3 Z" fill={color} />
      <circle r="3.4" fill={color} />
    </g>
  );
}

/* ---------- occasion themes ---------- */

const OCCASIONS = [
  {
    id: 'birthday',
    label: 'Birthday',
    defaultHeading: 'Happy Birthday',
    Icon: BowIcon,
    palette: {
      bgTop: '#fff3e6', bgBottom: '#ffe3ea', border: '#e0a23c',
      ink: '#3c2f28', eyebrow: '#a8763f',
      petal: '#f0919f', petalDark: '#e0637c', petalLight: '#f7c3cd',
      leaf: '#8fb87d', leafDark: '#67995a', gold: '#e0a23c',
      dots: ['#f0919f', '#8fb87d', '#e0a23c'],
    },
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    defaultHeading: 'Happy Anniversary',
    Icon: RingsIcon,
    palette: {
      bgTop: '#fbeef0', bgBottom: '#f3dfe1', border: '#b98a4e',
      ink: '#3a2a2c', eyebrow: '#8c5a4a',
      petal: '#a8425a', petalDark: '#7d2f42', petalLight: '#cf7f92',
      leaf: '#7c8f6a', leafDark: '#5c6e4c', gold: '#c9a24a',
      dots: ['#a8425a', '#c9a24a'],
    },
  },
  {
    id: 'graduation',
    label: 'Graduation',
    defaultHeading: 'Congratulations, Graduate!',
    Icon: CapIcon,
    palette: {
      bgTop: '#eef1f8', bgBottom: '#e4e9f4', border: '#c9a227',
      ink: '#1f2a44', eyebrow: '#33436b',
      petal: '#5b76a8', petalDark: '#31456f', petalLight: '#93a8ce',
      leaf: '#5c7a5c', leafDark: '#3d5a3d', gold: '#c9a227',
      dots: ['#c9a227', '#5b76a8'],
    },
  },
  {
    id: 'valentine',
    label: 'Valentine / Love',
    defaultHeading: "Happy Valentine's Day",
    Icon: HeartIcon,
    palette: {
      bgTop: '#fff0f1', bgBottom: '#ffe1e6', border: '#c94f63',
      ink: '#3c2226', eyebrow: '#a13b4c',
      petal: '#e0546c', petalDark: '#c02e46', petalLight: '#f3a2ae',
      leaf: '#8fb87d', leafDark: '#67995a', gold: '#d98a4a',
      dots: ['#e0546c', '#d98a4a'],
    },
  },
  {
    id: 'general',
    label: 'Just Because',
    defaultHeading: 'With Love',
    Icon: BowIcon,
    palette: {
      bgTop: '#fdf3ee', bgBottom: '#eef3ea', border: '#c9a04f',
      ink: '#3c322c', eyebrow: '#8a6b4f',
      petal: '#d98a9b', petalDark: '#c06478', petalLight: '#eab8bf',
      leaf: '#9db78f', leafDark: '#758f68', gold: '#d9ac4a',
      dots: ['#d98a9b', '#9db78f', '#d9ac4a'],
    },
  },
];

const DEFAULT_HEADINGS = OCCASIONS.map((o) => o.defaultHeading);

/* ---------- main component ---------- */

export default function GreetingCard({ greetingCard, onAddToGift }) {
  const [occasionId, setOccasionId] = useState(greetingCard?.occasion || 'birthday');
  const theme = OCCASIONS.find((o) => o.id === occasionId) || OCCASIONS[0];
  const palette = theme.palette;
  const Icon = theme.Icon;

  const [heading, setHeading] = useState(greetingCard?.heading || theme.defaultHeading);
  const [recipient, setRecipient] = useState(greetingCard?.recipient || 'Nethmi');
  const [signature, setSignature] = useState(greetingCard?.signature || 'Love ❤️');
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef(null);

  const selectOccasion = (id) => {
    const next = OCCASIONS.find((o) => o.id === id);
    setOccasionId(id);
    // Only auto-fill the heading if the user hasn't typed their own message yet.
    setHeading((prev) => (!prev.trim() || DEFAULT_HEADINGS.includes(prev.trim()) ? next.defaultHeading : prev));
  };

  const card = useMemo(
    () => ({
      occasion: occasionId,
      heading: heading.trim() || 'A special gift',
      recipient: recipient.trim() || 'For you',
      signature: signature.trim() || 'With love',
    }),
    [occasionId, heading, recipient, signature]
  );

  const headingSize = fitFontSize(card.heading, 30, 18, 24);
  const recipientSize = fitFontSize(card.recipient, 56, 32, 14);
  const signatureSize = fitFontSize(card.signature, 26, 18, 26);

  const downloadCard = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    setDownloading(true);

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = 'data:image/svg+xml;base64,' + svg64;

    const img = new Image();
    img.onload = () => {
      const scale = 2.5; // crisp, print-friendly resolution
      const canvas = document.createElement('canvas');
      canvas.width = CARD_W * scale;
      canvas.height = CARD_H * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = palette.bgTop; // JPG has no transparency, paint a base first
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `greeting-card-${occasionId}.jpg`;
            link.click();
            URL.revokeObjectURL(link.href);
          }
          setDownloading(false);
        },
        'image/jpeg',
        0.95
      );
    };
    img.onerror = () => setDownloading(false);
    img.src = dataUrl;
  };

  const logoCx = CARD_W / 2;
  const logoCy = 116;
  const logoR = 54;

  return (
    <section style={styles.page}>
      <style>{`
        .dgc-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          font-size: 15px;
          border: 1px solid #e3cdb8;
          border-radius: 10px;
          background: #fffdfa;
          color: #3c322c;
          font-family: Georgia, 'Times New Roman', serif;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .dgc-input:focus {
          border-color: ${palette.gold};
          box-shadow: 0 0 0 3px ${palette.gold}30;
        }
        .dgc-label {
          display: block;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: ${palette.eyebrow};
          margin: 16px 0 6px;
          font-family: Georgia, serif;
        }
        .dgc-label:first-child { margin-top: 0; }
        .dgc-occasions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dgc-chip {
          border: 1px solid #e3cdb8;
          background: #fffdfa;
          color: #6b5f56;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 13px;
          font-family: Georgia, serif;
          cursor: pointer;
          transition: all .15s ease;
        }
        .dgc-chip:hover { border-color: ${palette.gold}; }
        .dgc-chip.active {
          background: ${palette.petalDark};
          border-color: ${palette.petalDark};
          color: #fffaf6;
        }
        .dgc-btn {
          border: none;
          border-radius: 999px;
          padding: 12px 22px;
          font-size: 14px;
          font-family: Georgia, serif;
          letter-spacing: .03em;
          cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
        }
        .dgc-btn:hover { transform: translateY(-1px); }
        .dgc-btn:active { transform: translateY(0); }
        .dgc-btn:disabled { opacity: .6; cursor: default; transform: none; }
        .dgc-btn-primary {
          background: linear-gradient(135deg, ${palette.petalDark}, ${palette.petal});
          color: #fff8f2;
          box-shadow: 0 6px 16px ${palette.petalDark}45;
        }
        .dgc-btn-secondary {
          background: #fffdfa;
          color: ${palette.eyebrow};
          border: 1px solid #e3cdb8;
        }
        @media (max-width: 720px) {
          .dgc-layout { grid-template-columns: 1fr !important; }
          .dgc-card-wrap { max-width: 280px !important; margin: 0 auto; }
        }
      `}</style>

      <div style={styles.intro}>
        <img src={LOGO_SRC} alt="Shop logo" style={styles.introLogo} />
        <div style={styles.eyebrow}>A little extra love</div>
        <h1 style={styles.h1}>Write a greeting card</h1>
        <p style={styles.introText}>
          Pick an occasion, add a keepsake note in a matching floral card, download it to share, or tuck it in with your gift.
        </p>
      </div>

      <div className="dgc-layout" style={styles.layout}>
        <div style={styles.form}>
          <label className="dgc-label">Occasion</label>
          <div className="dgc-occasions">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`dgc-chip${o.id === occasionId ? ' active' : ''}`}
                onClick={() => selectOccasion(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="dgc-label" htmlFor="card-heading">Main message</label>
          <input
            id="card-heading"
            className="dgc-input"
            value={heading}
            maxLength={40}
            onChange={(e) => setHeading(e.target.value)}
            placeholder={theme.defaultHeading}
          />

          <label className="dgc-label" htmlFor="card-recipient">Recipient</label>
          <input
            id="card-recipient"
            className="dgc-input"
            value={recipient}
            maxLength={32}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Nethmi"
          />

          <label className="dgc-label" htmlFor="card-signature">Closing</label>
          <input
            id="card-signature"
            className="dgc-input"
            value={signature}
            maxLength={40}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Love ❤️"
          />

          <div style={styles.actions}>
            <button className="dgc-btn dgc-btn-secondary" onClick={downloadCard} disabled={downloading}>
              {downloading ? 'Preparing…' : 'Download as JPG'}
            </button>
            <button className="dgc-btn dgc-btn-primary" onClick={() => onAddToGift(card)}>
              Add to gift
            </button>
          </div>
        </div>

        <div className="dgc-card-wrap" style={styles.cardWrap}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CARD_W} ${CARD_H}`}
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={styles.svg}
          >
            <defs>
              <linearGradient id="dgc-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={palette.bgTop} />
                <stop offset="1" stopColor={palette.bgBottom} />
              </linearGradient>
              <clipPath id="dgc-logo-clip">
                <circle cx={logoCx} cy={logoCy} r={logoR} />
              </clipPath>
            </defs>

            <rect width={CARD_W} height={CARD_H} fill="url(#dgc-bg)" />

            {/* soft scattered dots for texture */}
            {[...Array(14)].map((_, i) => (
              <circle
                key={i}
                cx={(i * 137) % CARD_W}
                cy={(i * 219 + 60) % CARD_H}
                r={i % 3 === 0 ? 2.4 : 1.4}
                fill={palette.dots[i % palette.dots.length]}
                opacity="0.22"
              />
            ))}

            {/* double border frame */}
            <rect x="24" y="24" width={CARD_W - 48} height={CARD_H - 48} rx="26" fill="none" stroke={palette.border} strokeWidth="2" />
            <rect x="34" y="34" width={CARD_W - 68} height={CARD_H - 68} rx="20" fill="none" stroke={palette.border} strokeWidth="1" opacity="0.55" />

            {/* corner florals */}
            <g transform="translate(30 30)">
              <CornerSprig palette={palette} />
            </g>
            <g transform={`translate(${CARD_W - 30} ${CARD_H - 30})`}>
              <CornerSprig palette={palette} flip />
            </g>

            {/* logo watermark, front and center */}
            <circle cx={logoCx} cy={logoCy} r={logoR + 4} fill="#fffdfa" stroke={palette.gold} strokeWidth="3" />
            <image
              href={LOGO_SRC}
              xlinkHref={LOGO_SRC}
              x={logoCx - logoR}
              y={logoCy - logoR}
              width={logoR * 2}
              height={logoR * 2}
              clipPath="url(#dgc-logo-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={logoCx} cy={logoCy} r={logoR + 4} fill="none" stroke={palette.gold} strokeWidth="1.5" opacity="0.6" />

            {/* occasion emblem */}
            <g transform={`translate(${CARD_W / 2} ${logoCy + logoR + 34})`}>
              <Icon scale={1.15} color={palette.gold} />
            </g>

            {/* heading */}
            <text
              x={CARD_W / 2}
              y={252}
              textAnchor="middle"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={headingSize}
              letterSpacing="1.5"
              fill={palette.eyebrow}
              style={{ textTransform: 'uppercase' }}
            >
              {card.heading}
            </text>

            <g transform={`translate(${CARD_W / 2} 288)`}>
              <Flourish palette={palette} width={180} />
            </g>

            {/* recipient */}
            <text
              x={CARD_W / 2}
              y={392}
              textAnchor="middle"
              fontFamily="'Brush Script MT', 'Segoe Script', cursive"
              fontStyle="italic"
              fontSize={recipientSize}
              fill={palette.petalDark}
            >
              {card.recipient}
            </text>

            <g transform={`translate(${CARD_W / 2} 440)`}>
              <Flourish palette={palette} width={220} />
            </g>

            {/* signature */}
            <text
              x={CARD_W / 2}
              y={520}
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize={signatureSize}
              fill={palette.ink}
            >
              {card.signature}
            </text>

            {/* bottom sprigs */}
            <g transform={`translate(${CARD_W / 2 - 90} ${CARD_H - 90})`}>
              <Bloom scale={0.9} petal={palette.petalLight} center={palette.gold} />
              <Leaf x={-14} y={4} rotate={-120} scale={0.7} color={palette.leaf} />
            </g>
            <g transform={`translate(${CARD_W / 2 + 90} ${CARD_H - 90})`}>
              <Bloom scale={0.9} petal={palette.petal} center={palette.gold} />
              <Leaf x={14} y={4} rotate={120} scale={0.7} color={palette.leafDark} />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ---------- layout styles (kept inline so the component never depends on host page CSS) ---------- */

const styles = {
  page: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '32px 20px 56px',
    fontFamily: 'Georgia, serif',
    color: '#3c322c',
  },
  intro: {
    textAlign: 'center',
    marginBottom: 32,
  },
  introLogo: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #d9ac4a',
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#8a6b4f',
    marginBottom: 8,
  },
  h1: {
    fontSize: 'clamp(24px, 4vw, 34px)',
    margin: '0 0 10px',
    fontWeight: 400,
  },
  introText: {
    fontSize: 15,
    color: '#6b5f56',
    maxWidth: 460,
    margin: '0 auto',
    lineHeight: 1.5,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 360px) minmax(240px, 320px)',
    gap: 40,
    alignItems: 'start',
    justifyContent: 'center',
  },
  form: {
    background: '#fffdfa',
    border: '1px solid #eee0d0',
    borderRadius: 18,
    padding: '22px 24px 26px',
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  cardWrap: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: `${CARD_W} / ${CARD_H}`,
    margin: '0 auto',
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 18px 40px rgba(60,50,44,0.16)',
  },
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
};