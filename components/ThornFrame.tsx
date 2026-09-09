'use client';

export default function ThornFrame({ seed = 9, inset = 14, spike = 26, step = 38 }: { seed?: number; inset?: number; spike?: number; step?: number }) {
  const W = 1000;
  const H = 640;
  const rand = (i: number) => {
    const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  const pts: [number, number][] = [];
  let i = 0;
  const depth = () => (i % 2 === 0 ? 2 : spike * (0.6 + rand(i) * 0.6));

  for (let x = 0; x <= W; x += step) pts.push([x, inset + depth()]); i++;
  for (let y = inset; y <= H - inset; y += step) pts.push([W - inset - depth(), y]); i++;
  for (let x = W; x >= 0; x -= step) pts.push([x, H - inset - depth()]); i++;
  for (let y = H - inset; y >= inset; y -= step) pts.push([inset + depth(), y]); i++;

  const inner = pts.map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
  const outer = `M0 0 L${W} 0 L${W} ${H} L0 ${H} Z`;

  return (
    <svg className="tm-thorn" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <path d={`${outer} ${inner}`} fillRule="evenodd" fill="#4a3416" stroke="#c9a24a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
