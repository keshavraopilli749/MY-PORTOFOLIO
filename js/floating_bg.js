/**
 * Floating Ambient Background Image Parallax
 */

(function initFloatingBg() {
  const bg = document.getElementById('hero-floating-bg');
  if (!bg) return;

  // State
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  
  let scrollY = 0;
  let targetScrollY = 0;

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Just center it and do nothing
    bg.style.transform = `translate(-50%, -50%)`;
    bg.style.animation = 'none'; // Clear CSS animation if any
    return;
  }

  // Remove CSS animation so JS can fully control the transform
  bg.style.animation = 'none';

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    // Normalize mouse to -1 .. 1
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Scroll tracking
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  });

  // Animation Loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);

    // Interpolation for smooth movement
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.05;
    
    time += 0.01;

    // 1. Base Float (CSS-like)
    // 12-18s duration means time scales very slowly.
    // X: -10px to +10px
    // Y: -12px to +12px
    // Rot: -1deg to +1deg
    // Scale: 1.0 to 1.025
    const floatX = Math.sin(time * 0.5) * 10;
    const floatY = Math.cos(time * 0.4) * 12;
    const floatRot = Math.sin(time * 0.3) * 1; 
    const floatScale = 1 + (Math.sin(time * 0.6) * 0.5 + 0.5) * 0.025; // 1 to 1.025

    // 2. Mouse Parallax
    // Max X: 10px, Max Y: 8px, Max Rot: 2deg
    const pX = mouseX * 10;
    const pY = mouseY * 8;
    const pRotX = mouseY * 2; // tilt Y
    const pRotY = mouseX * 2; // tilt X

    // 3. Scroll Parallax
    // translateY: 0 to -40px based on scroll
    // scale: 1 to 0.96
    const scrollFactor = Math.min(scrollY / window.innerHeight, 1); // 0 to 1 over first viewport
    const sY = scrollFactor * -40;
    const sScale = 1 - (scrollFactor * 0.04);

    // Combine all
    const totalX = floatX + pX;
    const totalY = floatY + pY + sY;
    const totalRot = floatRot;
    const totalScale = floatScale * sScale;

    // Apply transform (adding perspective for subtle 3D depth)
    bg.style.transform = `
      translate(-50%, -50%)
      perspective(1000px)
      translate3d(${totalX}px, ${totalY}px, 0)
      rotateX(${-pRotX}deg)
      rotateY(${pRotY}deg)
      rotateZ(${totalRot}deg)
      scale(${totalScale})
    `;
  }

  animate();
})();
