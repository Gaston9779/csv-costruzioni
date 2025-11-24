# ✅ Checklist Post-Migrazione

## 🎯 Obiettivo
Verificare che la migrazione al controller refactorizzato sia avvenuta con successo e che tutte le funzionalità siano operative.

## 📋 Checklist Completa

### 1. Verifica Installazione

- [ ] Tutti i file helper sono presenti in `backend/utils/`
- [ ] Tutti i file service sono presenti in `backend/services/`
- [ ] Il nuovo controller è presente in `backend/controllers/`
- [ ] I file di test sono presenti in `backend/tests/`
- [ ] Lo script di migrazione è eseguibile

```bash
./migrate-to-refactored.sh status
```

### 2. Verifica Backup

- [ ] Backup del controller originale creato
- [ ] Backup con timestamp presente
- [ ] Backup del database effettuato (se necessario)

```bash
ls -la backend/controllers/projectController.backup*
```

### 3. Test Unitari

- [ ] Jest installato
- [ ] Test imageHelpers passano
- [ ] Test apartmentHelpers passano
- [ ] Coverage >70%

```bash
cd backend
npm test
npm run test:coverage
```

### 4. Test Funzionalità Base

#### Progetti

- [ ] **GET /api/projects/public** - Lista progetti pubblici
  ```bash
  curl http://localhost:5000/api/projects/public
  ```

- [ ] **GET /api/projects/public/:id** - Dettaglio progetto pubblico
  ```bash
  curl http://localhost:5000/api/projects/public/[PROJECT_ID]
  ```

- [ ] **GET /api/projects** - Lista progetti (admin)
  ```bash
  curl -H "Authorization: Bearer [TOKEN]" http://localhost:5000/api/projects
  ```

- [ ] **POST /api/projects** - Crea progetto
  ```bash
  curl -X POST -H "Authorization: Bearer [TOKEN]" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Project","category":"Residenziale"}' \
    http://localhost:5000/api/projects
  ```

- [ ] **PUT /api/projects/:id** - Aggiorna progetto
  ```bash
  curl -X PUT -H "Authorization: Bearer [TOKEN]" \
    -H "Content-Type: application/json" \
    -d '{"title":"Updated Project"}' \
    http://localhost:5000/api/projects/[PROJECT_ID]
  ```

- [ ] **DELETE /api/projects/:id** - Elimina progetto
  ```bash
  curl -X DELETE -H "Authorization: Bearer [TOKEN]" \
    http://localhost:5000/api/projects/[PROJECT_ID]
  ```

#### Immagini Progetti

- [ ] **POST /api/projects/:id/images** - Upload immagine progetto
- [ ] **DELETE /api/projects/:id/images/:imageId** - Elimina immagine progetto
- [ ] Immagini visualizzate correttamente nel frontend
- [ ] URL immagini completi nelle risposte API

#### Appartamenti

- [ ] **POST /api/projects/:projectId/apartments** - Aggiungi appartamento
  ```bash
  curl -X POST -H "Authorization: Bearer [TOKEN]" \
    -H "Content-Type: application/json" \
    -d '{"apartmentData":"{\"title\":\"Apt 1\",\"squareMeters\":80}"}' \
    http://localhost:5000/api/projects/[PROJECT_ID]/apartments
  ```

- [ ] **PUT /api/projects/:projectId/apartments/:apartmentId** - Aggiorna appartamento
- [ ] **DELETE /api/projects/:projectId/apartments/:apartmentId** - Elimina appartamento

#### Immagini Appartamenti

- [ ] **POST /api/projects/:projectId/apartments/:apartmentId/images** - Upload immagini
- [ ] **DELETE /api/projects/:projectId/apartments/:apartmentId/images/:imageId** - Elimina immagine
- [ ] Immagini appartamenti visualizzate correttamente
- [ ] URL immagini completi nelle risposte API

#### Statistiche

- [ ] **GET /api/projects/stats** - Statistiche progetti
  ```bash
  curl -H "Authorization: Bearer [TOKEN]" \
    http://localhost:5000/api/projects/stats
  ```

### 5. Test Frontend

#### Pagina Progetti Pubblici

- [ ] Lista progetti caricata correttamente
- [ ] Immagini progetti visualizzate
- [ ] Filtri funzionanti
- [ ] Paginazione funzionante
- [ ] Dettaglio progetto accessibile

#### Pagina Dettaglio Progetto

- [ ] Informazioni progetto visualizzate
- [ ] Immagini progetto caricate
- [ ] Appartamenti visualizzati (se multiproprietà)
- [ ] Immagini appartamenti visualizzate
- [ ] Galleria immagini funzionante

#### Area Admin - Progetti

- [ ] Lista progetti admin caricata
- [ ] Creazione nuovo progetto funzionante
- [ ] Upload immagini progetto funzionante
- [ ] Modifica progetto funzionante
- [ ] Eliminazione progetto funzionante
- [ ] Toggle visibilità funzionante
- [ ] Toggle featured funzionante

#### Area Admin - Appartamenti

- [ ] Aggiunta appartamento funzionante
- [ ] Modifica appartamento funzionante
- [ ] Eliminazione appartamento funzionante
- [ ] Upload immagini appartamento funzionante
- [ ] Eliminazione immagini appartamento funzionante

### 6. Test Performance

- [ ] Tempo risposta GET /api/projects/public < 500ms
- [ ] Tempo risposta GET /api/projects < 500ms
- [ ] Upload immagini < 3s per immagine
- [ ] Nessun memory leak evidente
- [ ] CPU usage normale

```bash
# Test con Apache Bench
ab -n 100 -c 10 http://localhost:5000/api/projects/public
```

### 7. Verifica Log

- [ ] Nessun errore nei log del server
- [ ] Nessun warning critico
- [ ] Log di debug appropriati
- [ ] Nessun stack trace

```bash
# Monitora i log
tail -f backend/logs/server.log
```

### 8. Verifica Database

- [ ] Progetti salvati correttamente
- [ ] Immagini con URL completi
- [ ] Appartamenti con immagini complete
- [ ] Nessun dato corrotto
- [ ] Relazioni intatte

```javascript
// In MongoDB shell
db.projects.find().forEach(p => {
  print(`Project: ${p.title}`);
  if (p.apartments) {
    p.apartments.forEach(apt => {
      print(`  Apartment: ${apt.title}`);
      if (apt.images) {
        apt.images.forEach(img => {
          if (!img.url) {
            print(`    ⚠️ Missing URL: ${img._id}`);
          }
        });
      }
    });
  }
});
```

### 9. Test Edge Cases

- [ ] Upload file molto grande (>5MB)
- [ ] Upload multipli simultanei
- [ ] Creazione progetto senza immagini
- [ ] Creazione appartamento senza immagini
- [ ] Eliminazione progetto con appartamenti
- [ ] Modifica progetto con dati parziali
- [ ] Gestione errori 404
- [ ] Gestione errori 500

### 10. Test Compatibilità

- [ ] Frontend funziona senza modifiche
- [ ] Mobile app funziona (se presente)
- [ ] API esterne funzionano
- [ ] Webhook funzionano (se presenti)

### 11. Sicurezza

- [ ] Autenticazione funzionante
- [ ] Autorizzazioni corrette
- [ ] Validazione input attiva
- [ ] Sanitizzazione dati attiva
- [ ] CORS configurato correttamente
- [ ] Rate limiting attivo (se presente)

### 12. Documentazione

- [ ] README aggiornato
- [ ] API documentation aggiornata
- [ ] Changelog aggiornato
- [ ] Team informato delle modifiche

## 🚨 Problemi Comuni e Soluzioni

### Problema: Immagini non visualizzate

**Sintomo**: Le immagini non vengono mostrate nel frontend

**Soluzione**:
```javascript
// Verifica che standardizeProjectResponse sia chiamato
const project = await Project.findById(id).lean();
const standardized = standardizeProjectResponse(project);
res.json({ project: standardized });
```

### Problema: Errore "Module not found"

**Sintomo**: Errore all'avvio del server

**Soluzione**:
```bash
# Verifica che tutti i file siano presenti
./migrate-to-refactored.sh status

# Verifica i path nei require
grep -r "require.*utils" backend/controllers/
```

### Problema: Test falliti

**Sintomo**: npm test restituisce errori

**Soluzione**:
```bash
# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install

# Installa Jest
npm install --save-dev jest
```

### Problema: Performance degradate

**Sintomo**: API più lente del previsto

**Soluzione**:
```bash
# Verifica log per query lente
grep "Query MongoDB" backend/logs/server.log

# Considera rollback temporaneo
./migrate-to-refactored.sh rollback
```

## 📊 Metriche di Successo

La migrazione è considerata **SUCCESSO** se:

- ✅ Tutti i test unitari passano
- ✅ Tutte le funzionalità frontend funzionano
- ✅ Performance uguali o migliori
- ✅ Nessun errore nei log
- ✅ Database integro

La migrazione richiede **ROLLBACK** se:

- ❌ >10% test falliti
- ❌ Funzionalità critiche non funzionanti
- ❌ Performance degradate >20%
- ❌ Errori critici nei log
- ❌ Corruzione dati

## 🔄 Procedura Rollback

Se necessario:

```bash
# 1. Ferma il server
pm2 stop backend

# 2. Rollback
./migrate-to-refactored.sh rollback

# 3. Riavvia
pm2 start backend

# 4. Verifica
curl http://localhost:5000/api/projects/public
```

## ✅ Firma Completamento

- **Data Migrazione**: _______________
- **Eseguita da**: _______________
- **Test Completati**: _____ / _____
- **Problemi Riscontrati**: _______________
- **Stato Finale**: ⬜ SUCCESSO ⬜ ROLLBACK
- **Note**: _______________

---

**Ricorda**: Mantieni il backup per almeno 1 settimana dopo la migrazione!
