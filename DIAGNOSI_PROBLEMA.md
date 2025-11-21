# 🔍 DIAGNOSI PROBLEMA IMMAGINI

## ❌ Problema Attuale

Le immagini si vedono in `/progetti` ma NON nei modal Edit/View dell'admin.

## 🔎 Causa Root

Il backend su Render sta ancora usando il **vecchio codice** che salva immagini su disco locale invece di Cloudinary.

**Prova:**
```json
// Risposta da /api/projects/public
"images": [{
  "url": "/uploads/projects/project-1763325241294-669919976.JPG"  ❌ LOCALE
}]
```

**Dovrebbe essere:**
```json
"images": [{
  "url": "https://res.cloudinary.com/dbpvvtkax/image/upload/..."  ✅ CLOUDINARY
}]
```

## 🎯 Perché Funziona in `/progetti` ma Non nei Modal?

### In `/progetti` (pagina pubblica):
```javascript
// Progetti.js usa questa logica che FUNZIONA con URL locali:
src={`${API_URL}${image.url}`}
// Risultato: https://csv-backend-yg2x.onrender.com/uploads/projects/...
```

### Nei Modal Edit/View:
```javascript
// AdminProjects.js usa questa logica che FALLISCE con URL undefined:
src={image.url?.startsWith('http') ? image.url : `${API_URL}${image.url}`}
// Se image.url è undefined → src diventa: https://csv-backend-yg2x.onrender.com/undefined
```

## 🔧 Soluzione

### 1. Verifica Variabili Cloudinary su Render

Vai su **Render Dashboard** → `csv-backend` → **Environment**

Devono esserci:
```
CLOUDINARY_CLOUD_NAME = dbpvvtkax
CLOUDINARY_API_KEY = 897369444478223
CLOUDINARY_API_SECRET = sF7RC_FyURKvwrnIO5-pTS3mMak
```

### 2. Forza Redeploy Backend

**Render Dashboard** → `csv-backend` → **Manual Deploy** → **Clear build cache & deploy**

Questo forza Render a ricompilare tutto da zero.

### 3. Verifica Logs Durante Upload

Dopo il deploy, carica un nuovo progetto e controlla i log:

**Render Dashboard** → `csv-backend` → **Logs**

Dovresti vedere:
```
📸 File Cloudinary ricevuto: { 
  filename: 'csv-costruzioni/projects/abc123',
  secure_url: 'https://res.cloudinary.com/...'
}
```

Se NON vedi questo log, significa che:
- Le variabili Cloudinary non sono configurate
- Il nuovo codice non è stato deployato

### 4. Test Finale

Dopo il deploy:
1. Elimina i progetti vecchi (hanno URL locali)
2. Carica un NUOVO progetto con immagini
3. Verifica che in `/api/projects/public` l'URL sia Cloudinary (inizia con https://)
4. Apri Edit/View → le immagini si vedranno

## 📋 Checklist Debug

- [ ] Variabili Cloudinary presenti su Render
- [ ] Redeploy backend con "Clear build cache"
- [ ] Log mostra "📸 File Cloudinary ricevuto"
- [ ] Nuovo progetto ha URL Cloudinary in risposta API
- [ ] Immagini visibili in Edit/View

## 🚨 Se Ancora Non Funziona

Controlla i log Render per errori tipo:
```
Error: Cloudinary configuration error
Invalid API Key
```

Questo indica che le credenziali sono sbagliate o mancanti.
