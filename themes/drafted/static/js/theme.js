const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

const updateHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const updateActiveNavLink = () => {
  if (!siteNav) return;

  const links = Array.from(siteNav.querySelectorAll("a:not(.header-cta)"));
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  const currentHash = window.location.hash;

  let activeLink = null;

  if (currentHash) {
    activeLink = links.find((link) => {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      const linkPath = url.pathname.replace(/\/$/, "") || "/";
      return linkPath === currentPath && url.hash === currentHash;
    });
  }

  if (!activeLink) {
    activeLink = links.find((link) => {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      const linkPath = url.pathname.replace(/\/$/, "") || "/";
      return linkPath === currentPath && !url.hash;
    });
  }

  links.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

updateActiveNavLink();
window.addEventListener("hashchange", updateActiveNavLink);

for (const form of document.querySelectorAll("form[data-mailto]")) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.getAttribute("data-mailto");
    const subject = form.getAttribute("data-subject") || "Website form";
    const data = new FormData(form);
    const body = Array.from(data.entries())
      .filter(([, value]) => String(value).trim() !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const cookieBanner = document.querySelector(".cookie-banner");
const cookieSettingsLinks = document.querySelectorAll(".footer-cookie-link");

if (cookieBanner) {
  const key = "drafted-cookie-preference";
  const getPreference = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const setPreference = (value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures; the banner should still be usable.
    }
  };
  const showCookieBanner = () => {
    cookieBanner.hidden = false;
    cookieBanner.removeAttribute("hidden");
  };
  const hideCookieBanner = () => {
    cookieBanner.hidden = true;
    cookieBanner.setAttribute("hidden", "");
  };

  if (!getPreference()) {
    showCookieBanner();
  }

  cookieBanner.querySelector(".cookie-accept")?.addEventListener("click", () => {
    setPreference("accepted");
    hideCookieBanner();
  });

  cookieBanner.querySelector(".cookie-reject")?.addEventListener("click", () => {
    setPreference("rejected");
    hideCookieBanner();
  });

  cookieBanner.querySelector(".cookie-settings")?.addEventListener("click", showCookieBanner);

  cookieSettingsLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showCookieBanner();
    });
  });
}

const revealTargets = document.querySelectorAll(
  ".section-heading, .testimonial-card, .stat-card, .case-card, .portfolio-card, .blog-card, .blog-feature, .form-card, .prose.card, .article-card"
);

if (prefersReducedMotion) {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
} else {
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    const revealDelay = element.matches(".blog-card, .blog-feature") ? 0 : Math.min(index % 6, 5) * 70;
    element.style.setProperty("--reveal-delay", `${revealDelay}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
}

const animateCount = (element) => {
  const original = element.textContent.trim();
  const match = original.match(/^(\d+)(.*)$/);
  if (!match) return;

  const end = Number.parseInt(match[1], 10);
  const suffix = match[2] || "";
  const duration = 1400;
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.floor(end * eased)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = original;
    }
  };

  requestAnimationFrame(step);
};

for (const stat of document.querySelectorAll(".stat-card strong")) {
  stat.classList.add("stat-number");
  if (prefersReducedMotion) continue;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    },
    { threshold: 0.6 }
  );

  observer.observe(stat);
}
