import { useState, useEffect } from 'react';

export function useDraftlyGalleryAutoplay(defaultValue: boolean = false) {
  const [autoplay, setAutoplay] = useState(defaultValue);

  useEffect(() => {
    setAutoplay(true);
  }, []);

  return autoplay;
}
