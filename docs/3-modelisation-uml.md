# 3. Modélisation UML - Analyse Orientée Objet

## 3.1 Diagramme de Classes

Le diagramme de classes représente la structure statique du système, identifiant les classes principales, leurs attributs, méthodes et relations.

```mermaid
classDiagram
    class Book {
        -String id
        -String isbn
        -String title
        -String author
        -String category
        -Integer publicationYear
        -BookStatus status
        -Integer totalCopies
        -Integer availableCopies
        +Book(isbn, title, author, category, year)
        +getId() String
        +getStatus() BookStatus
        +setStatus(status) void
        +isAvailable() Boolean
        +borrowCopy() Boolean
        +returnCopy() Boolean
        +getDetails() Object
    }

    class Member {
        -String id
        -String name
        -String email
        -String phone
        -String address
        -Date registrationDate
        -MemberStatus status
        -Float fineBalance
        -Integer borrowLimit
        +Member(name, email, phone, address)
        +getId() String
        +getStatus() MemberStatus
        +canBorrow() Boolean
        +addFine(amount) void
        +payFine(amount) void
        +getCurrentBorrowCount() Integer
        +getActiveBorrowings() Transaction[]
    }

    class Librarian {
        -String id
        -String name
        -String email
        -String employeeId
        -String department
        +Librarian(name, email, employeeId)
        +addBook(book) void
        +removeBook(bookId) void
        +registerMember(member) void
        +processBorrowing(transaction) void
        +processReturn(transactionId) void
        +generateReport(type, dateRange) Report
    }

    class Transaction {
        -String id
        -String bookId
        -String memberId
        -Date borrowDate
        -Date dueDate
        -Date returnDate
        -TransactionStatus status
        -Float fineAmount
        -Integer renewalCount
        +Transaction(bookId, memberId, dueDate)
        +getId() String
        +getStatus() TransactionStatus
        +calculateDueDate() Date
        +calculateFine() Float
        +isOverdue() Boolean
        +renew() Boolean
        +complete(returnDate) void
    }

    class Fine {
        -String id
        -String transactionId
        -String memberId
        -Float amount
        -Date issueDate
        -Date paidDate
        -FineStatus status
        +Fine(transactionId, memberId, amount)
        +calculate(daysOverdue) Float
        +markAsPaid() void
        +isPaid() Boolean
    }

    class Library {
        -String id
        -String name
        -String address
        -BookRepository bookRepo
        -MemberRepository memberRepo
        -TransactionRepository transactionRepo
        +Library(name, address)
        +searchBooks(criteria) Book[]
        +borrowBook(memberId, bookId) Transaction
        +returnBook(transactionId) void
        +renewBook(transactionId) Boolean
        +registerMember(memberData) Member
        +addBook(bookData) Book
    }

    class BookStatus {
        <<enumeration>>
        AVAILABLE
        BORROWED
        MAINTENANCE
        LOST
    }

    class MemberStatus {
        <<enumeration>>
        ACTIVE
        SUSPENDED
        INACTIVE
    }

    class TransactionStatus {
        <<enumeration>>
        ACTIVE
        RETURNED
        OVERDUE
        RENEWED
    }

    class FineStatus {
        <<enumeration>>
        PENDING
        PAID
        WAIVED
    }

    Library "1" --> "*" Book : manages
    Library "1" --> "*" Member : manages
    Library "1" --> "*" Transaction : tracks
    Member "1" --> "*" Transaction : has
    Book "1" --> "*" Transaction : involved in
    Transaction "1" --> "0..1" Fine : may generate
    Librarian "1" --> "*" Transaction : processes
    Book --> BookStatus : has
    Member --> MemberStatus : has
    Transaction --> TransactionStatus : has
    Fine --> FineStatus : has
```

### Principes Respectés

**1. Responsabilité Unique (SRP)** :
- `Book` : Gère uniquement les informations et états du livre
- `Member` : Gère uniquement les informations du membre
- `Transaction` : Gère uniquement une opération d'emprunt/retour
- `Fine` : Gère uniquement les amendes

**2. Encapsulation** :
- Attributs privés (-)
- Accès via getters/setters publics (+)
- Validation dans les méthodes

**3. Cohésion** :
- Chaque classe regroupe des données et méthodes fortement liées

## 3.2 Diagramme de Séquence : Emprunter un Livre

```mermaid
sequenceDiagram
    actor M as Membre
    participant UI as Interface Utilisateur
    participant LC as LibraryController
    participant BS as BorrowingService
    participant BR as BorrowingRules
    participant MR as MemberRepository
    participant BkR as BookRepository
    participant TR as TransactionRepository
    participant B as Book
    participant T as Transaction

    M->>UI: Sélectionne livre et demande emprunt
    UI->>LC: borrowBook(memberId, bookId)
    
    LC->>BS: borrowBook(memberId, bookId)
    
    Note over BS: Validation des règles métier
    BS->>BR: validateBorrowing(memberId, bookId)
    
    BR->>MR: findById(memberId)
    MR-->>BR: member
    
    BR->>BkR: findById(bookId)
    BkR-->>BR: book
    
    alt Membre peut emprunter
        BR->>BR: checkMemberStatus()
        BR->>BR: checkBorrowLimit()
        BR->>BR: checkFineBalance()
        BR->>BR: checkBookAvailability()
        BR-->>BS: ValidationResult(true)
        
        Note over BS: Création de la transaction
        BS->>T: new Transaction(bookId, memberId, dueDate)
        BS->>TR: save(transaction)
        TR-->>BS: savedTransaction
        
        Note over BS: Mise à jour du livre
        BS->>B: borrowCopy()
        B->>B: availableCopies--
        B->>B: setStatus(BORROWED)
        BS->>BkR: update(book)
        
        BS-->>LC: transaction
        LC-->>UI: SuccessResponse(transaction)
        UI-->>M: Affiche confirmation avec date retour
        
    else Validation échoue
        BR-->>BS: ValidationResult(false, reason)
        BS-->>LC: ErrorResponse(reason)
        LC-->>UI: ErrorResponse(reason)
        UI-->>M: Affiche message d'erreur
    end
```

### Points Clés du Flux
1. **Validation rigoureuse** avant toute modification
2. **Transaction atomique** : Si une étape échoue, rien n'est modifié
3. **Mise à jour cohérente** : Transaction créée + Livre mis à jour
4. **Feedback utilisateur** : Confirmation ou message d'erreur clair

## 3.3 Diagramme de Séquence : Retourner un Livre

```mermaid
sequenceDiagram
    actor M as Membre
    participant UI as Interface Utilisateur
    participant LC as LibraryController
    participant BS as BorrowingService
    participant TR as TransactionRepository
    participant BkR as BookRepository
    participant FC as FineCalculator
    participant T as Transaction
    participant B as Book
    participant F as Fine

    M->>UI: Retourne un livre
    UI->>LC: returnBook(transactionId)
    
    LC->>BS: returnBook(transactionId)
    
    Note over BS: Récupération de la transaction
    BS->>TR: findById(transactionId)
    TR-->>BS: transaction
    
    alt Transaction valide
        Note over BS: Calcul de l'amende si retard
        BS->>T: isOverdue()
        T-->>BS: Boolean
        
        alt Livre en retard
            BS->>FC: calculateFine(transaction)
            FC->>FC: daysOverdue = today - dueDate
            FC->>FC: fineAmount = daysOverdue * DAILY_RATE
            FC->>F: new Fine(transactionId, memberId, amount)
            FC-->>BS: fine
            
            BS->>TR: saveFine(fine)
            BS->>M: updateFineBalance(fineAmount)
        end
        
        Note over BS: Mise à jour de la transaction
        BS->>T: complete(returnDate)
        T->>T: setStatus(RETURNED)
        T->>T: setReturnDate(today)
        BS->>TR: update(transaction)
        
        Note over BS: Mise à jour du livre
        BS->>BkR: findById(bookId)
        BkR-->>BS: book
        BS->>B: returnCopy()
        B->>B: availableCopies++
        B->>B: setStatus(AVAILABLE)
        BS->>BkR: update(book)
        
        BS-->>LC: ReturnResult(success, fine)
        LC-->>UI: SuccessResponse(result)
        
        alt Amende présente
            UI-->>M: Affiche confirmation + amende
        else Pas d'amende
            UI-->>M: Affiche confirmation
        end
        
    else Transaction invalide
        BS-->>LC: ErrorResponse("Transaction not found")
        LC-->>UI: ErrorResponse
        UI-->>M: Affiche erreur
    end
```

### Points Clés du Flux
1. **Vérification de la transaction** existante
2. **Calcul automatique des amendes** si retard
3. **Mise à jour cohérente** : Transaction + Livre + Membre
4. **Notification des amendes** à l'utilisateur

## 3.4 Diagramme d'État : Cycle de Vie d'un Livre

```mermaid
stateDiagram-v2
    [*] --> Disponible: Livre ajouté au catalogue
    
    Disponible --> Emprunté: Emprunt validé
    Disponible --> EnMaintenance: Maintenance requise
    
    Emprunté --> Disponible: Retour à temps
    Emprunté --> EnRetard: Date limite dépassée
    Emprunté --> Perdu: Déclaré perdu
    
    EnRetard --> Disponible: Retour tardif
    EnRetard --> Perdu: Non retourné (>30 jours)
    
    EnMaintenance --> Disponible: Maintenance terminée
    EnMaintenance --> Retiré: Dommage irréparable
    
    Perdu --> Retrouvé: Livre retrouvé
    Retrouvé --> Disponible: Après vérification
    Retrouvé --> EnMaintenance: Si endommagé
    
    Disponible --> Retiré: Fin de vie du livre
    Perdu --> Retiré: Remplacement effectué
    
    Retiré --> [*]
    
    note right of Disponible
        État normal
        Peut être emprunté
    end note
    
    note right of Emprunté
        Prêté à un membre
        Date de retour définie
    end note
    
    note right of EnRetard
        Retour dépassé
        Amende accumulée
    end note
    
    note right of EnMaintenance
        Réparation
        Nettoyage
        Rebinding
    end note
```

### États du Livre

| État | Description | Peut être emprunté ? | Actions possibles |
|------|-------------|---------------------|-------------------|
| **Disponible** | Livre disponible à l'emprunt | ✅ Oui | Emprunter, Mettre en maintenance |
| **Emprunté** | Livre prêté à un membre | ❌ Non | Retourner, Déclarer perdu |
| **En Retard** | Livre non retourné à temps | ❌ Non | Retourner (avec amende) |
| **En Maintenance** | Livre en réparation/entretien | ❌ Non | Remettre en service, Retirer |
| **Perdu** | Livre déclaré perdu | ❌ Non | Retrouver, Retirer |
| **Retrouvé** | Livre perdu qui a été retrouvé | ❌ Non | Vérifier état |
| **Retiré** | Livre retiré de la collection | ❌ Non | Aucune |

### Transitions et Événements

- **Ajout au catalogue** : `[*] → Disponible`
- **Emprunt** : `Disponible → Emprunté`
- **Retour** : `Emprunté → Disponible`
- **Dépassement délai** : `Emprunté → En Retard` (automatique)
- **Maintenance** : `Disponible → En Maintenance`
- **Perte** : `Emprunté/En Retard → Perdu`
- **Découverte** : `Perdu → Retrouvé`
- **Retrait** : `Disponible/Perdu/En Maintenance → Retiré`

## 3.5 Diagramme de Cas d'Utilisation

```mermaid
graph TB
    subgraph "Système de Gestion de Bibliothèque"
        UC1[Rechercher un Livre]
        UC2[Emprunter un Livre]
        UC3[Retourner un Livre]
        UC4[Renouveler un Emprunt]
        UC5[Consulter Compte]
        UC6[Ajouter un Livre]
        UC7[Supprimer un Livre]
        UC8[Enregistrer un Membre]
        UC9[Gérer les Amendes]
        UC10[Générer Rapports]
        UC11[Mettre en Maintenance]
    end
    
    Membre((Membre))
    Bibliothecaire((Bibliothécaire))
    Systeme((Système<br/>Automatique))
    
    Membre --> UC1
    Membre --> UC2
    Membre --> UC3
    Membre --> UC4
    Membre --> UC5
    
    Bibliothecaire --> UC1
    Bibliothecaire --> UC2
    Bibliothecaire --> UC3
    Bibliothecaire --> UC6
    Bibliothecaire --> UC7
    Bibliothecaire --> UC8
    Bibliothecaire --> UC9
    Bibliothecaire --> UC10
    Bibliothecaire --> UC11
    
    Systeme -.-> UC9
    
    UC2 -.->|extends| UC9
    UC3 -.->|extends| UC9
    UC4 -.->|includes| UC2
    
    style UC1 fill:#e3f2fd
    style UC2 fill:#fff3e0
    style UC3 fill:#fff3e0
    style UC4 fill:#e8f5e9
    style UC5 fill:#e8f5e9
    style UC6 fill:#fce4ec
    style UC7 fill:#fce4ec
    style UC8 fill:#fce4ec
    style UC9 fill:#f3e5f5
    style UC10 fill:#f3e5f5
    style UC11 fill:#fce4ec
```

## 3.6 Relations et Cardinalités

### Relations Principales

1. **Library - Book** : `1..* (un à plusieurs)`
   - Une bibliothèque gère plusieurs livres
   - Un livre appartient à une bibliothèque

2. **Library - Member** : `1..* (un à plusieurs)`
   - Une bibliothèque a plusieurs membres
   - Un membre est inscrit dans une bibliothèque

3. **Member - Transaction** : `1..* (un à plusieurs)`
   - Un membre peut avoir plusieurs emprunts
   - Une transaction appartient à un membre

4. **Book - Transaction** : `1..* (un à plusieurs)`
   - Un livre peut avoir plusieurs transactions (historique)
   - Une transaction concerne un livre

5. **Transaction - Fine** : `1..0..1 (un à zéro ou un)`
   - Une transaction peut générer une amende
   - Une amende est liée à une transaction

### Contraintes d'Intégrité

- Un membre ne peut pas emprunter plus de 5 livres simultanément
- Un livre ne peut pas être emprunté s'il n'est pas disponible
- Une transaction ne peut pas être créée si le membre a des amendes > 10€
- La date de retour doit être postérieure à la date d'emprunt
