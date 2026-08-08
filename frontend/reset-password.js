import { apiFetch } from "./js/api.js";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const message = document.getElementById("message");
const form = document.getElementById("reset-form");

if (!token) {
    message.style.color = "var(--danger)";
    message.textContent = "This reset link is missing its token. Please request a new one from the Forgot Password page.";
    form.querySelector("button").disabled = true;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-new-password").value;

    if (password !== confirmPassword) {
        message.style.color = "var(--danger)";
        message.textContent = "Passwords do not match.";
        return;
    }

    try {
        await apiFetch("auth/reset-password", { method: "POST", body: { token, password } });
        message.style.color = "var(--accent)";
        message.textContent = "Password updated! Redirecting to login...";
        setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (error) {
        message.style.color = "var(--danger)";
        message.textContent = error.message;
    }
});
