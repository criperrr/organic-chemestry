import React, { useEffect, useRef, useState } from 'react';
import { SmilesCanvas } from '@quimicarush/smiles-renderer';

interface FluidMoleculeProps {
  smiles: string;
  /** Widest the depiction may get on a large screen. */
  maxWidth?: number;
  /** height / width. */
  aspect?: number;
  theme?: 'dark' | 'light';
  className?: string;
}

/**
 * A molecule depiction that fits the width it is given.
 *
 * SmilesCanvas needs pixel dimensions, and the call sites passed constants —
 * 420px in the hunt, 380 in training, 360 in the lab. On a 360px phone, once
 * the card and stage padding are taken out, barely 296px are left, so every one
 * of those pushed the page into horizontal scrolling. This measures the space
 * actually available and asks for that.
 */
export const FluidMolecule: React.FC<FluidMoleculeProps> = ({
  smiles,
  maxWidth = 420,
  aspect = 0.58,
  theme = 'dark',
  className,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = (available: number) => {
      if (available <= 0) return;
      // Quantised: SmilesDrawer caches one drawer per exact size, and a
      // continuously changing width during a resize would build one per pixel.
      const quantised = Math.round(Math.min(available, maxWidth) / 20) * 20;
      setWidth(current => (current === quantised ? current : Math.max(quantised, 160)));
    };

    measure(host.clientWidth);

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) measure(entry.contentRect.width);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [maxWidth]);

  return (
    <div ref={hostRef} className="w-full flex items-center justify-center">
      {width !== null && (
        <SmilesCanvas
          smiles={smiles}
          width={width}
          height={Math.round(width * aspect)}
          theme={theme}
          className={className}
        />
      )}
    </div>
  );
};
