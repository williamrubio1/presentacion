// Punto de entrada para el deploy de Hostinger (preset Express).
// El frontend se compila en el hook postinstall (vite build -> dist/);
// este archivo solo arranca el servidor, que sirve dist/ + /api.
import './server/src/index.js'
