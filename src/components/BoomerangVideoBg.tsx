import { useRef, useEffect } from 'react';

type Props = {
  src: string;
  className?: string;
};

export default function BoomerangVideoBg({ src, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, [src]);

  return (
    <div className={className ?? 'absolute inset-0 w-full h-full overflow-hidden'}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover pointer-events-none transform-gpu"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    </div>
  );
}
