import { apiFetch } from "./js/api.js";

export async function requireAuth({ roles } = {}) {
    let user;
    try {
        ({ user } = await apiFetch("auth/me"));
    } catch (err) {
        window.location.href = "login.html";
        return null;
    }

    if (roles && !roles.includes(user.role)) {
        alert("You don't have access to this page.");
        window.location.href = "homepage.html";
        return null;
    }

    return user;
}

export function wireLogout(buttonId = "logout-btn") {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener("click", async (event) => {
        event.preventDefault();
        await apiFetch("auth/logout", { method: "POST" });
        window.location.href = "login.html";
    });
}
