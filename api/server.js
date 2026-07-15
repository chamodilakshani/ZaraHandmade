require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET || !MONGO_URI) {
  console.error('Missing required environment variables: JWT_SECRET and/or MONGO_URI');
}

// ---- DB CONNECTION (cached for serverless) ----
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI);
  isConnected = true;
  console.log('MongoDB connected');
}
connectDB().catch(err => console.error('MongoDB connection error:', err.message));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// ---- SCHEMAS ----
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  desc: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Flower Bouquet', 'Gift Box'],
    default: 'Flower Bouquet'
  },
  productType: {
    type: String,
    enum: ['', 'Handmade', 'Fresh Flowers'],
    default: ''
  }
}, { timestamps: true });
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  items: [{
    name: String,
    price: Number,
    qty: Number,
    image: String
  }],
  type: { type: String, enum: ['shop', 'custom'], default: 'shop' },
  customDetails: {
    flowerType: String,
    wrapColor: String,
    notes: String
  },
  greetingCard: {
    heading: String,
    recipient: String,
    signature: String
  },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Processing', 'Completed'], default: 'Processing' },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// ---- AUTH MIDDLEWARE ----
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ---- ROUTES ----
app.get('/', (req, res) => res.send('Zara Handmade API is running.'));

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed, role: role === 'admin' ? 'admin' : 'customer' }).save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Username already exists or registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.productType) query.productType = req.query.productType;
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', verifyToken, requireAdmin, async (req, res) => {
  try {
    const category = req.body.category || 'Flower Bouquet';
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: req.body.image || '',
      desc: req.body.desc || '',
      category,
      productType: category === 'Gift Box' ? '' : (req.body.productType || 'Handmade')
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.delete('/api/products/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Orders
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, type, customDetails, greetingCard, total } = req.body;
    const order = new Order({
      userId: req.user.id,
      username: req.user.username,
      items: items || [],
      type: type || 'shop',
      customDetails: customDetails || {},
      greetingCard: greetingCard || {},
      total
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = req.user.role === 'admin'
      ? await Order.find().sort({ date: -1 })
      : await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:id/complete', verifyToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app;
