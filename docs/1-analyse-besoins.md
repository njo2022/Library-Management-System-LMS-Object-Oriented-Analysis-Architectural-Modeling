# 1. Analyse des Besoins

## 1.1 Acteurs Principaux

### Acteur 1 : Bibliothécaire (Librarian)
**Rôle** : Gestionnaire principal du système
**Responsabilités** :
- Gérer le catalogue de livres (ajouter, modifier, supprimer)
- Enregistrer de nouveaux membres
- Gérer les emprunts et retours
- Gérer les pénalités et amendes
- Générer des rapports d'activité
- Marquer les livres comme "en maintenance"

### Acteur 2 : Membre (Member)
**Rôle** : Utilisateur du service de bibliothèque
**Responsabilités** :
- Rechercher des livres dans le catalogue
- Emprunter des livres disponibles
- Retourner des livres empruntés
- Consulter son historique d'emprunts
- Renouveler un emprunt
- Consulter son compte (livres empruntés, amendes)

### Acteur 3 : Administrateur Système (System Admin) - Optionnel
**Rôle** : Gestion technique du système
**Responsabilités** :
- Configurer les paramètres système (durée d'emprunt, limites)
- Gérer les droits d'accès
- Sauvegarder et restaurer les données

## 1.2 Cas d'Utilisation Clés

### UC1 : Rechercher un Livre
**Acteur** : Membre, Bibliothécaire
**Description** : Rechercher un livre par titre, auteur, ISBN ou catégorie
**Préconditions** : Accès au catalogue
**Postconditions** : Liste des livres correspondants affichée avec leur statut

### UC2 : Emprunter un Livre
**Acteur** : Membre (initie), Bibliothécaire (valide)
**Description** : Un membre emprunte un livre disponible
**Préconditions** :
- Le membre est enregistré et actif
- Le livre est disponible
- Le membre n'a pas atteint sa limite d'emprunts
- Le membre n'a pas d'amendes impayées
**Postconditions** :
- Le livre passe à l'état "Emprunté"
- Une transaction est enregistrée
- La date de retour est calculée

### UC3 : Retourner un Livre
**Acteur** : Membre, Bibliothécaire
**Description** : Retour d'un livre emprunté
**Préconditions** : Le livre est emprunté par le membre
**Postconditions** :
- Le livre passe à l'état "Disponible"
- La transaction est clôturée
- Une amende est calculée si retour en retard

### UC4 : Enregistrer un Nouveau Membre
**Acteur** : Bibliothécaire
**Description** : Créer un compte pour un nouveau membre
**Préconditions** : Informations du membre complètes
**Postconditions** : Membre créé avec un identifiant unique

### UC5 : Ajouter un Livre au Catalogue
**Acteur** : Bibliothécaire
**Description** : Ajouter un nouveau livre dans la collection
**Préconditions** : Informations du livre complètes
**Postconditions** : Livre ajouté au catalogue avec statut "Disponible"

### UC6 : Renouveler un Emprunt
**Acteur** : Membre
**Description** : Prolonger la période d'emprunt
**Préconditions** :
- Le livre est emprunté par le membre
- Aucun autre membre n'a réservé ce livre
- Limite de renouvellement non atteinte
**Postconditions** : Date de retour mise à jour

### UC7 : Gérer les Pénalités
**Acteur** : Bibliothécaire
**Description** : Calculer et appliquer les amendes pour retards
**Préconditions** : Retour tardif détecté
**Postconditions** : Amende ajoutée au compte du membre

## 1.3 Exigences Fonctionnelles

### RF1 : Gestion du Catalogue
- Le système doit permettre d'ajouter, modifier et supprimer des livres
- Chaque livre doit avoir : titre, auteur(s), ISBN, catégorie, année, nombre d'exemplaires

### RF2 : Gestion des Membres
- Le système doit permettre d'enregistrer des membres avec nom, email, téléphone, adresse
- Chaque membre a un identifiant unique et une date d'inscription

### RF3 : Gestion des Emprunts
- Maximum 5 livres empruntés simultanément par membre
- Durée d'emprunt : 14 jours
- Maximum 2 renouvellements possibles

### RF4 : Recherche et Filtrage
- Recherche par titre, auteur, ISBN, catégorie
- Filtrage par disponibilité

### RF5 : Calcul des Amendes
- 0.50€ par jour de retard
- Blocage des emprunts si amendes > 10€

## 1.4 Exigences Non-Fonctionnelles

### RNF1 : Performance
- Temps de recherche < 2 secondes pour 10,000 livres

### RNF2 : Sécurité
- Authentification requise pour toutes les opérations
- Chiffrement des données sensibles

### RNF3 : Maintenabilité
- Code modulaire suivant les principes SOLID
- Documentation complète du code

### RNF4 : Évolutivité
- Architecture permettant l'ajout de nouveaux types de médias (DVD, magazines)
- Possibilité d'intégrer un système de réservation

## 1.5 Règles Métier

1. Un livre ne peut être emprunté que s'il est disponible
2. Un membre ne peut emprunter plus de 5 livres simultanément
3. Un membre avec des amendes impayées (> 10€) ne peut pas emprunter
4. La durée d'emprunt standard est de 14 jours
5. Un livre peut être renouvelé 2 fois maximum
6. L'amende pour retard est de 0.50€ par jour
7. Un livre en maintenance ne peut pas être emprunté
