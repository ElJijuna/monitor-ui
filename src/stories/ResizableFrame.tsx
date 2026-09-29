/*
  Storybook-only helper: a horizontally resizable slot that reports its width, used to
  demonstrate components laid out with container queries.
*/
import { Text } from '@gnome-ui/react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface ResizableFrameProps {
  title: string;
  /** Maps the current slot width to the layout name the component should be showing. */
  describe: (width: number) => string;
  initialWidth: number;
  minWidth?: number;
  children: ReactNode;
}

export const ResizableFrame = ({
  title,
  describe,
  initialWidth,
  minWidth = 160,
  children,
}: ResizableFrameProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initialWidth);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(Math.round(entry.contentRect.width));
      }
    });

    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ alignItems: 'baseline', display: 'flex', gap: 10 }}>
        <Text variant="heading">{title}</Text>
        <Text color="dim" variant="caption">
          {width}px → {describe(width)} · drag the bottom-right corner
        </Text>
      </div>
      <div
        ref={frameRef}
        style={{
          border: '1px dashed var(--gnome-border-subtle, rgba(127, 127, 127, 0.4))',
          borderRadius: 16,
          boxSizing: 'content-box',
          maxWidth: 'calc(100% - 18px)',
          minWidth,
          overflow: 'hidden',
          padding: 8,
          resize: 'horizontal',
          width: initialWidth,
        }}
      >
        {children}
      </div>
    </section>
  );
};
