// src/config.js
// Configurazione dinamica per sviluppo locale e produzione
export const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://csv-backend-yg2x.onrender.com');

// Debug: log dell'URL usato
console.log('🔗 API_URL configurato:', API_URL);
console.log('🌐 Hostname corrente:', window.location.hostname);