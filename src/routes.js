const allRoutes = [
    { path: '/', name: 'home' },
    { path: '/quiz', name: 'quiz' },
    { path: '/results', name: 'results' },
    { path: '/sample-results', name: 'sample-results', devOnly: true },
];

export function getRoutes(isDev = import.meta.env?.DEV ?? false) {
    return allRoutes.filter(r => !r.devOnly || isDev);
}
