import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';
import { gsap } from 'gsap';
import PlanetModal from './PlanetModal';  // Importa el nuevo componente
import { FaLightbulb, FaPlay, FaGlobe } from 'react-icons/fa';

class SolarSystemController {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  planets: THREE.Mesh[];
  light: THREE.Light | null;
  isAnimating: boolean;
  isRaycastEnabled: boolean;
  isShowOrbits: boolean;
  isPaused: boolean;
  setPlanets: any;
  selectedPlanet: THREE.Mesh | null;
  canvas: HTMLCanvasElement;
  controlsRef: React.RefObject<OrbitControls>;
  setSelectedPlanetInfo: React.Dispatch<React.SetStateAction<{ name: string; position: THREE.Vector3 } | null>>;
  starCube: THREE.Mesh | null;


  constructor(canvas: HTMLCanvasElement,
    controlsRef: React.RefObject<OrbitControls>,
    setSelectedPlanetInfo: React.Dispatch<React.SetStateAction<{ name: string; position: THREE.Vector3 } | null>>
  ) {
    this.canvas = canvas;
    this.controlsRef = controlsRef;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.planets = [];
    this.light = null;
    this.setPlanets = [];
    this.isAnimating = true;
    this.isRaycastEnabled = true;
    this.isShowOrbits = false;
    this.isPaused = false;
    this.selectedPlanet = null;
    this.setSelectedPlanetInfo = setSelectedPlanetInfo;
    this.starCube = null;

    this.init();
  }

  init() {
    this.camera.position.set(0, 20, 100); // Modifica la posición por defecto de la cámara
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.5;
    this.controls.enableZoom = true;
    this.controlsRef.current = this.controls;

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);

    // Set default light to PointLight
    this.updateLight(false);

    // Add star cube
  this.addStarCube();
  }

  handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  updateLight = (useAmbientLight: boolean) => {
    if (this.light) {
      this.scene.remove(this.light);
    }

    // Añadir luz ambiental muy suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Intensidad muy baja para iluminación mínima
    this.scene.add(ambientLight);

    if (useAmbientLight) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Mantener la intensidad baja
      this.scene.add(ambientLight);
      this.light = ambientLight;
    } else {
      const pointLight = new THREE.PointLight(0xffffff, 200, 200); // Mantener la intensidad alta
      pointLight.position.set(0, 0, 0);
      pointLight.castShadow = true;

      // Ajustar las propiedades de la sombra para suavizarla
      pointLight.shadow.mapSize.width = 4096; // Aumenta la resolución del mapa de sombras
      pointLight.shadow.mapSize.height = 4096; // Aumenta la resolución del mapa de sombras
      pointLight.shadow.camera.near = 0.5;
      pointLight.shadow.camera.far = 1000; // Aumenta la distancia de la cámara de sombras
      pointLight.shadow.radius = 4; // Aumenta el radio de la sombra para suavizarla

      this.scene.add(pointLight);
      this.light = pointLight;
    }

    // Configurar el renderizador para usar sombras suaves
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Usar sombras suaves
  };

  //orbita


  addPlanets(planetsData: any[]) {
    const textureLoader = new THREE.TextureLoader();

    // Add the Sun
    const sunTexture = textureLoader.load('./8k_sun.jpg'); // Asegúrate de usar la ruta correcta a tu textura

    const sunGeometry = new THREE.SphereGeometry(1, 64, 64); // Aumenta el número de segmentos
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); // Aplica la textura al material
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(0, 0, 0); // Posiciona el Sol en el centro
    this.scene.add(sunMesh);

    // Add the planets and their orbits
    this.planets = planetsData.map(planetData => {
      // Create the planet
      const planetGeometry = new THREE.SphereGeometry(planetData.radius, 64, 64); // Aumenta el número de segmentos
      const planetTexture = textureLoader.load(`./${planetData.image}`);
      const planetMaterial = new THREE.MeshPhongMaterial({ map: planetTexture });
      const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
      planetMesh.userData = {
        name: planetData.name,
        orbitPeriod: planetData.orbitPeriod,
        distanceFromSun: planetData.distanceFromSun * 10,
      };
      this.scene.add(planetMesh);

      return planetMesh;
    });
  }

  addStarCube() {
    const size = 1000;
    const starTexture = new THREE.TextureLoader().load('./8k_stars.jpg'); // Asegúrate de usar la ruta correcta a tu textura
    const starMaterial = new THREE.MeshBasicMaterial({
      map: starTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    });

    const starGeometry = new THREE.BoxGeometry(size, size, size);
    this.starCube = new THREE.Mesh(starGeometry, starMaterial);
    this.scene.add(this.starCube);

  }

  addOrbitsAndToggleVisibility = (planetsData: any, isShowOrbits: boolean) => {
    planetsData.forEach((planetData: any) => {
      const orbitName = `${planetData.name}_orbit`;
      const existingOrbit = this.scene.getObjectByName(orbitName);

      if (existingOrbit) {
        // Si la órbita ya existe, solo ajusta su visibilidad
        existingOrbit.visible = isShowOrbits;
      } else if (isShowOrbits) {
        // Si la órbita no existe y se deben mostrar las órbitas, créala
        const orbitPoints = [];
        const segments = 128; // Aumenta el número de segmentos para mayor definición
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * 2 * Math.PI;
          const x = planetData.distanceFromSun * 10 * Math.cos(theta);
          const z = planetData.distanceFromSun * 10 * Math.sin(theta);
          orbitPoints.push(new THREE.Vector3(x, 0, z));
        }
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 }); // Línea más delgada
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        orbitLine.name = orbitName; // Asigna el nombre a la órbita
        orbitLine.visible = isShowOrbits; // Establece la visibilidad basada en isShowOrbits
        this.scene.add(orbitLine);
      }
    });
  };

  animate = () => {
    if (this.isAnimating && !this.isPaused) {
      const time = Date.now() * 0.0001;

      this.planets.forEach((planet: THREE.Mesh) => {
        if (planet !== this.selectedPlanet) {
          const { orbitPeriod, distanceFromSun } = planet.userData;
          const angle = time / orbitPeriod;
          planet.position.x = distanceFromSun * Math.cos(angle);
          planet.position.z = distanceFromSun * Math.sin(angle);
        }
      });
    }

    if (this.selectedPlanet) {
      this.selectedPlanet.rotation.y += 0.01;
    }

    this.controls.update();
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate);
  };

  onMouseMove = (event: MouseEvent) => {
    if (!this.isRaycastEnabled) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.planets);

    if (intersects.length > 0) {
      const intersectedPlanet = intersects[0].object as THREE.Mesh;
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'default';
    }
  };

  onClick = (event: MouseEvent) => {
    if (!this.isRaycastEnabled) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.planets);

    if (intersects.length > 0) {

      //Desactivar las orbitas
      this.addOrbitsAndToggleVisibility(this.setPlanets, true);
      console.log(this.planets);
      const intersectedPlanet = intersects[0].object as THREE.Mesh;
      console.log(intersectedPlanet.userData.name);

      // Pausar las animaciones y deshabilitar el raycasting
      this.isAnimating = false;
      this.isRaycastEnabled = false;
      this.isShowOrbits = false;

      // Calcular la dirección desde el planeta a la cámara
      const direction = new THREE.Vector3().subVectors(this.camera.position, intersectedPlanet.position).normalize();

      // Calcular la distancia adecuada basada en el tamaño del planeta
      const planetBoundingBox = new THREE.Box3().setFromObject(intersectedPlanet);
      const planetSize = planetBoundingBox.getSize(new THREE.Vector3());
      const distance = Math.max(planetSize.x, planetSize.y, planetSize.z) * 1.5;

      // Calcular la nueva posición de la cámara a la distancia adecuada detrás del planeta
      const newPosition = new THREE.Vector3().addVectors(intersectedPlanet.position, direction.multiplyScalar(distance));

      // Actualizar el centro de órbita a la posición del planeta seleccionado
      this.controls.target.copy(intersectedPlanet.position);

      // Animar la cámara hacia la nueva posición
      gsap.to(this.camera.position, {
        duration: 4,
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        onUpdate: () => {
          this.camera.lookAt(intersectedPlanet.position);
        },
        onComplete: () => {
          // Imprimir la posición de la cámara y del planeta en la consola
          console.log(`Camera position: x=${this.camera.position.x}, y=${this.camera.position.y}, z=${this.camera.position.z}`);
          console.log(`Planet position: x=${intersectedPlanet.position.x}, y=${intersectedPlanet.position.y}, z=${intersectedPlanet.position.z}`);

          // Calcular la dirección del movimiento en el espacio de la cámara
          const moveDirection = new THREE.Vector3(1, 0, 0); // Mover en el eje X de la cámara
          moveDirection.applyQuaternion(this.camera.quaternion); // Transformar al espacio del mundo

          // Calcular la distancia de movimiento proporcional al tamaño del planeta
          const moveDistance = Math.max(planetSize.x, planetSize.y, planetSize.z) * 0.7;

          // Calcular la nueva posición del planeta
          const newPlanetPosition = new THREE.Vector3().addVectors(intersectedPlanet.position, moveDirection.multiplyScalar(moveDistance));

          // Animar el planeta en la dirección calculada
          gsap.to(intersectedPlanet.position, {
            duration: 2,
            x: newPlanetPosition.x,
            y: newPlanetPosition.y,
            z: newPlanetPosition.z,
            onComplete: () => {
              // Imprimir la nueva posición del planeta en la consola
              console.log(`New Planet position: x=${intersectedPlanet.position.x}, y=${intersectedPlanet.position.y}, z=${intersectedPlanet.position.z}`);
              // Luego de 0.5 segundos abrir la ventana de información

              // Mostrar información del planeta en el modal
              this.setSelectedPlanetInfo({
                name: intersectedPlanet.userData.name,
                position: intersectedPlanet.position,
              });
            }
          });

        }
      });

      this.selectedPlanet = intersectedPlanet;
    }
  };
  resumeAnimations = () => {
    this.isAnimating = true;
    this.isRaycastEnabled = true;
    this.isShowOrbits = true;
    this.selectedPlanet = null;
    this.isPaused = false;
    if (this.controlsRef.current) {
      this.controlsRef.current.reset();
    }
  };

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
    cancelAnimationFrame(requestAnimationFrame(() => { }));
    this.renderer.dispose();
  }
}

const SolarSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [useAmbientLight, setUseAmbientLight] = useState(false); // Default to PointLight
  const [solarSystemData, setSolarSystemData] = useState<any | null>(null);
  const [controller, setController] = useState<SolarSystemController | null>(null);
  const [selectedPlanetInfo, setSelectedPlanetInfo] = useState<{ name: string; position: THREE.Vector3 } | null>(null);
  const [showOrbits, setShowOrbits] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fetchSolarSystemData = async () => {
      const response = await fetch('./planets.json');
      const data = await response.json();
      setSolarSystemData(data.solarSystem);
    };

    fetchSolarSystemData();

    const newController = new SolarSystemController(canvasRef.current, controlsRef, setSelectedPlanetInfo);
    setController(newController);

    return () => {
      newController.dispose();
    };
  }, []);

  useEffect(() => {
    if (controller && solarSystemData) {
      controller.addPlanets(solarSystemData.planets);
      controller.setPlanets = solarSystemData.planets;
      controller.animate();
    }
  }, [controller, solarSystemData]);


  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '30px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '15px 30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        fontSize: '48px',  // Tamaño del contenedor
        justifyContent: 'center',
        alignItems: 'center',
        width: 'auto',  // Asegúrate de que el contenedor no esté limitando el tamaño
        height: 'auto'
      }}>
        <FaLightbulb
          onClick={() => {
            if (controller) {
              controller.updateLight(!useAmbientLight);
              setUseAmbientLight(!useAmbientLight);
            }
          }}
          style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '48px',  // Tamaño del ícono
            color: useAmbientLight ? '#f39c12' : '#7f8c8d',
            transition: 'transform 0.2s, background-color 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          title={useAmbientLight ? 'Cambiar a PointLight' : 'Cambiar a AmbientLight'}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        <FaPlay
          onClick={() => controller?.resumeAnimations()}
          style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '48px',  // Tamaño del ícono
            color: '#27ae60',
            transition: 'transform 0.2s, background-color 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          title="Galaxia"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        <FaGlobe
          onClick={() => {
            if (controller) {
              const newShowOrbits = !showOrbits;
              controller.isShowOrbits = newShowOrbits;
              controller.addOrbitsAndToggleVisibility(solarSystemData.planets, newShowOrbits);
              setShowOrbits(newShowOrbits);
            }
          }}
          style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '48px',  // Tamaño del ícono
            color: showOrbits ? '#2980b9' : '#7f8c8d',
            transition: 'transform 0.2s, background-color 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          title={showOrbits ? 'Hide Orbits' : 'Show Orbits'}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />
      </div>

      <PlanetModal
        planetInfo={selectedPlanetInfo}
        onClose={() => {
          setSelectedPlanetInfo(null);
          controller?.resumeAnimations();
        }}
      />
    </div>
  );

};

export default SolarSystem;
