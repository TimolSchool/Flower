const form = document.getElementById("secret-form");
const input = document.getElementById("word");
const button = document.getElementById("submit");
const result = document.getElementById("result");

function showMessage(ok, message) {
  result.textContent = message;
  result.classList.toggle("ok", ok === true);
  result.classList.toggle("ko", ok === false);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const word = input.value.trim();
  if (!word) {
    showMessage(false, "Choisis un mot avant de vérifier.");
    input.focus();
    return;
  }

  button.disabled = true;
  showMessage(null, "Vérification…");

  try {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    const data = await response.json();
    showMessage(Boolean(data.ok), data.message || "Réponse inattendue.");
  } catch (_error) {
    showMessage(false, "Impossible de joindre le serveur.");
  } finally {
    button.disabled = false;
  }
});
