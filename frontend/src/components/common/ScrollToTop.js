import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente che gestisce lo scroll automatico quando si cambia pagina
 * Scorre automaticamente all'inizio della pagina quando la route cambia
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Se c'è un hash nella URL (es. #contatti), scorrere a quell'elemento
    if (hash) {
      // Piccolo timeout per assicurarsi che il DOM sia completamente caricato
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Altrimenti, scorrere all'inizio della pagina
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname, hash]); // Esegui quando cambia il pathname o l'hash

  return null; // Questo componente non renderizza nulla
};

export default ScrollToTop;
