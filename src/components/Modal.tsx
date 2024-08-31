import React from 'react';

interface ModalProps {
  onClose: () => void;
  data: any;
}

const Modal: React.FC<ModalProps> = ({ onClose, data }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>
        <h1>{data.name}</h1>
        {/* Aquí puedes mostrar más información del planeta */}
      </div>
    </div>
  );
};

export default Modal;
