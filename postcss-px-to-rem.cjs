// Most sizes in this app are written in px, and Tailwind's own are in rem. Turning the px ones into rem as
// the stylesheets are built leaves the root font size (see globals.css) as the one thing that scales the interface.
const ROOT_FONT_SIZE = 16;

// Quoted strings and url() are matched first, so a "px" inside one of them is left alone.
const PX_LENGTH = /"[^"]*"|'[^']*'|url\([^)]*\)|(?<![\w-])(-?\d*\.?\d+)px\b/g;

function toRem(match, pixels) {
  // Hairlines stay a single pixel at any scale.
  if (pixels === undefined || Math.abs(pixels) <= 1) return match;
  return `${Number((pixels / ROOT_FONT_SIZE).toFixed(5))}rem`;
}

const pxToRem = () => ({
  postcssPlugin: "px-to-rem",
  Declaration(declaration) {
    if (declaration.value.includes("px")) declaration.value = declaration.value.replace(PX_LENGTH, toRem);
  },
});
pxToRem.postcss = true;

module.exports = pxToRem;
