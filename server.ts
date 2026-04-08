import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const { error } = await supabase
      .from('otps')
      .upsert({ phone, otp, expires_at: expiresAt.toISOString() }, { onConflict: 'phone' });

    if (error) return res.status(500).json({ error: error.message });

    // Evolution API Integration (Mocked)
    console.log(`Sending OTP ${otp} to ${phone} via Evolution API`);
    // await axios.post(`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`, {
    //   number: phone,
    //   text: `Seu código de acesso TT-Agenda é: ${otp}`
    // }, { headers: { 'apikey': process.env.EVOLUTION_API_KEY } });

    res.json({ message: 'OTP sent successfully' });
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code are required' });

    const { data, error } = await supabase
      .from('otps')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data || data.otp !== code || new Date(data.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    await supabase.from('otps').delete().eq('phone', phone);

    // Get or Create User/Business
    let { data: business, error: bError } = await supabase
      .from('businesses')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!business) {
      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert({ phone, name: 'Novo Negócio' })
        .select()
        .single();
      business = newBusiness;
    }

    const token = jwt.sign({ id: business.id, phone: business.phone }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, business });
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', authenticateToken, async (req: any, res) => {
    const businessId = req.user.id;

    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    const { count: servicesCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    res.json({
      appointments: appointmentsCount || 0,
      customers: customersCount || 0,
      services: servicesCount || 0,
      revenue: 0 // Mocked
    });
  });

  // Appointments CRUD
  app.get('/api/appointments', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, customers(*), services(*)')
      .eq('business_id', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/appointments', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({ ...req.body, business_id: req.user.id })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Customers CRUD
  app.get('/api/customers', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/customers', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...req.body, business_id: req.user.id })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Services CRUD
  app.get('/api/services', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/services', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('services')
      .insert({ ...req.body, business_id: req.user.id })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Working Hours
  app.get('/api/working-hours', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('business_id', req.user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Campaigns
  app.post('/api/campaigns/send', authenticateToken, async (req: any, res) => {
    const { message, customerIds } = req.body;
    // Mocked campaign sending
    console.log(`Sending campaign message: "${message}" to ${customerIds.length} customers`);
    res.json({ message: 'Campaign sent successfully' });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
