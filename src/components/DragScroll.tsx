"use client";

import { useRef, useState, type ReactNode } from "react";

export default function DragScroll({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setDragging(true);
    moved.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const delta = x - startX.current;
    if (Math.abs(delta) > 4) moved.current = true;
    ref.current.scrollLeft = scrollLeft.current - delta;
  };

  const onMouseUp = () => {
    setDragging(false);
    if (ref.current) { ref.current.style.cursor = ""; ref.current.style.userSelect = ""; }
  };

  // Prevent click on child links if we actually dragged
  const onClickCapture = (e: React.MouseEvent) => { if (moved.current) e.preventDefault(); };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClickCapture={onClickCapture}
      style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        paddingBottom: 6,
        scrollbarWidth: "none",
        cursor: "grab",
        WebkitOverflowScrolling: "touch",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
