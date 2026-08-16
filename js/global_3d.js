/**
 * Global Three.js Ambient Animation System
 */

(function initGlobal3D() {
  const canvas = document.getElementById('global-3d-canvas');
  if (!canvas || !window.THREE) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // Do not initialize if reduced motion is requested

  // 1. Scene Setup
  const scene = new THREE.Scene();
  // Ensure the scene is transparent to let body background show through if any
  // No scene background.

  // 2. Camera Setup
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // 3. Renderer Setup
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance

  // 4. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const lightCyan = new THREE.PointLight(0xBFE8E8, 1, 100);
  lightCyan.position.set(-10, 10, 10);
  scene.add(lightCyan);

  const lightPeach = new THREE.PointLight(0xF3C8B5, 1.2, 100);
  lightPeach.position.set(10, -10, 10);
  scene.add(lightPeach);

  const lightLavender = new THREE.PointLight(0xDCD4F2, 0.8, 100);
  lightLavender.position.set(-10, -10, 5);
  scene.add(lightLavender);

  const lightGreen = new THREE.PointLight(0x176B52, 0.6, 100);
  lightGreen.position.set(10, 10, -10);
  scene.add(lightGreen);

  // 5. Materials (Frosted Glass / Translucent)
  // We use MeshPhysicalMaterial to simulate the requested glass effect.
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.9, // glass-like
    transparent: true,
    opacity: 0.8,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const solidMaterialCyan = new THREE.MeshStandardMaterial({ color: 0xBFE8E8, transparent: true, opacity: 0.5, roughness: 0.4 });
  const solidMaterialPeach = new THREE.MeshStandardMaterial({ color: 0xF3C8B5, transparent: true, opacity: 0.4, roughness: 0.4 });
  const solidMaterialLavender = new THREE.MeshStandardMaterial({ color: 0xDCD4F2, transparent: true, opacity: 0.5, roughness: 0.4 });

  const materials = [glassMaterial, solidMaterialCyan, solidMaterialPeach, solidMaterialLavender];
  
  // Geometries
  const geoSphere = new THREE.SphereGeometry(1, 32, 32);
  const geoTorus = new THREE.TorusGeometry(1, 0.3, 16, 64);
  const geoCapsule = new THREE.CapsuleGeometry(0.8, 1.5, 4, 16);
  const geoRing = new THREE.TorusGeometry(1.2, 0.05, 16, 64);

  const geometries = [geoSphere, geoTorus, geoCapsule, geoRing];

  // 6. Create Objects Group
  const objectsGroup = new THREE.Group();
  scene.add(objectsGroup);
  
  const numObjects = 12;
  const floatingObjects = [];

  for (let i = 0; i < numObjects; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    const mesh = new THREE.Mesh(geo, mat);

    // Random placement within a wide volume
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 20 - 5; // -25 to -5 (mostly behind)

    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    // Random scale (different sizes)
    const scale = Math.random() * 2 + 0.5;
    mesh.scale.set(scale, scale, scale);

    objectsGroup.add(mesh);

    floatingObjects.push({
      mesh: mesh,
      speedX: (Math.random() - 0.5) * 0.01,
      speedY: (Math.random() - 0.5) * 0.01,
      rotSpeedX: (Math.random() - 0.5) * 0.005,
      rotSpeedY: (Math.random() - 0.5) * 0.005,
      orbitPhase: Math.random() * Math.PI * 2,
      orbitRadius: Math.random() * 2 + 1,
      orbitSpeed: (Math.random() - 0.5) * 0.002,
      baseX: mesh.position.x,
      baseY: mesh.position.y,
    });
  }

  // 7. Particle System (Antigravity Field)
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 60 : 120;
  
  const particlesGeo = new THREE.BufferGeometry();
  const particlesPos = new Float32Array(particleCount * 3);
  const particlesBase = new Float32Array(particleCount * 3); // to store original positions
  
  for (let i = 0; i < particleCount * 3; i++) {
    const val = (Math.random() - 0.5) * 50;
    particlesPos[i] = val;
    particlesBase[i] = val;
  }
  
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
  particlesGeo.setAttribute('basePosition', new THREE.BufferAttribute(particlesBase, 3));

  // Subtle colors for particles
  const particleColors = [0xBFE8E8, 0xDCD4F2, 0xF7F5EF, 0x176B52];
  const colorArray = new Float32Array(particleCount * 3);
  for(let i=0; i<particleCount; i++) {
      const c = new THREE.Color(particleColors[Math.floor(Math.random() * particleColors.length)]);
      colorArray[i*3] = c.r;
      colorArray[i*3+1] = c.g;
      colorArray[i*3+2] = c.b;
  }
  particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const particlesMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });

  const particleSystem = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particleSystem);

  // 8. Interaction Tracking (Mouse & Scroll)
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let scrollY = 0;
  let targetScrollY = 0;

  // Normalized mouse coordinates for raycasting / 3D space calculation
  const mouse3D = new THREE.Vector2(-9999, -9999);

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Raycaster for particle antigravity effect
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectionPoint = new THREE.Vector3();

  // 9. Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Smooth interpolation for mouse and scroll
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.05;

    // --- Object Animations ---
    floatingObjects.forEach((obj, idx) => {
      // Base rotation
      obj.mesh.rotation.x += obj.rotSpeedX;
      obj.mesh.rotation.y += obj.rotSpeedY;

      // Base translation (sinusoidal orbit)
      obj.mesh.position.x = obj.baseX + Math.sin(time * 0.5 + obj.orbitPhase) * obj.orbitRadius;
      obj.mesh.position.y = obj.baseY + Math.cos(time * 0.4 + obj.orbitPhase) * obj.orbitRadius;
      
      // Cursor interaction (slight tilt based on mouse)
      // Objects tilt gently as if tracking the mouse
      obj.mesh.rotation.x += mouseY * 0.001; // extremely subtle
      obj.mesh.rotation.y += mouseX * 0.001;
    });

    // --- Particle Antigravity & Drift ---
    raycaster.setFromCamera(mouse3D, camera);
    raycaster.ray.intersectPlane(plane, intersectionPoint);

    const positions = particlesGeo.attributes.position.array;
    const basePositions = particlesGeo.attributes.basePosition.array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Current positions
      let px = positions[idx];
      let py = positions[idx + 1];
      let pz = positions[idx + 2];

      // Base positions
      const bx = basePositions[idx];
      const by = basePositions[idx + 1];
      const bz = basePositions[idx + 2];

      // Slow upward drift
      const driftSpeed = 0.01;
      let newBy = by + driftSpeed;
      if (newBy > 25) newBy = -25; // Wrap around
      basePositions[idx + 1] = newBy;

      // Add sinusoidal horizontal drift based on time and original position
      const waveX = Math.sin(time * 0.5 + i) * 1.5;
      const waveZ = Math.cos(time * 0.3 + i) * 1.5;

      const targetX = bx + waveX;
      const targetY = newBy;
      const targetZ = bz + waveZ;

      // Calculate distance to mouse intersection point in 3D space
      const dx = targetX - intersectionPoint.x;
      const dy = targetY - intersectionPoint.y;
      const distSq = dx*dx + dy*dy;
      const repulsionRadius = 15;
      const repulsionStrength = 2; // adjust this for stronger/weaker antigravity

      let forceX = 0;
      let forceY = 0;

      if (distSq < repulsionRadius * repulsionRadius && distSq > 0.1) {
        const dist = Math.sqrt(distSq);
        const force = (repulsionRadius - dist) / repulsionRadius; // 1 at center, 0 at edge
        forceX = (dx / dist) * force * repulsionStrength;
        forceY = (dy / dist) * force * repulsionStrength;
      }

      // Smoothly move towards (target + force)
      positions[idx] += ((targetX + forceX) - px) * 0.05;
      positions[idx + 1] += ((targetY + forceY) - py) * 0.05;
      positions[idx + 2] += (targetZ - pz) * 0.05;
    }
    
    particlesGeo.attributes.position.needsUpdate = true;
    particlesGeo.attributes.basePosition.needsUpdate = true;

    // --- Scroll Parallax ---
    // Smoothly shift camera Y based on scroll to create depth
    // Map scrollY from 0 to document height down to a small camera shift
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFactor = maxScroll > 0 ? (scrollY / maxScroll) : 0;
    
    // Shift camera down slightly as we scroll down
    camera.position.y = -scrollFactor * 20;

    renderer.render(scene, camera);
  }

  animate();
})();
