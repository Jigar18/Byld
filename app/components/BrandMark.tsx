import Image from "next/image";
import Link from "next/link";

const nameClassByVisibility = {
  always: "",
  "from-sm": "hidden sm:inline",
  never: "hidden",
};

export default function BrandMark({ name = "always" }: { name?: keyof typeof nameClassByVisibility }) {
  return (
    <Link
      href="/"
      aria-label="Byldit home"
      className="flex shrink-0 items-center gap-2.5 rounded-[10px] font-display text-xl font-semibold tracking-[-0.02em]"
    >
      {/* The mark is a near-black tile, so it carries a hairline edge for dark surfaces. */}
      <Image
        src="/landing/byldit-mark-mono.webp"
        alt=""
        width={34}
        height={34}
        className="size-[34px] rounded-[10px] shadow-[0_0_0_1px_rgb(var(--c-line))]"
      />
      <span className={nameClassByVisibility[name]}>Byldit</span>
    </Link>
  );
}
