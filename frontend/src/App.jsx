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

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zara_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setView(user.role === 'admin' ? 'admin-orders' : 'shop');
      loadProducts();
      loadOrders();
    }
  }, [user]);

  const loadProducts = async () => {
    try { setProducts(await api.getProducts()); } catch (err) { console.error(err); }
  };

  const loadOrders = async () => {
    try { setOrders(await api.getOrders()); } catch (err) { console.error(err); }
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
        total
      });
      setCart([]);
      setCartOpen(false);
      alert('Order placed! 🌸');
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
        <div className="shop-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} onClick={() => setSelectedProduct(p)} />
          ))}
        </div>
      )}

      {view === 'custom' && user.role === 'customer' && (
        <CustomBouquet onOrderPlaced={loadOrders} />
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

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {cartOpen && (
        <CartDrawer
          cart={cart}
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
