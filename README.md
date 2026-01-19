# Système de Gestion de Bibliothèque (SGB) - Library Management System (LMS)

## Conception et Modélisation Orientée Objet

Ce projet présente une analyse complète et une modélisation UML d'un système de gestion de bibliothèque, suivant les principes de l'analyse orientée objet (OOA) et de l'architecture logicielle.

## Structure du Projet

```
/docs
  ├── 1-analyse-besoins.md          # Analyse des besoins et cas d'utilisation
  ├── 2-architecture-systeme.md     # Architecture du système en couches
  ├── 3-modelisation-uml.md         # Diagrammes UML (Classes, Séquence, État)
  └── 4-modelisation-donnees.md     # Modèles fonctionnels et comportementaux

/src
  ├── models/                        # Classes métier
  │   ├── Book.js
  │   ├── Member.js
  │   ├── Librarian.js
  │   └── Transaction.js
  ├── services/                      # Logique métier
  │   └── LibraryService.js
  └── repositories/                  # Accès aux données
      └── LibraryRepository.js
```

## Documentation

Consultez les fichiers dans le dossier `/docs` pour une analyse détaillée :

1. **Analyse des Besoins** : Acteurs, cas d'utilisation et exigences fonctionnelles
2. **Architecture Système** : Composants majeurs et interactions entre couches
3. **Modélisation UML** : Diagrammes de classes, séquence et état
4. **Modélisation Données** : Modèles fonctionnels et comportementaux

## Principes de Conception

- **Modularité** : Séparation claire des responsabilités
- **Encapsulation** : Protection des données et contrôle d'accès
- **Maintenabilité** : Code lisible et structure évolutive
- **Standards OOA** : Respect des principes SOLID

## Utilisation

Voir les exemples d'implémentation dans le dossier `/src` pour comprendre comment les modèles UML se traduisent en code JavaScript.
