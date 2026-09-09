'use client';

export default function ThornFrame({ seed = 11, inset = 16, step = 22 }: { seed?: number; inset?: number; step?: number }) {
  const W = 1000, H = 640;
  const rand = (i: number) => { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };

  const pts: [number, number][] = [];
  let i = 0;
  const depth = () => {
    const fine = (rand(i) * 2 - 1) * 3;              // torn-paper jitter
    const spike = i % 6 === 0 ? 12 + rand(i + 99) * 16 : 0; // thorn cuts
    i++;
    return inset + spike + fine;
  };

  for (let x = 0; x <= W; x += step) pts.push([x, depth()]);
  for (let y = inset; y <= H - inset; y += step) pts.push([W - depth(), y]);
  for (let x = W; x >= 0; x -= step) pts.push([x, H - depth()]);
  for (let y = H - inset; y >= inset; y -= step) pts.push([depth(), y]);

  const inner = pts.map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
  const outer = `M-4 -4 L${W + 4} -4 L${W + 4} ${H + 4} L-4 ${H + 4} Z`;

  return (
    <div className="tm-scroll" aria-hidden>
      <div className="tm-rod tm-rod-top" />
      <div className="tm-rod tm-rod-bottom" />
      <svg className="tm-thorn" viewBox={`-4 -4 ${W + 8} ${H + 8}`} preserveAspectRatio="none">
        <path d={`${outer} ${inner}`} fillRule="evenodd" fill="#4a3416" stroke="#2e1e0a" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={inner} fill="none" stroke="rgba(201,162,74,.55)" strokeWidth="1" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
