import React, { useState, useEffect } from 'react';

interface PresetHashRouterProps {
  routes: Record<string, React.ReactNode>;
}

export function PresetHashRouter({ routes }: PresetHashRouterProps) {
  const [currentHash, setCurrentHash] = useState(() => {
    return window.location.hash.replace(/^#\/?/, '');
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      setCurrentHash(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const Component = routes[currentHash] ?? routes[''] ?? null;
  return <>{Component}</>;
}
