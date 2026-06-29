// Utility: Throttle function to reduce scroll event frequency
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Reveal elements on scroll with Intersection Observer
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

const revealElements = Array.from(document.querySelectorAll(".reveal"));
document.body.classList.add("effects-ready");
revealElements.forEach((element) => revealObserver.observe(element));

window.setTimeout(() => {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}, 900);

// Split text into words with optimized structure
document.querySelectorAll(".intro-block p, .testimonial p").forEach((paragraph) => {
  const words = paragraph.textContent.trim().split(/\s+/);
  paragraph.setAttribute("aria-label", paragraph.textContent.trim());
  paragraph.innerHTML = words.map((word) => `<span class="scroll-word">${word}</span>`).join(" ");
});

// Scroll word highlighting with throttled updates
const scrollWords = Array.from(document.querySelectorAll(".scroll-word"));

const updateScrollWords = throttle(() => {
  scrollWords.forEach((word) => {
    const rect = word.getBoundingClientRect();
    const progress = 1 - Math.abs(rect.top + rect.height / 2 - window.innerHeight * 0.52) / (window.innerHeight * 0.52);
    word.classList.toggle("is-lit", progress > 0.38);
  });
}, 50); // Throttle to every 50ms instead of continuous

if (scrollWords.length) {
  updateScrollWords();
  window.addEventListener("scroll", updateScrollWords, { passive: true });
  window.addEventListener("resize", throttle(updateScrollWords, 200));
}

// Scroll progress bar and color wash updates with throttling
const progressBar = document.querySelector(".scroll-progress");
const colorWashSections = Array.from(document.querySelectorAll(".color-wash"));

const updateScrollEffects = throttle(() => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pageProgress = window.scrollY / maxScroll;

  if (progressBar) {
    progressBar.style.transform = `scaleX(${pageProgress})`;
  }

  colorWashSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const centerDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    const intensity = Math.max(0, 1 - centerDistance / (window.innerHeight * 0.72));
    section.style.setProperty("--wash-opacity", String(intensity * 0.9));
  });
}, 50); // Throttle to every 50ms

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", throttle(updateScrollEffects, 200));

// Transition screen setup
if (!document.querySelector(".transition-screen")) {
  const transitionScreen = document.createElement("div");
  transitionScreen.className = "transition-screen";
  transitionScreen.setAttribute("aria-hidden", "true");
  document.body.prepend(transitionScreen);
}

// Custom cursor - disabled on mobile for better performance
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMobile = window.innerWidth < 768 || window.matchMedia("(max-height: 600px)").matches;

if (canHover && !isMobile) {
  const cursor = document.createElement("div");
  const follower = document.createElement("div");
  cursor.className = "cursor";
  follower.className = "cursor-follower";
  document.body.append(cursor, follower);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;
  let cursorReady = false;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!cursorReady) {
      document.body.classList.add("cursor-ready");
      cursorReady = true;
    }
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;
  }, { passive: true });

  // Use RAF for follower animation (smoother)
  const animateCursor = () => {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate3d(-50%, -50%, 0)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  // Event delegation for link/button cursor states
  document.addEventListener("mouseenter", (e) => {
    if (e.target.matches("a, button, .magnetic")) {
      document.body.classList.add("cursor-link");
    }
  }, true);

  document.addEventListener("mouseleave", (e) => {
    if (e.target.matches("a, button, .magnetic")) {
      document.body.classList.remove("cursor-link");
    }
  }, true);

  // Hover cursor for special elements
  document.addEventListener("mouseenter", (e) => {
    const element = e.target.closest("[data-cursor]");
    if (element) {
      follower.textContent = element.dataset.cursor || "";
      document.body.classList.add("cursor-hover");
    }
  }, true);

  document.addEventListener("mouseleave", (e) => {
    const element = e.target.closest("[data-cursor]");
    if (element) {
      follower.textContent = "";
      document.body.classList.remove("cursor-hover");
    }
  }, true);

  // Magnetic effect with event delegation
  document.addEventListener("pointermove", (e) => {
    const element = e.target.closest(".magnetic, .magnetic-soft, .magnetic-row");
    if (element) {
      const strength = element.classList.contains("magnetic-soft") 
        ? 0.08 
        : element.classList.contains("magnetic-row") 
        ? 0.045 
        : 0.18;
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, { passive: true });

  document.addEventListener("pointerleave", (e) => {
    const element = e.target.closest(".magnetic, .magnetic-soft, .magnetic-row");
    if (element) {
      element.style.transform = "";
    }
  }, true);
}

// Page transitions with optimized link handling
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href$=".html"], a[href*=".html#"]');
  if (!link) return;
  
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  
  e.preventDefault();
  document.body.classList.add("is-transitioning");
  window.setTimeout(() => {
    window.location.href = link.href;
  }, 380);
}, { passive: false });

// Menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Work card videos with event delegation
const videoManager = {
  activeVideos: new Set(),
  
  setupVideos() {
    document.addEventListener("mouseenter", (e) => {
      if (e.target.closest(".work-card video")) {
        e.target.play().catch(() => {});
        this.activeVideos.add(e.target);
      }
    }, true);

    document.addEventListener("mouseleave", (e) => {
      if (e.target.closest(".work-card video")) {
        e.target.pause();
        e.target.currentTime = 0;
        this.activeVideos.delete(e.target);
      }
    }, true);

    // Intersection observer for auto-play on scroll
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && !this.activeVideos.has(video)) {
            video.play().catch(() => {});
          } else if (!entry.isIntersecting) {
            video.pause();
          }
        });
      },
      { threshold: 0.42 }
    );

    document.querySelectorAll(".work-card video").forEach((video) => cardObserver.observe(video));
  }
};

videoManager.setupVideos();

// Parallax effect - disabled on mobile and reduced-motion preference
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (parallaxItems.length && !prefersReducedMotion && !isMobile) {
  let rafId;
  
  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxItems.forEach((element) => {
      const speed = Number(element.dataset.parallax || 0.12);
      element.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
    rafId = requestAnimationFrame(updateParallax);
  };

  updateParallax();
}

// Hero video carousel
const heroVideos = Array.from(document.querySelectorAll(".hero-video"));

if (heroVideos.length) {
  let activeIndex = 0;

  const playClip = (index) => {
    const video = heroVideos[index];
    const start = Number(video.dataset.start || 0);
    const end = Number(video.dataset.end || video.duration || 0);

    heroVideos.forEach((clip, clipIndex) => {
      clip.classList.toggle("is-active", clipIndex === index);
      if (clipIndex !== index) clip.pause();
    });

    const begin = () => {
      video.currentTime = start;
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      begin();
    } else {
      video.addEventListener("loadedmetadata", begin, { once: true });
    }

    let rafId;
    const tick = () => {
      if (!video.classList.contains("is-active")) return;
      if (video.currentTime >= end) {
        activeIndex = (activeIndex + 1) % heroVideos.length;
        playClip(activeIndex);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  };

  playClip(activeIndex);
}

// Portfolio filtering
const filterButtons = document.querySelectorAll(".filter-button");
const portfolioItems = document.querySelectorAll(".portfolio-item");

if (filterButtons.length) {
  document.addEventListener("click", (e) => {
    const button = e.target.closest(".filter-button");
    if (!button) return;

    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    portfolioItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.hidden = !shouldShow;
    });
  });
}

// Contact form with WhatsApp integration
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const message = `Hey Lumothrive, I'm ${formData.get("name") || ""}. Project: ${formData.get("project") || ""}. Notes: ${formData.get("notes") || ""}`;
    window.location.href = `https://wa.me/917338989888?text=${encodeURIComponent(message)}`;
  });
}
