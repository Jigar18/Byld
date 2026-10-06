import type { CSSProperties } from "react";

interface SheetStackProps {
  /** "land" drops the sheets into place once; "loop" lifts them in turn while something loads. */
  motion?: "land" | "loop";
  /** Draws the top sheet as an empty dashed outline, for pages that don't exist. */
  missing?: boolean;
  /** Size it with the --stack-scale custom property, e.g. "[--stack-scale:0.8] lg:[--stack-scale:1.4]". */
  className?: string;
}

const SHEET_COUNT = 4;

// The landing page's stack of portfolio sheets, reduced to a mark.
export default function SheetStack({ motion, missing = false, className = "" }: SheetStackProps) {
  return (
    <div aria-hidden="true" className={`ui-stack ${className}`} data-motion={motion}>
      <div className="ui-stack-rig">
        <div className="ui-stack-shadow" />
        {Array.from({ length: SHEET_COUNT }, (_, index) => (
          <div
            key={index}
            className="ui-stack-sheet"
            data-missing={missing && index === SHEET_COUNT - 1 ? "" : undefined}
            style={{ "--i": index } as CSSProperties}
          >
            <span className="ui-stack-edge" />
            <span className="ui-stack-face" />
          </div>
        ))}
      </div>
    </div>
  );
}
