import { apiFetch } from "./js/api.js";

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember").checked;
    const errorMessage = document.getElementById("error-message");

    try {
        const { user } = await apiFetch("auth/login", {
            method: "POST",
            body: { email, password, remember },
        });

        window.location.href = user.role === "admin" ? "Admi.html" : "dashboard.html";
    } catch (error) {
        errorMessage.textContent = "Invalid email or password. Try again.";
        errorMessage.style.color = "red";
    }
});
