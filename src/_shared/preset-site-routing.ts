export function routeHref(route: string): string {
  if (route.startsWith('#')) return route;
  return route ? `#/${route}` : '#/';
}

export function navigateToRoute(route: string) {
  if (route.startsWith('#')) {
    const id = route.substring(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', route);
    }
  } else {
    window.location.hash = routeHref(route);
  }
}

export function applyPresetHashOnLoad() {
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    const id = hash.replace(/^#\/?/, '');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}
