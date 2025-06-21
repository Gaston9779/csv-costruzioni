-- Database setup per Area Clienti Costruzioni Viola

-- Creazione del database
CREATE DATABASE costruzioni_viola;

-- Connessione al database
\c costruzioni_viola;

-- Tabella clienti
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  external_id VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella documenti
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER REFERENCES clients(id) ON DELETE SET NULL
);

-- Creazione utente admin iniziale (password: Admin123!)
INSERT INTO clients (name, email, password, role)
VALUES (
  'Administrator', 
  'admin@costruzioniviola.it', 
  '$2b$10$ZB5BHh4bLMvNDaF.Szf7SOi1VpZQQKUEiB5iuEwF6KMn16.ZaTpvK',
  'admin'
);

-- Indici per migliorare le performance
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_external_id ON clients(external_id);
