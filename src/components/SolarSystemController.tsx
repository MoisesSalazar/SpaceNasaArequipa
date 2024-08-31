import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';
import { gsap } from 'gsap';
import Modal from './Modal'; // Asegúrate de que la ruta sea correcta
import useModal from '../hooks/useModal'; // Asegúrate de que la ruta sea correcta

class SolarSystemController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private planets: THREE.Mesh[];
  private light: THREE.Light | null;
  private isAnimating: boolean;
  private isRaycastEnabled: boolean;
  private isPaused: boolean;
  private selectedPlanet: THREE.Mesh | null;
  private canvas: HTMLCanvasElement;
  private controlsRef: React.RefObject<OrbitControls>;
  private openModal: (id: string) => void;

  constructor(canvas: HTMLCanvasElement, controlsRef: React.RefObject<OrbitControls>, openModal: (id: string) => void) {
    this.canvas = canvas;
    this.controlsRef = controlsRef;
    this.openModal = openModal;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.planets = [];
    this.light = null;
    this.isAnimating = true;
    this.isRaycastEnabled = true;
    this.isPaused = false;
    this.selectedPlanet = null;

    this.init();
  }

  private init() {
    this.camera.position.z = 50;
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
  }

  private handleResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public updateLight = (useAmbientLight: boolean) => {
    if (this.light) {
      this.scene.remove(this.light);
    }

    if (useAmbientLight) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      this.scene.add(ambientLight);
      this.light = ambientLight;
    } else {
      const pointLight = new THREE.PointLight(0xffffff, 100, 100);
      pointLight.position.set(0, 0, 0);
      pointLight.castShadow = true;

      pointLight.shadow.mapSize.width = 1024;
      pointLight.shadow.mapSize.height = 1024;
      pointLight.shadow.camera.near = 0.5;
      pointLight.shadow.camera.far = 500;

      this.scene.add(pointLight);
      this.light = pointLight;
    }
  };

  public addPlanets(planetsData: any[]) {
    // Add the Sun
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32); // Adjust the size as needed
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color for the Sun
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(0, 0, 0); // Position the Sun at the center
    this.scene.add(sunMesh);

    // Add the planets
    this.planets = planetsData.map(planetData => {
      const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
      const planetMaterial = new THREE.MeshPhongMaterial({ color: planetData.color });
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

  private animate = () => {
    if (this.isAnimating && !this.isPaused) {
      const time = Date.now() * 0.001;

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

  private onMouseMove = (event: MouseEvent) => {
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

  private onClick = (event: MouseEvent) => {
    if (!this.isRaycastEnabled) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.planets);

    if (intersects.length > 0) {
      const intersectedPlanet = intersects[0].object as THREE.Mesh;
      console.log(intersectedPlanet.userData.name);

      // Pausar las animaciones y deshabilitar el raycasting
      this.isAnimating = false;
      this.isRaycastEnabled = false;

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

          // Calcular la nueva posición del planeta
          const newPlanetPosition = new THREE.Vector3().addVectors(intersectedPlanet.position, moveDirection.multiplyScalar(1.5));

          // Animar el planeta en la dirección calculada
          gsap.to(intersectedPlanet.position, {
            duration: 2,
            x: newPlanetPosition.x,
            y: newPlanetPosition.y,
            z: newPlanetPosition.z,
            onComplete: () => {
              this.openModal(intersectedPlanet.userData.name); // Abrir el modal con el nombre del planeta
              this.isRaycastEnabled = true; // Rehabilitar el raycasting
            }
          });
        }
      });
    }
  };

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public start() {
    this.isAnimating = true;
    this.animate();
  }

  public stop() {
    this.isAnimating = false;
  }

  public destroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
  }
}

export default SolarSystemController;
