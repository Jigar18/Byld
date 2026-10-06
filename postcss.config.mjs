/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    "./postcss-px-to-rem.cjs": {},
  },
};

export default config;
