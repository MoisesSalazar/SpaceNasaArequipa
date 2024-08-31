import React from 'react';
import * as THREE from 'three';

interface PlanetModalProps {
  planetInfo: { name: string; position: THREE.Vector3 } | null;
  onClose: () => void;
}

const PlanetModal: React.FC<PlanetModalProps> = ({ planetInfo, onClose }) => {
  if (!planetInfo) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-start z-20">
      <div className="bg-blue-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md h-auto transform translate-x-10 animate-fadeIn">
        <h2 className="text-2xl font-bold border-b-2 border-red-600 pb-2 mb-4">{planetInfo.name}</h2>
        <p className="mb-2">Posición:</p>
        <p className="mb-1">x: {planetInfo.position.x.toFixed(2)}</p>
        <p className="mb-1">y: {planetInfo.position.y.toFixed(2)}</p>
        <p className="mb-4">z: {planetInfo.position.z.toFixed(2)}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(10%);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 1.5s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default PlanetModal;