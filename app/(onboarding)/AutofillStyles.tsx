"use client";

// Keeps browser autofill from painting the dark onboarding inputs white.
// Scoped to the onboarding layout, so it is removed once the user leaves these pages.
export default function AutofillStyles() {
  return (
    <style jsx global>{`
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #27272a inset !important;
        -webkit-text-fill-color: #e4e4e7 !important;
        transition: background-color 5000s ease-in-out 0s;
        caret-color: #e4e4e7;
      }
    `}</style>
  );
}
