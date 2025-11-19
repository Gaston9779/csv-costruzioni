# Render Keep-Alive Setup

## Problema
Render Free Tier spegne il server dopo 15 minuti di inattività, causando cold start di 50+ secondi.

## Soluzione: UptimeRobot (Gratuito)

### 1. Crea account su UptimeRobot
https://uptimerobot.com/

### 2. Aggiungi Monitor
- **Monitor Type**: HTTP(s)
- **Friendly Name**: CSV Backend
- **URL**: `https://csv-backend-yg2x.onrender.com/health`
- **Monitoring Interval**: 5 minuti (massimo gratuito)

### 3. Configura Alert
- Email quando il server va down
- Email quando torna up

## Risultato
Il server riceverà un ping ogni 5 minuti, evitando lo spegnimento automatico.

## Alternative
- **Cron-job.org**: https://cron-job.org/
- **Freshping**: https://www.freshworks.com/website-monitoring/

## Note
- Il piano gratuito di Render ha comunque limiti di banda
- Per performance ottimali, considera Render Paid ($7/mese) o Railway
