const root = document.querySelector<HTMLDivElement>("#app");

if (root) {
  root.innerHTML = `
    <main style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 48rem;">
      <h1 style="font-size: 1.25rem;">Админка — заготовка</h1>
      <p style="color: #444; margin-top: 0.75rem;">
        Подключите React/Vue или пересоберите через <code>npm create vite@latest</code> при необходимости.
      </p>
    </main>
  `;
}
