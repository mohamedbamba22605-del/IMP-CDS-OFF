# Guide Virtualisation - À utiliser pour les longues listes

Utilisez le composant VirtualList pour les listes qui peuvent contenir beaucoup d'éléments :

## Exemple d'utilisation pour les transactions

```jsx
import VirtualList from './components/ui/VirtualList';

// Dans le composant qui affiche les transactions
<VirtualList
  items={transactions}
  renderItem={(transaction, index) => (
    <div key={index} style={{ height: 60 }}>
      {/* Votre composant de transaction */}
    </div>
  )}
  itemHeight={60}
  containerHeight={400}
  overscan={3}
/>
```

## Quand utiliser la virtualisation

- **Transactions** : Si l'utilisateur a plus de 50 transactions
- **Projets** : Si plus de 20 projets
- **Objectifs** : Si plus de 15 objectifs
- **Dettes** : Si plus de 10 dettes

## Avantages

- Réduit le nombre de nœuds DOM rendus
- Améliore les performances de scroll
- Réduit la consommation mémoire
