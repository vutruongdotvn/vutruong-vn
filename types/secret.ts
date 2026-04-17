export interface SecretItem {
  id: string;
  title: string;
  account?: string;
  password?: string;
  email?: string;
  recovery_email?: string;
  phone?: string;
  recovery_phone?: string;
  secret_code?: string;
  tags: string[];
  notes?: string;
  created_at?: string;
}