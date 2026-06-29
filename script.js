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

document.querySelectorAll(".intro-block p, .testimonial p").forEach((paragraph) => {
  const words = paragraph.textContent.trim().split(/\s+/);
  paragraph.setAttribute("aria-label", paragraph.textContent.trim());
  paragraph.innerHTML = words.map((word) => `<span class="scroll-word">${word}</span>`).join(" ");
});

const scrollWords = Array.from(document.querySelectorAll(".scroll-word"));

const updateScrollWords = () => {
  scrollWords.forEach((word) => {
    const rect = word.getBoundingClientRect();
    const progress = 1 - Math.abs(rect.top + rect.height / 2 - window.innerHeight * 0.52) / (window.innerHeight * 0.52);
    word.classList.toggle("is-lit", progress > 0.38);
  });
};

if (scrollWords.length) {
  updateScrollWords();
  window.addEventListener("scroll", updateScrollWords, { passive: true });
  window.addEventListener("resize", updateScrollWords);
}

const progressBar = document.querySelector(".scroll-progress");
const colorWashSections = Array.from(document.querySelectorAll(".color-wash"));

const updateScrollEffects = () => {
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
};

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);

if (!document.querySelector(".transition-screen")) {
  const transitionScreen = document.createElement("div");
  transitionScreen.className = "transition-screen";
  transitionScreen.setAttribute("aria-hidden", "true");
  document.body.prepend(transitionScreen);
}

const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canHover) {
  const cursor = document.createElement("div");
  const follower = document.createElement("div");
  cursor.className = "cursor";
  follower.className = "cursor-follower";
  document.body.append(cursor, follower);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.body.classList.add("cursor-ready");
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;
  });

  const animateCursor = () => {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate3d(-50%, -50%, 0)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  document.querySelectorAll("a, button, .magnetic").forEach((element) => {
    element.addEventListener("mouseenter", () => document.body.classList.add("cursor-link"));
    element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-link"));
  });

  document.querySelectorAll("[data-cursor]").forEach((element) => {
    element.addEventListener("mouseenter", () => {
      follower.textContent = element.dataset.cursor || "";
      document.body.classList.add("cursor-hover");
    });
    element.addEventListener("mouseleave", () => {
      follower.textContent = "";
      document.body.classList.remove("cursor-hover");
    });
  });

  document.querySelectorAll(".magnetic, .magnetic-soft, .magnetic-row").forEach((element) => {
    const strength = element.classList.contains("magnetic-soft") ? 0.08 : element.classList.contains("magnetic-row") ? 0.045 : 0.18;
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * strength;
      const y = (event.clientY - rect.top - rect.height / 2) * strength;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    document.body.classList.add("is-transitioning");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 380);
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".work-card video").forEach((video) => {
  const play = () => video.play().catch(() => {});
  const pause = () => {
    video.pause();
    video.currentTime = 0;
  };

  video.addEventListener("mouseenter", play);
  video.addEventListener("mouseleave", pause);
  video.addEventListener("focus", play);
  video.addEventListener("blur", pause);
});

const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.42 }
);

document.querySelectorAll(".work-card video").forEach((video) => cardObserver.observe(video));

const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));

if (parallaxItems.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxItems.forEach((element) => {
      const speed = Number(element.dataset.parallax || 0.12);
      element.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
    requestAnimationFrame(updateParallax);
  };

  requestAnimationFrame(updateParallax);
}

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

    const tick = () => {
      if (!video.classList.contains("is-active")) return;
      if (video.currentTime >= end) {
        activeIndex = (activeIndex + 1) % heroVideos.length;
        playClip(activeIndex);
        return;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  playClip(activeIndex);
}

const filterButtons = document.querySelectorAll(".filter-button");
const portfolioItems = document.querySelectorAll(".portfolio-item");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    portfolioItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.hidden = !shouldShow;
    });
  });
});

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const message = `Hey Lumothrive, I'm ${formData.get("name") || ""}. Project: ${formData.get("project") || ""}. Notes: ${formData.get("notes") || ""}`;
    window.location.href = `https://wa.me/917338989888?text=${encodeURIComponent(message)}`;
  });
}
