import { useState } from 'react';

const useModal = () => {
    const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});

    const openModal = (id: string) => {
        setOpenModals((prev) => ({ ...prev, [id]: true }));
    };

    const closeModal = (id: string) => {
        setOpenModals((prev) => ({ ...prev, [id]: false }));
    };

    const isModalOpen = (id: string) => {
        return !!openModals[id];
    };

    return {
        openModal,
        closeModal,
        isModalOpen,
    };
};

export default useModal;