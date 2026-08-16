/**
 * Global Ambient Animation & Micro-Interactions
 */
(function initGlobalInteractions() {
  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Mouse Parallax for Global Ambient Background
  const ambientBg = document.getElementById('global-ambient-bg');
  const ambientElements = ambientBg ? Array.from(ambientBg.querySelectorAll('.ambient-element')) : [];

  if (!prefersReducedMotion && ambientElements.length > 0) {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      // Normalize to -1 to 1
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function animateParallax() {
      requestAnimationFrame(animateParallax);
      
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      ambientElements.forEach((el, index) => {
        // Vary movement based on element index (simulate depth)
        // Background elements: 3-6px max
        // Foreground elements: 8-12px max
        const depth = (index % 3) + 1; 
        const maxMoveX = depth * 4; // 4, 8, 12
        const maxMoveY = depth * 3; // 3, 6, 9

        const moveX = mouseX * maxMoveX;
        const moveY = mouseY * maxMoveY;

        // Apply additional translate alongside the CSS float animation
        // Because CSS animation handles transform, we apply parallax on marginLeft/marginTop to avoid conflict,
        // or wrap them in another div. But margins are bad for perf.
        // Actually, CSS custom properties are perfect here!
        el.style.setProperty('--px', `${moveX}px`);
        el.style.setProperty('--py', `${moveY}px`);
      });
    }
    
    // Quick CSS fix to combine var(--px) and var(--py) with the keyframe transform
    // Since we can't easily merge them in CSS without changing the keyframes,
    // we use a tiny trick: set margin-left / margin-top using the variables (it's very small movement, so layout cost is minimal,
    // BUT we want to avoid layout cost. A better way is wrapping them, but since we didn't, let's inject a style block to override the keyframes 
    // or just apply an additional translate3d using a wrapper. 
    // Wait, the simplest way is to just wrap the elements dynamically in JS so we can apply transforms without fighting CSS.
    ambientElements.forEach(el => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.inset = '0';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.pointerEvents = 'none';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      // Now el has the float animation, and wrapper will have the parallax!
      el.dataset.parallaxWrapper = 'true';
    });
    
    // Redefine animateParallax to use wrappers
    function animateParallaxOptimized() {
      requestAnimationFrame(animateParallaxOptimized);
      
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      ambientElements.forEach((el, index) => {
        const wrapper = el.parentNode;
        const depth = (index % 3) + 1; 
        const maxMoveX = depth * 4; 
        const maxMoveY = depth * 3; 

        const moveX = mouseX * maxMoveX;
        const moveY = mouseY * maxMoveY;

        wrapper.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    }
    
    animateParallaxOptimized();
  }

  // 2. Project Card Cursor Highlight
  const projectCards = document.querySelectorAll('.project-card');
  if (!prefersReducedMotion) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 3. Scroll Reveal System
  if (!prefersReducedMotion) {
    const revealOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optional: stop observing once revealed to keep it visible
          observer.unobserve(entry.target);
        }
      });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // If reduced motion, reveal everything immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  }

})();
