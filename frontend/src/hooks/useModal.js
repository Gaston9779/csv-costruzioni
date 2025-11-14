import { useState } from 'react';

/**
 * Hook personalizzato per gestire lo stato di una modale
 * @param {string} name - Nome della modale per logging
 * @returns {Object} - { isOpen, open, close }
 */
const useModal = (name = 'Modal') => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    console.log(`[useModal][${name}] Opening modal`);
    setIsOpen(true);
  };
  
  const close = () => {
    console.log(`[useModal][${name}] Closing modal`);
    setIsOpen(false);
  };

  return { isOpen, open, close };
};

export default useModal;
