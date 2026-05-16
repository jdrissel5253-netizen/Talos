CREATE TABLE IF NOT EXISTS demo_requests (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    company_size VARCHAR(50),
    current_challenges TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
