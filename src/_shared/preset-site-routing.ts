export function routeHref(route: string): string {
  if (route.startsWith('#')) return route;
  return route ? `#/${route}` : '#/';
}

export function navigateToRoute(route: string) {
  if (route.startsWith('#')) {
    window.location.hash = route;
  } else {
    window.location.hash = routeHref(route);
  }
}

export function applyPresetHashOnLoad() {
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
