import { apiFetch } from "./js/api.js";

async function subscribeUser() {
    const emailInput = document.getElementById("subscriber-email");
    const email = emailInput.value.trim();
    const message = document.getElementById("subscription-message");

    if (!email) {
        message.textContent = "Please enter a valid email!";
        return;
    }

    try {
        await apiFetch("subscribers", { method: "POST", body: { email } });
        message.textContent = "Subscribed successfully!";
        emailInput.value = "";
    } catch (error) {
        message.textContent = "Error subscribing. Try again!";
    }
}

window.subscribeUser = subscribeUser;
