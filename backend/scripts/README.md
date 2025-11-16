# Script di Manutenzione Database

## fixImageMetadata.js

Questo script corregge i metadati delle immagini nel database che potrebbero essere incompleti.

### Cosa fa lo script:

1. **Aggiunge URL mancanti**: Se un'immagine ha un `filename` ma non ha `url`, lo genera automaticamente
2. **Deduce MIME types**: Se un'immagine non ha `mimetype`, lo deduce dall'estensione del file
3. **Aggiunge path mancanti**: Se un'immagine non ha `path`, lo genera dal filename
4. **Legge dimensioni file**: Se un'immagine non ha `size`, prova a leggerlo dal file system

### Come usare:

```bash
cd backend
node scripts/fixImageMetadata.js
```

### Quando usare:

- Dopo aver caricato immagini da mobile che potrebbero non avere tutti i metadati
- Se vedi "Immagine non disponibile" nel frontend ma i file esistono sul server
- Dopo una migrazione o import di dati
- Come manutenzione periodica del database

### Output:

Lo script fornisce un report dettagliato di:
- Numero di progetti analizzati
- Numero di progetti corretti
- Numero di immagini corrette
- Log dettagliato per ogni correzione

### Note:

- Lo script è sicuro da eseguire più volte
- Non modifica immagini che hanno già tutti i metadati
- Non elimina dati esistenti, aggiunge solo quelli mancanti
