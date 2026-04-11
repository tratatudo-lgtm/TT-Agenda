export interface User {
  id: string;
  company_name: string;
  phone_e164: string;
  status: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  customer?: Customer;
  service?: Service;
}

export interface Customer {
  id: string;
  name: string;
  phone_e164: string;
  email?: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
}

export interface BusinessSettings {
  company_name: string;
  working_hours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  appointment_interval: number;
  notifications_enabled: boolean;
}
