import React from 'react';
import logo from '../assets/logos/logo01.png'; // Asegúrate de tener un logo en esta ruta
import { FaEnvelope, FaPhone, FaBars } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado

const Header: React.FC = () => {
  return (
    <header style={styles.header}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <div style={styles.nav}>
        <a href="#contact" style={styles.navItem}>Contacto</a>
        <a href="#newsletter" style={styles.navItem}>Newsletter</a>
        <FaBars style={styles.icon} />
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: 'rgba(7, 16, 63, 1.00)', // Cambiar el fondo del header
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute', // Hacer que el header esté en posición absoluta
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000, // Asegurarse de que esté por encima de todo
  },
  logo: {
    height: '40px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
  },
  navItem: {
    color: 'white',
    marginLeft: '20px',
    textDecoration: 'none',
    fontSize: '16px',
  },
  icon: {
    color: 'white',
    marginLeft: '20px',
    fontSize: '24px',
    cursor: 'pointer',
  },
};

export default Header;