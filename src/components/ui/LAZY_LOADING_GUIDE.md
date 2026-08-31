# Guide Lazy Loading - À implémenter après extraction des écrans

Une fois les écrans extraits dans src/components/screens/, ajoutez ceci dans App.jsx :

```jsx
// Lazy loading des écrans secondaires
const ProjectScreen = lazy(() => import('./components/screens/ProjectScreen'));
const SkillsScreen = lazy(() => import('./components/screens/SkillsScreen'));
const StatsScreen = lazy(() => import('./components/screens/StatsScreen'));
const TrophiesScreen = lazy(() => import('./components/screens/TrophiesScreen'));
const GoalsScreen = lazy(() => import('./components/screens/GoalsScreen'));
const QuantumScreen = lazy(() => import('./components/screens/QuantumScreen'));
const DebtsScreen = lazy(() => import('./components/screens/DebtsScreen'));
const ProtocolsScreen = lazy(() => import('./components/screens/ProtocolsScreen'));
const CitadelScreen = lazy(() => import('./components/screens/CitadelScreen'));
const AcademyScreen = lazy(() => import('./components/screens/AcademyScreen'));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen'));

// Dans le JSX, envelopper avec Suspense :
<Suspense fallback={<LoadingFallback />}>
  {currentView === 'project' && <ProjectScreen onBack={() => navigate('dashboard')} />}
  {currentView === 'skills' && <SkillsScreen onBack={() => navigate('dashboard')} />}
  {/* ... autres écrans ... */}
</Suspense>
```

Le Dashboard reste synchronisé car c'est l'écran principal utilisé immédiatement.
