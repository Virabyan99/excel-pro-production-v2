/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',        // For app directory
    './components/**/*.{js,ts,jsx,tsx}'  // If you add a components directory later
  ],
  theme: { extend: {} },
  plugins: [],
}