/** @type {import('tailwindcss').Config} */
module.exports = {
  // Indique à Tailwind où chercher tes classes CSS
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}", // Scanne tout ton dossier src (screens, components, navigation...)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
