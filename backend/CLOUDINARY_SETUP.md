# Cloudinary Setup - Guida Completa

## ✅ Cosa è stato fatto

Ho migrato completamente il sistema di gestione immagini da **filesystem locale** (che si perdeva su Heroku) a **Cloudinary** (storage cloud persistente).

### Modifiche al Backend:

1. ✅ Installato `cloudinary` e `multer-storage-cloudinary`
2. ✅ Creato `/config/cloudinary.js` per la configurazione
3. ✅ Creato `/middleware/uploadCloudinary.js` per il caricamento su Cloudinary
4. ✅ Creato `/utils/cloudinaryHelper.js` con funzioni di supporto
5. ✅ Aggiornato `/routes/project.js` per usare i nuovi middleware
6. ✅ Aggiornato `/controllers/projectController.js` per:
   - Caricare immagini su Cloudinary invece del disco
   - Eliminare immagini da Cloudinary invece del disco
   - Gestire correttamente gli URL di Cloudinary

---

## 📋 Passi da completare

### 1. Crea Account Cloudinary (GRATUITO)

1. Vai su https://cloudinary.com/users/register/free
2. Registrati con la tua email
3. Verifica l'email
4. Accedi alla Dashboard

### 2. Ottieni le Credenziali

Nella Dashboard Cloudinary troverai:
- **Cloud Name**: es. `dxxxxx`
- **API Key**: es. `123456789012345`
- **API Secret**: es. `abcdefghijklmnopqrstuvwxyz`

### 3. Configura le Variabili d'Ambiente

#### Locale (`.env`):

Apri `/backend/.env` e aggiorna:

```bash
CLOUDINARY_CLOUD_NAME=il_tuo_cloud_name
CLOUDINARY_API_KEY=la_tua_api_key
CLOUDINARY_API_SECRET=il_tuo_api_secret
```

#### Heroku (Produzione):

Vai su Heroku Dashboard → Settings → Config Vars e aggiungi:

```
CLOUDINARY_CLOUD_NAME = il_tuo_cloud_name
CLOUDINARY_API_KEY = la_tua_api_key
CLOUDINARY_API_SECRET = il_tuo_api_secret
```

**OPPURE** via CLI:

```bash
cd backend
heroku config:set CLOUDINARY_CLOUD_NAME=il_tuo_cloud_name
heroku config:set CLOUDINARY_API_KEY=la_tua_api_key
heroku config:set CLOUDINARY_API_SECRET=il_tuo_api_secret
```

### 4. Test in Locale

```bash
cd backend
npm install
npm start
```

Prova a caricare un progetto con immagini dalla dashboard admin. Le immagini dovrebbero caricarsi su Cloudinary.

Verifica su Cloudinary Dashboard → Media Library che le immagini siano presenti in:
- `csv-costruzioni/projects/` (immagini progetti)
- `csv-costruzioni/apartments/` (immagini appartamenti)

### 5. Deploy su Heroku

```bash
cd backend
git add .
git commit -m "Migrazione a Cloudinary per storage persistente immagini"
git push heroku main
```

**OPPURE** se usi GitHub con auto-deploy:

```bash
cd backend
git add .
git commit -m "Migrazione a Cloudinary per storage persistente immagini"
git push origin main
```

### 6. Verifica in Produzione

1. Vai su Netlify (frontend)
2. Accedi all'admin
3. Carica un nuovo progetto con immagini
4. Verifica che le immagini si vedano correttamente
5. Controlla su Cloudinary Dashboard che le immagini siano state salvate

---

## 🔧 Struttura Cloudinary

Le immagini vengono salvate su Cloudinary con questa struttura:

```
csv-costruzioni/
├── projects/
│   ├── immagine1.jpg
│   ├── immagine2.png
│   └── ...
└── apartments/
    ├── immagine1.jpg
    ├── immagine2.png
    └── ...
```

Gli URL delle immagini saranno del tipo:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/csv-costruzioni/projects/abc123.jpg
```

---

## 📊 Database

Nel database MongoDB, le immagini vengono salvate con questa struttura:

```javascript
{
  filename: "csv-costruzioni/projects/abc123",  // Public ID Cloudinary
  url: "https://res.cloudinary.com/...",        // URL completo
  path: "https://res.cloudinary.com/...",       // Stesso URL
  originalName: "foto.jpg",
  mimetype: "image/jpeg",
  size: 123456,
  cloudinaryId: "csv-costruzioni/projects/abc123"  // Per eliminazioni
}
```

---

## ❓ Troubleshooting

### Le immagini non si caricano

Verifica:
1. ✅ Credenziali Cloudinary corrette su Heroku
2. ✅ Backend ridistribuito dopo le modifiche
3. ✅ Controlla i log: `heroku logs --tail -a csv-backend`

### Errore "Invalid API Key"

- Verifica che le variabili d'ambiente siano impostate correttamente
- Controlla che non ci siano spazi extra nelle credenziali

### Le vecchie immagini non si vedono

Le immagini caricate PRIMA della migrazione a Cloudinary potrebbero non funzionare perché:
- Hanno URL locali tipo `/uploads/projects/...`
- Il filesystem di Heroku è effimero

**Soluzione**: Ricarica le immagini tramite admin. Le nuove andranno su Cloudinary.

---

## 🎉 Vantaggi di Cloudinary

✅ **Persistenza**: Le immagini non si perdono mai  
✅ **CDN Globale**: Caricamento veloce ovunque nel mondo  
✅ **Ottimizzazione**: Immagini automaticamente ridimensionate  
✅ **Backup**: Cloudinary fa backup automatici  
✅ **Gratis**: Piano Free fino a 25GB e 25k trasformazioni/mese  

---

## 📞 Supporto

Se hai problemi, controlla:
- Cloudinary Dashboard → Usage (per verificare limiti)
- Heroku Logs: `heroku logs --tail`
- Console del browser (F12) per errori di caricamento immagini
