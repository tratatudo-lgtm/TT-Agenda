import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Evolution API Configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || '';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || '';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
      req.user = decoded; // Contém client_id
      next();
    });
  };

  // --- Auth Routes (OTP) ---

  app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Telefone é obrigatório' });

    // Verificar se o cliente existe
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone_e164', phone)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Gerar OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Salvar OTP (usando tabela otps ou similar)
    const { error: otpError } = await supabase
      .from('otps')
      .upsert({ phone, otp, expires_at: expiresAt.toISOString() }, { onConflict: 'phone' });

    if (otpError) return res.status(500).json({ error: 'Erro ao gerar código' });

    // Enviar via Evolution API
    try {
      if (EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE) {
        await axios.post(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
          number: phone,
          text: `Seu código de acesso TT-Agenda é: ${otp}`
        }, { 
          headers: { 'apikey': EVOLUTION_API_KEY } 
        });
      } else {
        console.log(`[MOCK] Enviando OTP ${otp} para ${phone}`);
      }
      res.json({ message: 'Código enviado com sucesso' });
    } catch (error) {
      console.error('Erro Evolution API:', error);
      res.status(500).json({ error: 'Erro ao enviar mensagem via WhatsApp' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Telefone e código são obrigatórios' });

    const { data: otpData, error: otpError } = await supabase
      .from('otps')
      .select('*')
      .eq('phone', phone)
      .single();

    if (otpError || !otpData || otpData.otp !== code || new Date(otpData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Código inválido ou expirado' });
    }

    // Limpar OTP
    await supabase.from('otps').delete().eq('phone', phone);

    // Buscar dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone_e164', phone)
      .single();

    if (clientError || !client) return res.status(404).json({ error: 'Erro ao recuperar dados do cliente' });

    // Gerar JWT
    const token = jwt.sign(
      { client_id: client.id, phone: client.phone_e164 }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    res.json({ token, client });
  });

  // --- CRUD: Agendamentos (calendar_events) ---

  app.get('/api/appointments', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*, client_profiles(company_name)')
      .eq('client_id', req.user.client_id)
      .eq('event_type', 'appointment')
      .order('start_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/appointments', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({ 
        ...req.body, 
        client_id: req.user.client_id,
        event_type: 'appointment'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/appointments/:id', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('client_id', req.user.client_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/appointments/:id', authenticateToken, async (req: any, res) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', req.params.id)
      .eq('client_id', req.user.client_id);

    if (error) return res.status(500).json({ error: error.message });
    res.sendStatus(204);
  });

  // --- CRUD: Clientes do Negócio (client_profiles) ---

  app.get('/api/customers', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', req.user.client_id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/customers', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('client_profiles')
      .insert({ ...req.body, client_id: req.user.client_id })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/customers/:id', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('client_profiles')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('client_id', req.user.client_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/customers/:id', authenticateToken, async (req: any, res) => {
    const { error } = await supabase
      .from('client_profiles')
      .delete()
      .eq('id', req.params.id)
      .eq('client_id', req.user.client_id);

    if (error) return res.status(500).json({ error: error.message });
    res.sendStatus(204);
  });

  // --- CRUD: Serviços (categories) ---

  app.get('/api/services', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('client_id', req.user.client_id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/services', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...req.body, client_id: req.user.client_id })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/services/:id', authenticateToken, async (req: any, res) => {
    const { data, error } = await supabase
      .from('categories')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('client_id', req.user.client_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/services/:id', authenticateToken, async (req: any, res) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id)
      .eq('client_id', req.user.client_id);

    if (error) return res.status(500).json({ error: error.message });
    res.sendStatus(204);
  });

  // --- Vite Middleware / Static Files ---
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
