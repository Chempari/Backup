import { useEffect, useRef, useState } from 'react';

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const shapePath = 'polygon(50% 0%, 98% 16%, 82% 100%, 18% 88%, 0% 24%)';

const createShapes = (count, containerWidth, containerHeight) => {
  const sizeFactors = [0.38, 0.3, 0.28, 0.22, 0.34, 0.18, 0.25, 0.2];
  const colors = [
    'var(--verde-intermedio-luz)',
    'var(--verde-apagado-suave)',
    'var(--verde-apagado-oscuro)',
    'var(--verde-apagado-medio)',
  ];

  return Array.from({ length: count }, (_, index) => {
    const width = Math.round(containerWidth * sizeFactors[index % sizeFactors.length]);
    const height = width;
    const color = colors[index % colors.length];

    return {
      id: index,
      width,
      height,
      x: randomBetween(-width * 0.25, Math.max(0, containerWidth - width + width * 0.25)),
      y: randomBetween(-height * 0.22, Math.max(0, containerHeight - height + height * 0.22)),
      vx: randomBetween(-18, 18),
      vy: randomBetween(-14, 14),
      rotation: randomBetween(0, 360),
      angularVelocity: randomBetween(-6, 6),
      color,
      shape: shapePath,
      opacity: index % 3 === 0 ? 0.78 : index % 2 === 0 ? 0.82 : 0.7,
    };
  });
};

export function LayoutBackground() {
  const containerRef = useRef(null);
  const shapeRefs = useRef([]);
  const shapesRef = useRef([]);
  const frameRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [shapes, setShapes] = useState(() => createShapes(8, 1200, 900));

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };

      if (!shapesRef.current.length) {
        const initialShapes = createShapes(8, rect.width, rect.height);
        shapesRef.current = initialShapes;
        setShapes(initialShapes);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const step = () => {
      const { width, height } = sizeRef.current;
      if (!width || !height) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      shapesRef.current.forEach((shape) => {
        shape.x += shape.vx * 0.03;
        shape.y += shape.vy * 0.03;
        shape.rotation += shape.angularVelocity * 0.03;

        const horizontalLimit = shape.width * 0.08;
        const verticalLimit = shape.height * 0.08;

        if (shape.x < -horizontalLimit) {
          shape.x = -horizontalLimit;
          shape.vx = Math.abs(shape.vx) * randomBetween(0.76, 0.96);
        } else if (shape.x + shape.width > width + horizontalLimit) {
          shape.x = width - shape.width + horizontalLimit;
          shape.vx = -Math.abs(shape.vx) * randomBetween(0.76, 0.96);
        }

        if (shape.y < -verticalLimit) {
          shape.y = -verticalLimit;
          shape.vy = Math.abs(shape.vy) * randomBetween(0.78, 0.94);
        } else if (shape.y + shape.height > height + verticalLimit) {
          shape.y = height - shape.height + verticalLimit;
          shape.vy = -Math.abs(shape.vy) * randomBetween(0.78, 0.94);
        }

        if (Math.abs(shape.vx) < 1.6) {
          shape.vx = shape.vx < 0 ? -1.8 : 1.8;
        }
        if (Math.abs(shape.vy) < 1.6) {
          shape.vy = shape.vy < 0 ? -1.8 : 1.8;
        }

        shape.vx = clamp(shape.vx, -24, 24);
        shape.vy = clamp(shape.vy, -20, 20);
        shape.angularVelocity = clamp(shape.angularVelocity, -6, 6);

        const shapeEl = shapeRefs.current[shape.id];
        if (shapeEl) {
          shapeEl.style.transform = `translate(${Math.round(shape.x)}px, ${Math.round(shape.y)}px) rotate(${shape.rotation.toFixed(2)}deg)`;
        }
      });

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="layout-background" ref={containerRef}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          ref={(el) => { shapeRefs.current[shape.id] = el; }}
          className="layout-shape"
          style={{
            width: `${shape.width}px`,
            height: `${shape.height}px`,
            backgroundColor: shape.color,
            clipPath: shape.shape,
            transform: `translate(${shape.x}px, ${shape.y}px) rotate(${shape.rotation}deg)`,
            opacity: shape.opacity,
          }}
        />
      ))}
    </div>
  );
}
