import { useState, useEffect, useRef } from 'react';

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const triangleShapes = [
  'polygon(50% 0%, 98% 16%, 82% 100%, 18% 88%, 0% 24%)',
  'polygon(50% 0%, 98% 16%, 82% 100%, 18% 88%, 0% 24%)',
  'polygon(50% 0%, 98% 16%, 82% 100%, 18% 88%, 0% 24%)',
  'polygon(50% 0%, 98% 16%, 82% 100%, 18% 88%, 0% 24%)',
];

const createTriangles = (count, containerWidth, containerHeight) => {
  const sizeFactors = [0.38, 0.34, 0.42, 0.3];

  return Array.from({ length: count }, (_, index) => {
    const width = Math.round(containerWidth * sizeFactors[index % sizeFactors.length]);
    const height = width;

    return {
      id: index,
      width,
      height,
      x: randomBetween(0, Math.max(1, containerWidth - width)),
      y: randomBetween(0, Math.max(1, containerHeight - height)),
      vx: randomBetween(-18, 18),
      vy: randomBetween(-14, 14),
      rotation: randomBetween(0, 360),
      angularVelocity: randomBetween(-16, 16),
      color: ['rgba(163, 190, 176, 0.96)', 'rgba(80, 122, 103, 0.92)', 'rgba(27, 46, 38, 0.88)', 'rgba(52, 84, 70, 0.74)'][index % 4],
      shape: triangleShapes[index % triangleShapes.length],
    };
  });
};

export function AuthBackground({ active, shakePulse }) {
  const containerRef = useRef(null);
  const triangleRefs = useRef([]);
  const trianglesRef = useRef([]);
  const frameRef = useRef(null);
  const motionSpeedRef = useRef(1);
  const shakeTimeoutRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const previousShakePulse = useRef(0);
  const [triangles, setTriangles] = useState(() => createTriangles(4, 1200, 900));

  useEffect(() => {
    trianglesRef.current = triangles;
  }, [triangles]);

  useEffect(() => {
    if (shakePulse > previousShakePulse.current) {
      previousShakePulse.current = shakePulse;

      trianglesRef.current.forEach((triangle) => {
        triangle.vx = Math.max(-40, Math.min(40, triangle.vx + randomBetween(-12, 12)));
        triangle.vy = Math.max(-40, Math.min(40, triangle.vy + randomBetween(-12, 12)));
        triangle.angularVelocity = Math.max(-36, Math.min(36, triangle.angularVelocity + randomBetween(-12, 12)));
      });

      motionSpeedRef.current = 2.2;
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = setTimeout(() => {
        motionSpeedRef.current = active ? 1.8 : 1;
      }, 1600);
    }
  }, [shakePulse, active]);

  useEffect(() => {
    motionSpeedRef.current = active ? 1.8 : 1;
  }, [active]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };

      if (!trianglesRef.current.length) {
        const initialTriangles = createTriangles(4, rect.width, rect.height);
        trianglesRef.current = initialTriangles;
        setTriangles(initialTriangles);
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

      const speedFactor = motionSpeedRef.current;

      trianglesRef.current.forEach((triangle) => {
        triangle.x += triangle.vx * 0.06 * speedFactor;
        triangle.y += triangle.vy * 0.06 * speedFactor;
        triangle.rotation += triangle.angularVelocity * 0.04 * speedFactor;

        if (triangle.x < -triangle.width * 0.08) {
          triangle.x = -triangle.width * 0.08;
          triangle.vx = Math.abs(triangle.vx) * 0.5;
        } else if (triangle.x + triangle.width > width + triangle.width * 0.08) {
          triangle.x = width - triangle.width + triangle.width * 0.08;
          triangle.vx = -Math.abs(triangle.vx) * 0.5;
        }

        if (triangle.y < -triangle.height * 0.08) {
          triangle.y = -triangle.height * 0.08;
          triangle.vy = Math.abs(triangle.vy) * 0.55;
        } else if (triangle.y + triangle.height > height + triangle.height * 0.08) {
          triangle.y = height - triangle.height + triangle.height * 0.08;
          triangle.vy = -Math.abs(triangle.vy) * 0.55;
        }

        triangle.vx *= active ? 0.992 : 0.988;
        triangle.vy *= active ? 0.992 : 0.988;
        triangle.angularVelocity *= active ? 0.996 : 0.994;

        const triangleEl = triangleRefs.current[triangle.id];
        if (triangleEl) {
          triangleEl.style.transform = `translate(${Math.round(triangle.x)}px, ${Math.round(triangle.y)}px) rotate(${triangle.rotation.toFixed(2)}deg)`;
        }
      });

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  return (
    <div className="auth-background" ref={containerRef}>
      {triangles.map((triangle) => (
        <div
          key={triangle.id}
          ref={(el) => { triangleRefs.current[triangle.id] = el; }}
          className="auth-triangle"
          style={{
            width: `${triangle.width}px`,
            height: `${triangle.height}px`,
            backgroundColor: triangle.color,
            clipPath: triangle.shape,
            transform: `translate(${triangle.x}px, ${triangle.y}px) rotate(${triangle.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
