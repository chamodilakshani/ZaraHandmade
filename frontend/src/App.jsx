import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CustomBouquet from './components/CustomBouquet';
import MyOrders from './components/MyOrders';
import AdminOrders from './components/AdminOrders';
import AdminProducts from './components/AdminProducts';
import AdminGreetingTemplates from './components/AdminGreetingTemplates';
import GreetingCard from './components/GreetingCard';
import { FlowerIcon, SparkleIcon } from './components/Icons';

const collections = [
  {
    title: 'Romantic Bouquets',
    copy: 'Soft roses, blush wraps, and handwritten notes.',
    tone: 'rose',
    image: '/images/bouquet.png',
    filters: { category: 'Flower Bouquet' }
  },
  {
    title: 'Gift Boxes',
    copy: 'Curated keepsakes for birthdays, love, and thank-you moments.',
    tone: 'gold',
    image: '/images/giftbox.png',
    filters: { category: 'Gift Box' }
  },
  {
    title: 'Custom Florals',
    copy: 'Personalized colors, blooms, ribbons, and message cards.',
    tone: 'sage',
    image: '/images/hero-bouquet.png',
    filters: { category: 'Flower Bouquet', productType: 'Handmade' }
  }
];

const stats = [
  ['1500+', 'Happy customers'],
  ['2500+', 'Bouquets delivered'],
  ['4.9', 'Customer rating'],
  ['100%', 'Handmade']
];

const process = [
  ['Choose', 'Pick a bouquet or start a custom arrangement.'],
  ['Personalize', 'Select flowers, wrapping, ribbon, and a greeting note.'],
  ['Delivered', 'Every piece is hand wrapped and prepared with care.']
];

// Turns "jane_doe" or "Jane Doe" into initials like "JD" for the avatar badge
function getInitials(name = '') {
  const parts = name.trim().split(/[\s_]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zara_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productFilters, setProductFilters] = useState({ category: '', productType: '' });
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [greetingCard, setGreetingCard] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    if (user) {
      setView(user.role === 'admin' ? 'admin-orders' : 'shop');
      loadProducts();
      loadOrders();
      loadTestimonials();
    }
  }, [user]);

  
useEffect(() => {
  if (user?.role === 'customer') {
    loadProducts();
  }
}, [user, view, productFilters]); 
const loadProducts = async () => {
  setProductsLoading(true);
  try {
    setProducts(await api.getProducts(productFilters)); 
  } catch (err) { 
    console.error(err); 
  } finally { 
    setProductsLoading(false); 
  }
};
  const loadOrders = async () => {
    try { setOrders(await api.getOrders()); } catch (err) { console.error(err); }
  };

  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      setTestimonials(await api.getTestimonials());
    } catch (err) {
      console.error(err);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    setReviewMessage('');
    try {
      await api.addTestimonial({ rating: reviewRating, quote: reviewText.trim() });
      setReviewText('');
      setReviewRating(5);
      setReviewMessage('Thanks for your review!');
      loadTestimonials();
    } catch (err) {
      setReviewMessage(err.message || 'Could not submit your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus({ state: 'loading', message: '' });
    try {
      const res = await api.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterStatus({ state: 'success', message: res.message || 'Subscribed!' });
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus({ state: 'error', message: err.message || 'Something went wrong.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zara_token');
    localStorage.removeItem('zara_user');
    setUser(null);
    setCart([]);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) => i.productId === product._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, image: product.image, qty: 1 }];
    });
    setSelectedProduct(null);
    setCartOpen(true);
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      await api.placeOrder({
        type: 'shop',
        items: cart.map(({ name, price, qty, image }) => ({ name, price, qty, image })),
        greetingCard,
        total
      });
      setCart([]);
      setGreetingCard(null);
      setCartOpen(false);
      alert('Order placed!');
      loadOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const goToProducts = (filters = {}) => {
    setProductFilters({
      category: filters.category || '',
      productType: filters.productType || ''
    });
    setView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollectionExplore = (item) => {
    goToProducts(item.filters);
  };

  const hasProductFilters = productFilters.category || productFilters.productType;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        user={user}
        view={view}
        setView={setView}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onLogout={handleLogout}
      />

      {view === 'shop' && user.role === 'customer' && (
        <>
          <section className="hero premium-hero">
            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />
            <div className="petal-field" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="hero-content">
              <div className="eyebrow"><SparkleIcon width={13} height={13} /> Handmade, for every occasion</div>
              <h1>
                <span>Flowers & gifts,</span>
                <br />
                <em>made with heart.</em>
              </h1>
              <p>Fresh bouquets and handcrafted gifts from Zara - browse the shop below or build your own custom bouquet.</p>
              <div className="hero-actions">
                <button className="btn-primary magnetic-btn" onClick={() => goToProducts()}>Shop Collection <span aria-hidden="true">&rarr;</span></button>
                <button className="btn-secondary magnetic-btn" onClick={() => setView('custom')}>Create Bouquet</button>
              </div>
              <div className="hero-trust" aria-label="Store highlights">
                <span className="hero-trust-rating"><span className="stars" aria-hidden="true">★★★★★</span> 4.9 rating</span>
                <span className="trust-divider" aria-hidden="true" />
                <span>1500+ happy customers</span>
                <span className="trust-divider" aria-hidden="true" />
                <span>100% handmade</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-orbit orbit-one"><FlowerIcon width={22} height={22} /></div>
              <div className="hero-orbit orbit-two"><SparkleIcon width={20} height={20} /></div>
              <img src="/images/hero-bouquet.png" alt="Handmade flower bouquet" className="hero-image" />
            </div>
          </section>

          <section className="trust-bar section-wide" aria-label="Why customers choose Zara">
            {stats.map(([value, label]) => (
              <div className="trust-item" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </section>

          <section className="collections-section section-wide">
            <div className="section-heading">
              <div>
                <div className="eyebrow">Featured collections</div>
                <h2>Signature gifts for every kind of love.</h2>
              </div>
              <button className="text-link" onClick={() => setView('custom')}>Customize yours</button>
            </div>
            <div className="collection-grid">
              {collections.map((item) => (
                <article className={`collection-card ${item.tone}`} key={item.title}>
                  <img src={item.image} alt="" className="collection-image" loading="lazy" />
                  <div className="collection-content">
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                    <button className="explore-link" onClick={() => handleCollectionExplore(item)}>
                      Explore <span aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="shop-section section-wide" id="shop-products" aria-labelledby="shop-title">
            <div className="section-heading">
              <div>
                <div className="eyebrow">Trending now</div>
                <h2 id="shop-title">Handmade favorites, ready to gift.</h2>
              </div>
              <button className="section-pill section-pill-btn" onClick={() => goToProducts()}>View all products</button>
            </div>
            <div className="shop-grid">
              {products.slice(0, 6).map((p) => (
                <ProductCard key={p._id} product={p} onClick={() => setSelectedProduct(p)} />
              ))}
            </div>
          </section>

          <section className="process-band section-wide">
            <div className="process-visual" aria-hidden="true">
              <div className="process-visual-blob" />
              <div className="process-visual-ring" />
              <div className="process-visual-icon"><FlowerIcon width={30} height={30} /></div>
            </div>
            <div className="process-panel-new">
              <div className="eyebrow">How customization works</div>
              <h2>A simple path from feeling to finished gift.</h2>
              <div className="process-list">
                {process.map(([title, copy], i) => (
                  <div className="process-item" key={title}>
                    <span>{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="testimonials-band section-wide">
            <div className="section-heading">
              <div>
                <div className="eyebrow">Loved by customers</div>
                <h2>Real words from real bouquets.</h2>
              </div>
            </div>

            {testimonialsLoading ? (
              <div className="empty-state">Loading reviews...</div>
            ) : testimonials.length > 0 ? (
              <div className="testimonials-grid">
                {testimonials.map((t) => (
                  <article className="testimonial-tile" key={t._id}>
                    <span className="quote-mark" aria-hidden="true">&ldquo;</span>
                    <div className="stars" aria-hidden="true">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                    <p>{t.quote}</p>
                    <div className="testimonial-person">
                      <span className="avatar-badge">{getInitials(t.username)}</span>
                      <div>
                        <strong>{t.username}</strong>
                        <small>Verified purchase</small>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">No reviews yet — be the first to share one below.</div>
            )}

            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="review-form-heading">Leave a review</div>
              <div className="review-stars-input" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`star-btn ${n <= reviewRating ? 'active' : ''}`}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={n === reviewRating}
                    onClick={() => setReviewRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="review-textarea"
                placeholder="Share how your order went..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
                rows={3}
                required
              />
              <div className="review-form-footer">
                {reviewMessage && <span className="review-form-message">{reviewMessage}</span>}
                <button className="btn-primary" type="submit" disabled={submittingReview || !reviewText.trim()}>
                  {submittingReview ? 'Submitting...' : 'Submit review'}
                </button>
              </div>
            </form>
          </section>

          <section className="newsletter-band section-wide">
            <div className="newsletter-inner">
              <div>
                <div className="eyebrow">Zara notes</div>
                <h2>Seasonal blooms, gift ideas, and custom inspiration.</h2>
              </div>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button className="btn-primary" type="submit" disabled={newsletterStatus.state === 'loading'}>
                  {newsletterStatus.state === 'loading' ? '...' : 'Join'}
                </button>
              </form>
              {newsletterStatus.message && (
                <span className={`newsletter-status ${newsletterStatus.state}`}>{newsletterStatus.message}</span>
              )}
            </div>
          </section>
        </>
      )}

      {view === 'products' && user.role === 'customer' && (
        <section className="products-page section-wide">
          <div className="products-hero">
            <div>
              <div className="eyebrow">Products</div>
              <h1>Browse handmade gifts and fresh floral pieces.</h1>
              <p>Filter by gift boxes, flower bouquets, handmade products, or fresh flowers. Every item shown here is loaded from your database.</p>
            </div>
          </div>

          <div className="filter-panel" aria-label="Product filters">
            <div className="filter-group">
              <span>Category</span>
              {['', 'Flower Bouquet', 'Gift Box'].map((category) => (
                <button
                  key={category || 'all-categories'}
                  className={`filter-chip ${productFilters.category === category ? 'active' : ''}`}
                  onClick={() => setProductFilters((prev) => ({ ...prev, category }))}
                >
                  {category || 'All'}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span>Type</span>
              {['', 'Handmade', 'Fresh Flowers'].map((productType) => (
                <button
                  key={productType || 'all-types'}
                  className={`filter-chip ${productFilters.productType === productType ? 'active' : ''}`}
                  onClick={() => setProductFilters((prev) => ({ ...prev, productType }))}
                >
                  {productType || 'All'}
                </button>
              ))}
            </div>
            {hasProductFilters && (
              <button className="text-link clear-filters" onClick={() => setProductFilters({ category: '', productType: '' })}>
                Clear filters
              </button>
            )}
          </div>

          {productsLoading ? (
            <div className="empty-state">Loading products...</div>
          ) : products.length > 0 ? (
            <div className="shop-grid products-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onClick={() => setSelectedProduct(p)} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No products match these filters yet.</div>
          )}
        </section>
      )}

      {view === 'custom' && user.role === 'customer' && (
        <CustomBouquet onOrderPlaced={loadOrders} />
      )}

      {view === 'greeting-card' && user.role === 'customer' && (
        <GreetingCard
          greetingCard={greetingCard}
          onAddToGift={(card) => { setGreetingCard(card); setCartOpen(true); }}
        />
      )}

      {view === 'orders' && user.role === 'customer' && (
        <MyOrders orders={orders} />
      )}

      {view === 'admin-orders' && user.role === 'admin' && (
        <AdminOrders orders={orders} refresh={loadOrders} />
      )}

      {view === 'admin-products' && user.role === 'admin' && (
        <AdminProducts products={products} refresh={loadProducts} />
      )}

      {view === 'admin-templates' && user.role === 'admin' && (
        <AdminGreetingTemplates />
      )}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          greetingCard={greetingCard}
          onRemoveGreetingCard={() => setGreetingCard(null)}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
        />
      )}
    </div>
  );
}