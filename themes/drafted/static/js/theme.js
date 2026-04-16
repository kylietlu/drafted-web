const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

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
const cookieSettingsLink = document.querySelector(".footer-cookie-link");

if (cookieBanner) {
  const key = "drafted-cookie-preference";
  const existing = window.localStorage.getItem(key);

  if (!existing) {
    cookieBanner.hidden = false;
  }

  cookieBanner.querySelector(".cookie-accept")?.addEventListener("click", () => {
    window.localStorage.setItem(key, "accepted");
    cookieBanner.hidden = true;
  });

  cookieBanner.querySelector(".cookie-reject")?.addEventListener("click", () => {
    window.localStorage.setItem(key, "rejected");
    cookieBanner.hidden = true;
  });

  cookieBanner.querySelector(".cookie-settings")?.addEventListener("click", () => {
    cookieBanner.hidden = false;
  });

  cookieSettingsLink?.addEventListener("click", () => {
    cookieBanner.hidden = false;
  });
}
