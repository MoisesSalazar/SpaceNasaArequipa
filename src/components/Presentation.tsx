import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PresentationProps {
  onStartJourney: () => void;
}

const Presentation: React.FC<PresentationProps> = ({ onStartJourney }) => {
  const earthRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!earthRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, earthRef.current.clientWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(earthRef.current.clientWidth, window.innerHeight); // Ajustar el tamaño del renderizado
    earthRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(3, 32, 32); // Aumentar el tamaño de la esfera en un 300%
    const texture = new THREE.TextureLoader().load('8k_earth_clouds.jpg'); // Asegúrate de usar una textura optimizada
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Mover la esfera en el eje x
    earth.position.x = -1.2; // Ajusta este valor según sea necesario

    // Añadir una luz para mejorar la apariencia
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    camera.position.z = 6; // Ajustar la posición de la cámara para el nuevo tamaño

    const handleResize = () => {
      camera.aspect = earthRef.current.clientWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(earthRef.current.clientWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      earth.rotation.y += 0.001; // Reducir la velocidad de rotación
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      earthRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const targetDate = new Date('2024-10-05T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft('Evento terminado');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.earthContainer} ref={earthRef}></div>
      <div style={styles.separator}></div>
      <div style={styles.textContainer}>
        <h1 style={styles.title}>
          NASA<br />
          Space Apps  <br />
          Challenge<br />
          Arequipa
        </h1>
        <p style={styles.description}>No te quedes fuera y participa
          <br />
          {timeLeft}
        </p>
        <button onClick={onStartJourney} style={styles.button}>Inicia tu viaje</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: 'black',
    color: 'white',
    fontFamily: "'Fira Sans', sans-serif", // Aplicar la fuente a todo el contenedor
  },
  earthContainer: {
    flex: '0 0 40%', // Ocupa el 40% del ancho
    height: '100vh', // Ocupa todo el alto
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: '6px', // Hacer la línea más gruesa
    backgroundColor: 'red',
    margin: '0 20px',
    height: '60%', // Reducir el alto de la línea en un 40%
    alignSelf: 'center', // Centrar verticalmente
  },
  textContainer: {
    flex: '1', // Ocupa el resto del espacio
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start', // Alinear el texto a la izquierda
    textAlign: 'left', // Alinear el texto a la izquierda
  },
  title: {
    fontSize: '3rem',
    margin: '0.5rem 0',
    fontWeight: 900, // Aplicar el peso de la fuente Black
    fontFamily: "'Fira Sans', sans-serif", // Aplicar la fuente Fira Sans
    lineHeight: '1.2', // Ajustar el interlineado
  },
  description: {
    fontSize: '1.2rem',
    margin: '0.5rem 0',
    fontFamily: "'Overpass', sans-serif", // Aplicar la fuente Overpass
  },
  timer: {
    fontSize: '1.2rem',
    margin: '0.5rem 0',
    fontFamily: "'Overpass', sans-serif", // Aplicar la fuente Overpass
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#EAFE07', // Cambiar el color del botón
    color: 'black', // Cambiar el color del texto del botón
    border: 'none',
    borderRadius: '5px',
    marginTop: '1rem',
    fontWeight: 900, // Aplicar el peso de la fuente Black
  },
};

export default Presentation;