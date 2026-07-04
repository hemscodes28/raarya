export function ZenithLogo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`text-xl font-black leading-[0.9] tracking-tighter text-[#141414] ${className}`}
      data-editable
      data-preset-text="logo"
    >
      <div>RAARYA</div>
    </div>
  );
}
