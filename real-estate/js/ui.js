export function initNavToggle() {
    const toggle = document.querySelector(".nav-toggle");
    const inner = document.querySelector(".navbar-inner");
    if (!toggle || !inner) return;
    toggle.addEventListener("click", () => inner.classList.toggle("menu-open"));
}

export function initIcons() {
    if (window.lucide) window.lucide.createIcons();
}
