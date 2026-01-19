/**
 * EXEMPLE D'UTILISATION DU SYSTÈME DE GESTION DE BIBLIOTHÈQUE
 * 
 * Ce fichier démontre l'utilisation concrète des classes et de la logique métier
 * basée sur les modèles UML précédemment définis.
 */

const { LibraryService } = require('./services/LibraryService');
const { BookStatus } = require('./models/Book');
const { MemberStatus } = require('./models/Member');

// ========================================
// INITIALISATION DU SYSTÈME
// ========================================

console.log('='.repeat(60));
console.log('SYSTÈME DE GESTION DE BIBLIOTHÈQUE - DÉMONSTRATION');
console.log('='.repeat(60));
console.log();

const library = new LibraryService();

// ========================================
// 1. AJOUT DE LIVRES AU CATALOGUE
// ========================================

console.log('1. AJOUT DE LIVRES AU CATALOGUE');
console.log('-'.repeat(60));

try {
  const book1 = library.addBook({
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Informatique',
    publicationYear: 2008,
    totalCopies: 3
  });
  console.log(`✓ Livre ajouté: ${book1.toString()}`);

  const book2 = library.addBook({
    isbn: '978-0201633610',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Gang of Four',
    category: 'Informatique',
    publicationYear: 1994,
    totalCopies: 2
  });
  console.log(`✓ Livre ajouté: ${book2.toString()}`);

  const book3 = library.addBook({
    isbn: '978-0596517748',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    category: 'Programmation',
    publicationYear: 2008,
    totalCopies: 2
  });
  console.log(`✓ Livre ajouté: ${book3.toString()}`);

  console.log(`\n✓ Total de livres au catalogue: ${library.generateReport().totalBooks}`);
} catch (error) {
  console.error(`✗ Erreur: ${error.message}`);
}

console.log();

// ========================================
// 2. ENREGISTREMENT DE MEMBRES
// ========================================

console.log('2. ENREGISTREMENT DE MEMBRES');
console.log('-'.repeat(60));

try {
  const member1 = library.registerMember({
    name: 'Alice Dubois',
    email: 'alice.dubois@email.fr',
    phone: '0601020304',
    address: '123 Rue de la République, Paris'
  });
  console.log(`✓ Membre enregistré: ${member1.toString()}`);

  const member2 = library.registerMember({
    name: 'Bob Martin',
    email: 'bob.martin@email.fr',
    phone: '0605060708',
    address: '45 Avenue des Champs, Lyon'
  });
  console.log(`✓ Membre enregistré: ${member2.toString()}`);

  console.log(`\n✓ Total de membres: ${library.generateReport().totalMembers}`);
} catch (error) {
  console.error(`✗ Erreur: ${error.message}`);
}

console.log();

// ========================================
// 3. RECHERCHE DE LIVRES
// ========================================

console.log('3. RECHERCHE DE LIVRES');
console.log('-'.repeat(60));

try {
  // Recherche par auteur
  const booksByAuthor = library.searchBooks({ author: 'Martin' });
  console.log(`Recherche par auteur "Martin": ${booksByAuthor.length} résultat(s)`);
  booksByAuthor.forEach(book => console.log(`  - ${book.toString()}`));

  console.log();

  // Recherche par catégorie
  const booksByCategory = library.searchBooks({ category: 'Informatique' });
  console.log(`Recherche par catégorie "Informatique": ${booksByCategory.length} résultat(s)`);
  booksByCategory.forEach(book => console.log(`  - ${book.toString()}`));

  console.log();

  // Recherche par statut
  const availableBooks = library.searchBooks({ status: BookStatus.AVAILABLE });
  console.log(`Livres disponibles: ${availableBooks.length}`);
} catch (error) {
  console.error(`✗ Erreur: ${error.message}`);
}

console.log();

// ========================================
// 4. EMPRUNT DE LIVRES
// ========================================

console.log('4. EMPRUNT DE LIVRES');
console.log('-'.repeat(60));

// Récupérer les IDs pour les tests
const allBooks = library.searchBooks({});
const allMembers = Array.from(library._members.values());

if (allBooks.length > 0 && allMembers.length > 0) {
  try {
    const book = allBooks[0];
    const member = allMembers[0];

    console.log(`Tentative d'emprunt du livre "${book.getTitle()}" par ${member.getName()}`);

    const transaction = library.borrowBook(member.getId(), book.getId());

    console.log(`✓ Emprunt réussi!`);
    console.log(`  Transaction ID: ${transaction.getId()}`);
    console.log(`  Date d'emprunt: ${transaction.getBorrowDate().toLocaleDateString()}`);
    console.log(`  Date de retour prévue: ${transaction.getDueDate().toLocaleDateString()}`);
    console.log(`  Jours restants: ${transaction.getDaysRemaining()}`);

    console.log();

    // Vérifier l'état du livre
    const updatedBook = library.getBook(book.getId());
    console.log(`État du livre après emprunt: ${updatedBook.getAvailableCopies()}/${updatedBook.getTotalCopies()} disponibles`);

    // Vérifier l'état du membre
    const updatedMember = library.getMember(member.getId());
    console.log(`Emprunts actifs du membre: ${updatedMember.getCurrentBorrowCount()}/${updatedMember.getBorrowLimit()}`);

    // Tester l'emprunt d'un autre livre
    console.log();
    if (allBooks.length > 1) {
      const book2 = allBooks[1];
      const transaction2 = library.borrowBook(member.getId(), book2.getId());
      console.log(`✓ Deuxième emprunt réussi: "${book2.getTitle()}"`);
      console.log(`  Emprunts actifs: ${library.getMember(member.getId()).getCurrentBorrowCount()}/5`);
    }

  } catch (error) {
    console.error(`✗ Erreur d'emprunt: ${error.message}`);
  }
}

console.log();

// ========================================
// 5. RENOUVELLEMENT D'EMPRUNT
// ========================================

console.log('5. RENOUVELLEMENT D\'EMPRUNT');
console.log('-'.repeat(60));

try {
  const activeTransactions = Array.from(library._transactions.values())
    .filter(t => t.getStatus() !== 'RETURNED');

  if (activeTransactions.length > 0) {
    const transaction = activeTransactions[0];
    const oldDueDate = transaction.getDueDate();

    console.log(`Renouvellement de la transaction ${transaction.getId()}`);
    console.log(`  Date de retour actuelle: ${oldDueDate.toLocaleDateString()}`);

    transaction.renew();

    console.log(`✓ Renouvellement réussi!`);
    console.log(`  Nouvelle date de retour: ${transaction.getDueDate().toLocaleDateString()}`);
    console.log(`  Nombre de renouvellements: ${transaction.getRenewalCount()}/2`);
  } else {
    console.log('Aucune transaction active à renouveler');
  }
} catch (error) {
  console.error(`✗ Erreur de renouvellement: ${error.message}`);
}

console.log();

// ========================================
// 6. RETOUR DE LIVRES
// ========================================

console.log('6. RETOUR DE LIVRES');
console.log('-'.repeat(60));

try {
  const activeTransactions = Array.from(library._transactions.values())
    .filter(t => t.getStatus() !== 'RETURNED');

  if (activeTransactions.length > 0) {
    const transaction = activeTransactions[0];
    const book = library.getBook(transaction.getBookId());
    const member = library.getMember(transaction.getMemberId());

    console.log(`Retour du livre "${book.getTitle()}" par ${member.getName()}`);
    console.log(`  Date de retour prévue: ${transaction.getDueDate().toLocaleDateString()}`);
    console.log(`  Jours de retard: ${Math.max(0, transaction.getDaysOverdue())}`);

    const result = library.returnBook(transaction.getId());

    console.log(`✓ Retour enregistré avec succès!`);
    if (result.fine > 0) {
      console.log(`  ⚠ Amende appliquée: ${result.fine.toFixed(2)}€ (${result.daysOverdue} jours de retard)`);
      console.log(`  Solde d'amendes du membre: ${member.getFineBalance().toFixed(2)}€`);
    } else {
      console.log(`  Aucune amende (retour à temps)`);
    }

    // Vérifier l'état du livre
    const updatedBook = library.getBook(book.getId());
    console.log(`  Exemplaires disponibles: ${updatedBook.getAvailableCopies()}/${updatedBook.getTotalCopies()}`);
  } else {
    console.log('Aucune transaction active à retourner');
  }
} catch (error) {
  console.error(`✗ Erreur de retour: ${error.message}`);
}

console.log();

// ========================================
// 7. TEST DES RÈGLES MÉTIER
// ========================================

console.log('7. TEST DES RÈGLES MÉTIER');
console.log('-'.repeat(60));

const testMember = allMembers[1];

// Test 1: Emprunter un livre non disponible
console.log('Test 1: Emprunt d\'un livre non disponible');
try {
  const borrowedBooks = library.searchBooks({ status: BookStatus.BORROWED });
  if (borrowedBooks.length > 0) {
    library.borrowBook(testMember.getId(), borrowedBooks[0].getId());
  } else {
    console.log('  Aucun livre emprunté pour tester');
  }
} catch (error) {
  console.log(`  ✓ Règle respectée: ${error.message}`);
}

console.log();

// Test 2: Membre avec amendes importantes
console.log('Test 2: Emprunt avec amendes impayées > 10€');
testMember.addFine(15.00);
console.log(`  Amendes du membre: ${testMember.getFineBalance().toFixed(2)}€`);
try {
  const availableBooks = library.searchBooks({ status: BookStatus.AVAILABLE });
  if (availableBooks.length > 0) {
    library.borrowBook(testMember.getId(), availableBooks[0].getId());
  }
} catch (error) {
  console.log(`  ✓ Règle respectée: ${error.message}`);
}

// Payer les amendes
testMember.payFine(15.00);
console.log(`  Amendes payées. Nouveau solde: ${testMember.getFineBalance().toFixed(2)}€`);

console.log();

// ========================================
// 8. RAPPORT D'ACTIVITÉ
// ========================================

console.log('8. RAPPORT D\'ACTIVITÉ DE LA BIBLIOTHÈQUE');
console.log('-'.repeat(60));

const report = library.generateReport();
console.log(`Total de livres au catalogue: ${report.totalBooks}`);
console.log(`  - Disponibles: ${report.availableBooks}`);
console.log(`  - Empruntés: ${report.borrowedBooks}`);
console.log();
console.log(`Total de membres: ${report.totalMembers}`);
console.log(`  - Actifs: ${report.activeMembers}`);
console.log();
console.log(`Transactions:`);
console.log(`  - Total: ${report.totalTransactions}`);
console.log(`  - Actives: ${report.activeTransactions}`);
console.log(`  - En retard: ${report.overdueTransactions}`);
console.log();
console.log(`Total des amendes: ${report.totalFines.toFixed(2)}€`);

console.log();
console.log('='.repeat(60));
console.log('FIN DE LA DÉMONSTRATION');
console.log('='.repeat(60));
