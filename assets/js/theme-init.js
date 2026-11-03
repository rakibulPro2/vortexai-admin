/*! VortexAI - theme bootstrap. Loaded in <head> so the saved theme is applied before the page paints (no flash). Default = light. */
(function () {
  try { document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark'); } catch (e) {}
})();
