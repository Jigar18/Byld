import SheetStack from "./SheetStack";

interface PortfolioLoaderProps {
  username: string;
}

export default function PortfolioLoader({ username }: PortfolioLoaderProps) {
  return (
    <main
      className="grid min-h-dvh place-items-center overflow-hidden"
      role="status"
      aria-label={`Loading ${username || "user"} portfolio`}
    >
      <div className="flex flex-col items-center">
        <SheetStack motion="loop" className="[--stack-scale:0.62]" />
        {username && (
          <p aria-hidden="true" className="mt-2 font-mono text-sm text-ink-faint">
            /{username}
          </p>
        )}
      </div>
      <span className="sr-only">Loading portfolio</span>
    </main>
  );
}
