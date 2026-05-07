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

const googleAnalyticsId = "G-C5TM5NBKWK";
let googleAnalyticsLoaded = false;

const loadGoogleAnalytics = () => {
  if (!googleAnalyticsId || googleAnalyticsLoaded) return;
  googleAnalyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`;
  document.head.appendChild(script);
};

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

for (const form of document.querySelectorAll("form[data-formspree]")) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = form.querySelector("[data-form-status]");
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    if (status) {
      status.textContent = "Sending…";
      status.classList.remove("is-error", "is-success");
    }
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");

      form.reset();
      if (status) {
        status.textContent = "Thanks! Your message has been sent.";
        status.classList.add("is-success");
      }
    } catch {
      if (status) {
        status.textContent = "Something went wrong. Please email me directly at draftedbykylie@gmail.com.";
        status.classList.add("is-error");
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const cookieBanner = document.querySelector(".cookie-banner");
const cookieModal = document.querySelector(".cookie-modal");
const cookieSettingsForm = document.querySelector(".cookie-settings-form");
const cookieSettingsLinks = document.querySelectorAll(".footer-cookie-link");

if (cookieBanner || cookieModal) {
  const key = "drafted-cookie-preference";
  const settingsKey = "drafted-cookie-settings";
  const getStoredValue = (storageKey) => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };
  const setStoredValue = (storageKey, value) => {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // Ignore storage failures; the banner and settings modal should still be usable.
    }
  };
  const getPreference = () => getStoredValue(key);
  const setPreference = (value) => setStoredValue(key, value);
  const showCookieBanner = () => {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
    cookieBanner.removeAttribute("hidden");
  };
  const hideCookieBanner = () => {
    if (!cookieBanner) return;
    cookieBanner.hidden = true;
    cookieBanner.setAttribute("hidden", "");
  };
  const showCookieModal = () => {
    if (!cookieModal) return;
    const savedSettings = getStoredValue(settingsKey);
    if (cookieSettingsForm) {
      let settings = {
        functionality: getPreference() === "accepted",
        analytics: getPreference() === "accepted",
        targeting: getPreference() === "accepted",
      };

      if (savedSettings) {
        try {
          settings = { ...settings, ...JSON.parse(savedSettings) };
        } catch {
          // Ignore malformed saved settings.
        }
      }

      cookieSettingsForm.elements.functionality.checked = Boolean(settings.functionality);
      cookieSettingsForm.elements.analytics.checked = Boolean(settings.analytics);
      cookieSettingsForm.elements.targeting.checked = Boolean(settings.targeting);
    }
    hideCookieBanner();
    cookieModal.hidden = false;
    cookieModal.removeAttribute("hidden");
    cookieModal.setAttribute("aria-hidden", "false");
  };
  const hideCookieModal = () => {
    if (!cookieModal) return;
    cookieModal.hidden = true;
    cookieModal.setAttribute("hidden", "");
    cookieModal.setAttribute("aria-hidden", "true");
  };
  const analyticsAccepted = () => {
    const savedSettings = getStoredValue(settingsKey);
    if (!savedSettings) return getPreference() === "accepted";
    try {
      return Boolean(JSON.parse(savedSettings).analytics);
    } catch {
      return false;
    }
  };
  const saveCookieSettings = (settings, preference = "custom") => {
    setPreference(preference);
    setStoredValue(settingsKey, JSON.stringify({ essential: true, ...settings }));
    if (settings.analytics) loadGoogleAnalytics();
    hideCookieBanner();
    hideCookieModal();
  };

  if (analyticsAccepted()) {
    loadGoogleAnalytics();
  }

  if (!getPreference()) {
    showCookieBanner();
  }

  cookieBanner?.querySelector(".cookie-accept")?.addEventListener("click", () => {
    saveCookieSettings({ functionality: true, analytics: true, targeting: true }, "accepted");
  });

  cookieBanner?.querySelector(".cookie-reject")?.addEventListener("click", () => {
    saveCookieSettings({ functionality: false, analytics: false, targeting: false }, "rejected");
  });

  cookieBanner?.querySelector(".cookie-settings")?.addEventListener("click", showCookieModal);

  cookieSettingsForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCookieSettings({
      functionality: Boolean(cookieSettingsForm.elements.functionality?.checked),
      analytics: Boolean(cookieSettingsForm.elements.analytics?.checked),
      targeting: Boolean(cookieSettingsForm.elements.targeting?.checked),
    });
  });

  cookieModal?.querySelectorAll("[data-cookie-modal-close]").forEach((button) => {
    button.addEventListener("click", hideCookieModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cookieModal && !cookieModal.hidden) {
      hideCookieModal();
    }
  });

  cookieSettingsLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showCookieModal();
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
