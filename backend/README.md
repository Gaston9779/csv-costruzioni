# Area Clienti - Backend

Il backend per l'Area Clienti di Costruzioni Viola, sviluppato con Node.js, Express e MongoDB.

## Funzionalità

### Admin
- Login con ruolo admin
- Visualizzazione clienti (locali e da API esterna)
- Creazione automatica account cliente
- Upload documenti PDF per i clienti
- Gestione documenti (visualizzazione, eliminazione)

### Client
- Login con credenziali fornite via email
- Visualizzazione documenti personali
- Download documenti
- Cambio password
- Statistiche documenti

## Struttura del progetto

```
backend/
├── config/             # Configurazione database
├── controllers/        # Business logic
├── middleware/         # Middleware (auth, upload)
├── models/             # Modelli dati MongoDB
├── routes/             # API routes
├── services/           # Servizi esterni (email, API clienti)
├── uploads/            # Directory per file caricati
├── .env                # Variabili d'ambiente
├── index.js            # Entry point
├── setup.js            # Script di inizializzazione DB
└── package.json        # Dipendenze
```

## Tecnologie utilizzate

- **Node.js & Express**: Framework server
- **MongoDB**: Database NoSQL
- **Mongoose**: ODM per MongoDB
- **JWT**: Autenticazione
- **Bcrypt**: Hashing password
- **Multer**: Gestione upload file
- **Nodemailer**: Invio email
- **Axios**: Chiamate API

## Setup e installazione

### Prerequisiti

- Node.js (v14+)
- MongoDB (v4+)
- npm

### Installazione

1. Clona il repository
2. Installa le dipendenze:
   ```
   cd backend
   npm install
   ```
3. Configura le variabili d'ambiente (copia `.env.example` in `.env` e modifica i valori)
4. Crea l'utente admin con lo script di inizializzazione:
   ```
   node setup.js
   ```
5. Avvia il server:
   ```
   npm run dev
   ```

## API Endpoints

### Autenticazione

- `POST /api/auth/login` - Login per client e admin
- `POST /api/auth/change-password` - Cambio password (autenticato)
- `GET /api/auth/verify` - Verifica token JWT

### Area Admin

- `GET /api/admin/clients` - Lista clienti
- `POST /api/admin/clients/create-or-get` - Crea/recupera cliente
- `POST /api/admin/documents/upload` - Upload documento
- `GET /api/admin/documents` - Lista documenti
- `DELETE /api/admin/documents/:id` - Elimina documento

### Area Client

- `GET /api/client/profile` - Profilo cliente
- `GET /api/client/documents` - Documenti cliente
- `GET /api/client/documents/stats` - Statistiche documenti
- `GET /api/client/documents/:documentId/download` - Download documento

## Sicurezza

- Autenticazione basata su JWT
- Password criptate con bcrypt
- Role-based access control
- Filtro per tipo file (solo PDF)
- Validazione input

## Integrazione con Frontend

Il backend espone API RESTful che possono essere consumate da qualsiasi frontend.
Per l'autenticazione, il client deve inviare il JWT con ogni richiesta nell'header:
```
Authorization: Bearer {token}
```

## Sviluppo

Per avviare in modalità sviluppo con hot-reload:
```
npm run dev
```

Per avviare in produzione:
```
npm start
```
