import { useEffect, useRef, useState } from "react";

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function useCountUp(
  target: number,
  options: {
    duration?: number;     // ms
    startOnView?: boolean; // wait for intersection
    suffix?: string;
    prefix?: string;
  } = {}
) {
  const { duration = 2000, startOnView = true, suffix = "", prefix = "" } = options;
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let raf: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, target, duration]);

  const display = `${prefix}${value.toLocaleString()}${suffix}`;
  return { display, ref };
}
