# 🚀 Cheatsheet Comandi - Refactoring CSV

## 📦 Migrazione

### Verifica Stato
```bash
./migrate-to-refactored.sh status
```

### Crea Backup
```bash
./migrate-to-refactored.sh backup
```

### Esegui Migrazione
```bash
./migrate-to-refactored.sh migrate
cd backend && npm restart
```

### Rollback
```bash
./migrate-to-refactored.sh rollback
cd backend && npm restart
```

### Esegui Test
```bash
./migrate-to-refactored.sh test
```

## 🧪 Test

### Tutti i test
```bash
cd backend
npm test
```

### Test specifico
```bash
npm test imageHelpers.test.js
```

### Watch mode
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:coverage
```

### Coverage HTML
```bash
npm run test:coverage
open coverage/index.html
```

## 🔍 Verifica File

### Controlla struttura
```bash
ls -la backend/utils/
ls -la backend/services/
ls -la backend/tests/
```

### Conta righe
```bash
wc -l backend/controllers/projectController.js
wc -l backend/controllers/projectController.refactored.js
```

### Trova file modificati
```bash
find backend -name "*.js" -mtime -1
```

## 📊 Analisi Codice

### Complessità ciclomatica
```bash
npm install -g complexity-report
cr backend/controllers/projectController.js
```

### Duplicazione codice
```bash
npm install -g jsinspect
jsinspect backend/controllers/
```

### Linting
```bash
npm run lint
```

## 🔧 Debug

### Log server in tempo reale
```bash
tail -f backend/logs/server.log
```

### Filtra errori
```bash
grep "ERROR" backend/logs/server.log
```

### Filtra warning
```bash
grep "WARNING" backend/logs/server.log
```

### Monitora performance
```bash
grep "⏱️" backend/logs/server.log
```

## 🗄️ Database

### Backup MongoDB
```bash
mongodump --db csv_costruzioni --out backup/
```

### Restore MongoDB
```bash
mongorestore --db csv_costruzioni backup/csv_costruzioni/
```

### Verifica immagini senza URL
```javascript
// In MongoDB shell
db.projects.find({
  "apartments.images.url": { $exists: false }
}).count()
```

### Fix immagini senza URL
```javascript
// Usa standardizeProjectResponse su tutti i progetti
```

## 🌐 Test API

### GET progetti pubblici
```bash
curl http://localhost:5000/api/projects/public
```

### GET progetto specifico
```bash
curl http://localhost:5000/api/projects/public/[ID]
```

### POST nuovo progetto (con auth)
```bash
curl -X POST \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","category":"Residenziale"}' \
  http://localhost:5000/api/projects
```

### PUT aggiorna progetto
```bash
curl -X PUT \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}' \
  http://localhost:5000/api/projects/[ID]
```

### DELETE progetto
```bash
curl -X DELETE \
  -H "Authorization: Bearer [TOKEN]" \
  http://localhost:5000/api/projects/[ID]
```

### GET statistiche
```bash
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:5000/api/projects/stats
```

## ⚡ Performance

### Test load con Apache Bench
```bash
ab -n 100 -c 10 http://localhost:5000/api/projects/public
```

### Test load con wrk
```bash
wrk -t4 -c100 -d30s http://localhost:5000/api/projects/public
```

### Profiling Node.js
```bash
node --prof backend/index.js
node --prof-process isolate-*.log > profile.txt
```

## 🔐 Sicurezza

### Audit dipendenze
```bash
npm audit
```

### Fix vulnerabilità
```bash
npm audit fix
```

### Check outdated
```bash
npm outdated
```

### Update dipendenze
```bash
npm update
```

## 📝 Git

### Commit refactoring
```bash
git add backend/utils/ backend/services/ backend/tests/
git commit -m "refactor: modularize projectController (reduce from 2323 to 600 lines)"
```

### Tag versione
```bash
git tag -a v2.0.0 -m "Refactored architecture"
git push origin v2.0.0
```

### Crea branch
```bash
git checkout -b refactoring/modular-architecture
```

## 🚀 Deploy

### Build produzione
```bash
cd backend
npm run build
```

### Start produzione
```bash
NODE_ENV=production npm start
```

### PM2 restart
```bash
pm2 restart backend
```

### PM2 logs
```bash
pm2 logs backend
```

### PM2 monit
```bash
pm2 monit
```

## 📦 NPM Scripts Utili

### Aggiungi al package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "migrate": "./migrate-to-refactored.sh migrate",
    "rollback": "./migrate-to-refactored.sh rollback",
    "backup": "./migrate-to-refactored.sh backup"
  }
}
```

### Usa gli script
```bash
npm run test
npm run migrate
npm run rollback
```

## 🔄 Workflow Completo

### Migrazione Sicura
```bash
# 1. Backup
./migrate-to-refactored.sh backup
mongodump --db csv_costruzioni --out backup/

# 2. Test
./migrate-to-refactored.sh test

# 3. Verifica
./migrate-to-refactored.sh status

# 4. Migra
./migrate-to-refactored.sh migrate

# 5. Restart
cd backend && npm restart

# 6. Verifica funzionamento
curl http://localhost:5000/api/projects/public

# 7. Monitora
tail -f backend/logs/server.log
```

### Rollback Rapido
```bash
# 1. Stop
pm2 stop backend

# 2. Rollback
./migrate-to-refactored.sh rollback

# 3. Start
pm2 start backend

# 4. Verifica
curl http://localhost:5000/api/projects/public
```

## 🎯 Quick Reference

| Comando | Descrizione |
|---------|-------------|
| `./migrate-to-refactored.sh status` | Verifica stato |
| `./migrate-to-refactored.sh migrate` | Migra |
| `./migrate-to-refactored.sh rollback` | Rollback |
| `npm test` | Esegui test |
| `npm run test:coverage` | Coverage |
| `tail -f backend/logs/server.log` | Monitora log |
| `pm2 restart backend` | Restart server |

## 📞 Help

Per aiuto dettagliato:
```bash
./migrate-to-refactored.sh
cat REFACTORING_GUIDE.md
cat QUICK_START.md
```
