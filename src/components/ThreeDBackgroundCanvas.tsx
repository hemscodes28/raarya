import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeDBackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    // 2. Minimal Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd97757, 1.8);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4af37, 1.2);
    dirLight2.position.set(-10, -10, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 30);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    // 3. Minimal 3D Fluid Liquid Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(4.2, 32);
    const initialPositions = new Float32Array(sphereGeo.attributes.position.array);

    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xd97757,
      roughness: 0.25,
      metalness: 0.15,
      transparent: true,
      opacity: 0.28,
      wireframe: false,
    });

    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // Outer Soft Glow Ring
    const haloGeo = new THREE.TorusGeometry(5.8, 0.04, 16, 100);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.2,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 3;
    scene.add(haloMesh);

    // Subtle Ambient Floating Light Dust (Minimal)
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 30;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.15,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 4. Mouse & Touch Motion Dampening
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetMouseX = (e.clientX - windowHalfX) * 0.0005;
      targetMouseY = (e.clientY - windowHalfY) * 0.0005;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        targetMouseX = (e.touches[0].clientX - windowHalfX) * 0.0008;
        targetMouseY = (e.touches[0].clientY - windowHalfY) * 0.0008;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // 5. 3D Animation & Liquid Morph Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Fluid Sine Wave Vertex Displacement (Smooth 3D liquid morph)
      const positionAttribute = sphereGeo.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = initialPositions[i * 3];
        const y = initialPositions[i * 3 + 1];
        const z = initialPositions[i * 3 + 2];

        const wave = Math.sin(time * 1.4 + x * 0.6 + y * 0.6) * 0.2 + Math.cos(time * 1.1 + z * 0.6) * 0.12;
        const factor = 1 + wave * 0.07;

        positionAttribute.setXYZ(i, x * factor, y * factor, z * factor);
      }
      positionAttribute.needsUpdate = true;

      // Slow 3D Rotations
      sphereMesh.rotation.y = time * 0.08;
      sphereMesh.rotation.x = time * 0.04;

      haloMesh.rotation.z = time * 0.05;
      dustParticles.rotation.y = time * 0.02;

      // Subtle float position
      sphereMesh.position.y = Math.sin(time * 0.7) * 0.35;

      // Smooth mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      scene.rotation.y = currentMouseX;
      scene.rotation.x = currentMouseY;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      sphereGeo.dispose();
      sphereMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
