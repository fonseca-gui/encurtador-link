
const form = document.querySelector("#shorten-form");
const urlInput = document.querySelector("#url");
const submitButton = document.querySelector("#submit-button");
const result = document.querySelector("#result");
const shortUrl = document.querySelector("#short-url");
const destination = document.querySelector("#destination");
const copyButton = document.querySelector("#copy-button");
const feedback = document.querySelector("#feedback");
const message = document.querySelector("#message");

let currentShortUrl = "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  result.hidden = true;
  message.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Encurtando...";

  try {
    const response = await fetch("/api/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: urlInput.value.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível criar o link.");
    }

    currentShortUrl = data.shortUrl;

    shortUrl.href = data.shortUrl;
    shortUrl.textContent = data.shortUrl;
    destination.textContent = `Destino: ${data.originalUrl}`;
    feedback.textContent = "Acessos: 0";
    copyButton.textContent = "Copiar";
    result.hidden = false;
  } catch (error) {
    message.textContent =
      error.message || "Não foi possível conectar ao servidor.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Encurtar link";
  }
});

copyButton.addEventListener("click", async () => {
  if (!currentShortUrl) return;

  try {
    await navigator.clipboard.writeText(currentShortUrl);
    copyButton.textContent = "Copiado!";
  } catch {
    feedback.textContent =
      "Não foi possível copiar automaticamente. Selecione o link e copie manualmente.";
  }
});
