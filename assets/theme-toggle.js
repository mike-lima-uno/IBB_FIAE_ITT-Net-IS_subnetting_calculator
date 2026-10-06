const themePreference = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
let hasManualTheme = false;

function updateThemeButton() {
  const isDark = document.documentElement.classList.contains("dark");
  const action = isDark ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.setAttribute("aria-label", action);
  themeToggle.setAttribute("title", action);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeIcon.textContent = isDark ? "☼" : "☾";
}

themePreference.addEventListener("change", event => {
  if (!hasManualTheme) {
    document.documentElement.classList.toggle("dark", event.matches);
    updateThemeButton();
  }
});

themeToggle.addEventListener("click", () => {
  hasManualTheme = true;
  document.documentElement.classList.toggle("dark");
  updateThemeButton();
});

updateThemeButton();