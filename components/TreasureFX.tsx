'use client';
export default function TreasureFX() {
  const dust = Array.from({ length: 26 });
  return (
    <>
      <div className="tm-grain" aria-hidden />
      <div className="tm-vignette" aria-hidden />
      <div className="tm-dust" aria-hidden>
        {dust.map((_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 13) * 0.6}s`,
              animationDuration: `${9 + (i % 6) * 2}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
