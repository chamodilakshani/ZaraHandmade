require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// Testimonials — submitted by customers, shown on the Home page
const TestimonialSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  quote: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

// Newsletter subscribers — collected from the "Zara notes" signup
const SubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true }
}, { timestamps: true });
const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

// Greeting card templates — admin-uploaded backgrounds customers pick from
const GreetingTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  occasion: { type: String, default: '', trim: true },
  image: { type: String, required: true },
  textColor: { type: String, default: '#3c322c' }
}, { timestamps: true });
const GreetingTemplate = mongoose.model('GreetingTemplate', GreetingTemplateSchema);

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

// Testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(limit);
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/testimonials', verifyToken, async (req, res) => {
  try {
    const { rating, quote } = req.body;
    if (!quote || !quote.trim()) return res.status(400).json({ error: 'A review message is required' });
    const testimonial = new Testimonial({
      userId: req.user.id,
      username: req.user.username,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      quote: quote.trim()
    });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.delete('/api/testimonials/:id', verifyToken, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Review not found' });
    if (req.user.role !== 'admin' && testimonial.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    await testimonial.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: "You're already subscribed!", alreadySubscribed: true });
    }
    await new Subscriber({ email }).save();
    res.status(201).json({ message: 'Subscribed! Watch your inbox for seasonal notes.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: "You're already subscribed!", alreadySubscribed: true });
    }
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Greeting card templates
app.get('/api/greeting-templates', async (req, res) => {
  try {
    const templates = await GreetingTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/greeting-templates', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, occasion, image, textColor } = req.body;
    if (!name || !image) return res.status(400).json({ error: 'Name and image are required' });
    const template = new GreetingTemplate({
      name,
      occasion: occasion || '',
      image,
      textColor: textColor || '#3c322c'
    });
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add template' });
  }
});

app.delete('/api/greeting-templates/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await GreetingTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app;