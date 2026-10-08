-- =====================================================================
-- FREELAHUB - SCHEMA SQL NATIVO PARA VERCEL POSTGRES / SUPABASE / NEON
-- =====================================================================

-- 1. Tabela de Usuários (Freelancers e Empresas)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'freelancer' CHECK (role IN ('freelancer', 'empresa')),
    pix_key VARCHAR(255),
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    bonus_accumulated NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Postagens Diárias de Tarefas (Tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location_type VARCHAR(32) NOT NULL CHECK (location_type IN ('workplace', 'home')),
    category VARCHAR(64) NOT NULL,
    base_pay NUMERIC(10, 2) NOT NULL,
    pay_type VARCHAR(16) NOT NULL DEFAULT 'hora' CHECK (pay_type IN ('hora', 'vídeo')),
    video_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    bonus_condition TEXT,
    has_active_bonus BOOLEAN DEFAULT TRUE,
    slots_total INT NOT NULL DEFAULT 10,
    slots_filled INT NOT NULL DEFAULT 0,
    duration_minutes INT NOT NULL DEFAULT 45,
    image TEXT,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    equipment_needed JSONB DEFAULT '[]'::jsonb,
    posted_date VARCHAR(64) NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_daily_mission BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    expires_in_hours INT DEFAULT 24,
    contractor_phone VARCHAR(64),
    contractor_whatsapp VARCHAR(64),
    contractor_contact_name VARCHAR(255),
    city VARCHAR(128) DEFAULT 'São Paulo',
    state VARCHAR(32) DEFAULT 'SP',
    neighborhood VARCHAR(128),
    postal_code VARCHAR(32),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Envios de Vídeo POV (Submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE CASCADE,
    task_title VARCHAR(255) NOT NULL,
    freelancer_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(64),
    pix_key VARCHAR(255) NOT NULL,
    pix_type VARCHAR(32) NOT NULL,
    submitted_at VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'approved' CHECK (status IN ('in_review', 'approved', 'paid')),
    base_earned NUMERIC(10, 2) NOT NULL,
    bonus_earned NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_earned NUMERIC(10, 2) NOT NULL,
    video_file_name VARCHAR(255),
    resolution VARCHAR(32) DEFAULT '1080p',
    fps INT DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Transações e Saques PIX
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('credit_task', 'credit_bonus', 'pix_withdrawal')),
    pix_key VARCHAR(255),
    status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Configurações da Plataforma e do Assistente IA
CREATE TABLE IF NOT EXISTS platform_config (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Conversas e Histórico de Chat com o Assistente Gemini / Suporte
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64),
    sender VARCHAR(16) NOT NULL CHECK (sender IN ('user', 'model', 'bot')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Performance para o Feed e Conversas
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(location_type);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_bonus ON tasks(has_active_bonus);
CREATE INDEX IF NOT EXISTS idx_tasks_daily_missions ON tasks(is_daily_mission, expires_at);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at);
