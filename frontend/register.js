import { apiFetch } from "./js/api.js";

async function registerUser(event) {
    event.preventDefault();

    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const phone = document.getElementById("phone").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        await apiFetch("auth/register", {
            method: "POST",
            body: { firstName, lastName, email, password, phone },
        });

        alert("Registration successful! Redirecting to login...");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    } catch (error) {
        alert("Registration failed: " + error.message);
    }
}

window.registerUser = registerUser;
