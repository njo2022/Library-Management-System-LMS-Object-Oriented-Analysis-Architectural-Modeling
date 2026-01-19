// Import des modèles
const { Book, BookStatus } = require('../models/Book');
const { Member, MemberStatus } = require('../models/Member');
const { Transaction, TransactionStatus } = require('../models/Transaction');

/**
 * Classe LibraryService - Service principal de gestion de la bibliothèque
 * Principe: Encapsulation de la logique métier complexe
 * Pattern: Service Layer
 */
class LibraryService {
  constructor() {
    this._books = new Map(); // stockage en mémoire (remplacé par DB en production)
    this._members = new Map();
    this._transactions = new Map();
  }

  // ==================== GESTION DES LIVRES ====================

  /**
   * Ajoute un livre au catalogue
   * @param {Object} bookData - Données du livre {isbn, title, author, category, publicationYear, totalCopies}
   * @returns {Book} Livre créé
   * @throws {Error} Si la validation échoue
   */
  addBook(bookData) {
    // Validation des données
    const validation = Book.validate(bookData);
    if (!validation.valid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
    }

    // Vérifier l'unicité de l'ISBN
    const existingBook = this._findBookByIsbn(bookData.isbn);
    if (existingBook) {
      throw new Error(`Un livre avec l'ISBN ${bookData.isbn} existe déjà`);
    }

    // Créer et enregistrer le livre
    const book = new Book(
      bookData.isbn,
      bookData.title,
      bookData.author,
      bookData.category,
      bookData.publicationYear,
      bookData.totalCopies || 1
    );

    this._books.set(book.getId(), book);
    return book;
  }

  /**
   * Recherche des livres selon des critères
   * @param {Object} criteria - {title?, author?, isbn?, category?, status?}
   * @returns {Book[]} Liste de livres correspondants
   */
  searchBooks(criteria = {}) {
    let results = Array.from(this._books.values());

    if (criteria.title) {
      const searchTerm = criteria.title.toLowerCase();
      results = results.filter(book =>
        book.getTitle().toLowerCase().includes(searchTerm)
      );
    }

    if (criteria.author) {
      const searchTerm = criteria.author.toLowerCase();
      results = results.filter(book =>
        book.getAuthor().toLowerCase().includes(searchTerm)
      );
    }

    if (criteria.isbn) {
      results = results.filter(book =>
        book.getIsbn() === criteria.isbn
      );
    }

    if (criteria.category) {
      const searchTerm = criteria.category.toLowerCase();
      results = results.filter(book =>
        book.getCategory().toLowerCase() === searchTerm
      );
    }

    if (criteria.status) {
      results = results.filter(book =>
        book.getStatus() === criteria.status
      );
    }

    return results;
  }

  /**
   * Obtient un livre par son ID
   * @param {string} bookId
   * @returns {Book}
   * @throws {Error} Si le livre n'existe pas
   */
  getBook(bookId) {
    const book = this._books.get(bookId);
    if (!book) {
      throw new Error(`Livre non trouvé: ${bookId}`);
    }
    return book;
  }

  // ==================== GESTION DES MEMBRES ====================

  /**
   * Enregistre un nouveau membre
   * @param {Object} memberData - {name, email, phone, address}
   * @returns {Member} Membre créé
   * @throws {Error} Si la validation échoue
   */
  registerMember(memberData) {
    // Validation
    const validation = Member.validate(memberData);
    if (!validation.valid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
    }

    // Vérifier l'unicité de l'email
    const existingMember = this._findMemberByEmail(memberData.email);
    if (existingMember) {
      throw new Error(`Un membre avec l'email ${memberData.email} existe déjà`);
    }

    // Créer et enregistrer le membre
    const member = new Member(
      memberData.name,
      memberData.email,
      memberData.phone,
      memberData.address
    );

    this._members.set(member.getId(), member);
    return member;
  }

  /**
   * Obtient un membre par son ID
   * @param {string} memberId
   * @returns {Member}
   * @throws {Error} Si le membre n'existe pas
   */
  getMember(memberId) {
    const member = this._members.get(memberId);
    if (!member) {
      throw new Error(`Membre non trouvé: ${memberId}`);
    }
    return member;
  }

  // ==================== LOGIQUE D'EMPRUNT ====================

  /**
   * Emprunte un livre
   * @param {string} memberId - ID du membre
   * @param {string} bookId - ID du livre
   * @returns {Transaction} Transaction créée
   * @throws {Error} Si l'emprunt n'est pas autorisé
   */
  borrowBook(memberId, bookId) {
    // Récupérer le membre et le livre
    const member = this.getMember(memberId);
    const book = this.getBook(bookId);

    // Valider les règles d'emprunt
    const validation = this._validateBorrowing(member, book);
    if (!validation.canBorrow) {
      throw new Error(validation.reason);
    }

    // Créer la transaction
    const transaction = new Transaction(bookId, memberId);

    // Mettre à jour le livre
    book.borrowCopy();

    // Mettre à jour le membre
    member.addBorrowing(transaction.getId());

    // Enregistrer la transaction
    this._transactions.set(transaction.getId(), transaction);

    return transaction;
  }

  /**
   * Retourne un livre
   * @param {string} transactionId - ID de la transaction
   * @returns {Object} Résultat du retour {success: boolean, fine: number, transaction: Transaction}
   * @throws {Error} Si la transaction n'existe pas
   */
  returnBook(transactionId) {
    // Récupérer la transaction
    const transaction = this._transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction non trouvée: ${transactionId}`);
    }

    // Récupérer le livre et le membre
    const book = this.getBook(transaction.getBookId());
    const member = this.getMember(transaction.getMemberId());

    // Compléter la transaction
    const result = transaction.complete();

    // Mettre à jour le livre
    book.returnCopy();

    // Mettre à jour le membre
    member.removeBorrowing(transactionId);

    // Ajouter l'amende si nécessaire
    if (result.fine > 0) {
      member.addFine(result.fine);
    }

    return {
      success: true,
      fine: result.fine,
      daysOverdue: result.daysOverdue,
      transaction: transaction
    };
  }

  /**
   * Renouvelle un emprunt
   * @param {string} transactionId
   * @returns {Transaction} Transaction renouvelée
   * @throws {Error} Si le renouvellement échoue
   */
  renewBook(transactionId) {
    const transaction = this._transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction non trouvée: ${transactionId}`);
    }

    // Vérifier qu'aucun autre membre n'a réservé ce livre
    // (fonctionnalité réservation à implémenter)

    transaction.renew();
    return transaction;
  }

  // ==================== MÉTHODES PRIVÉES ====================

  /**
   * Valide si un membre peut emprunter un livre
   * @private
   * @param {Member} member
   * @param {Book} book
   * @returns {Object} {canBorrow: boolean, reason: string}
   */
  _validateBorrowing(member, book) {
    // Vérifier que le membre peut emprunter
    const memberCheck = member.canBorrow();
    if (!memberCheck.canBorrow) {
      return memberCheck;
    }

    // Vérifier que le livre est disponible
    if (!book.isAvailable()) {
      return {
        canBorrow: false,
        reason: `Le livre "${book.getTitle()}" n'est pas disponible (Statut: ${book.getStatus()})`
      };
    }

    return {
      canBorrow: true,
      reason: 'Emprunt autorisé'
    };
  }

  /**
   * Trouve un livre par ISBN
   * @private
   */
  _findBookByIsbn(isbn) {
    return Array.from(this._books.values()).find(
      book => book.getIsbn() === isbn
    );
  }

  /**
   * Trouve un membre par email
   * @private
   */
  _findMemberByEmail(email) {
    return Array.from(this._members.values()).find(
      member => member.getEmail() === email
    );
  }

  /**
   * Obtient toutes les transactions actives d'un membre
   * @param {string} memberId
   * @returns {Transaction[]}
   */
  getMemberActiveTransactions(memberId) {
    return Array.from(this._transactions.values()).filter(
      transaction =>
        transaction.getMemberId() === memberId &&
        transaction.getStatus() !== TransactionStatus.RETURNED
    );
  }

  /**
   * Obtient l'historique complet des transactions d'un membre
   * @param {string} memberId
   * @returns {Transaction[]}
   */
  getMemberTransactionHistory(memberId) {
    return Array.from(this._transactions.values()).filter(
      transaction => transaction.getMemberId() === memberId
    );
  }

  /**
   * Vérifie et met à jour les transactions en retard
   * Cette méthode devrait être appelée quotidiennement par un système automatique
   * @returns {number} Nombre de transactions mises à jour
   */
  checkOverdueTransactions() {
    let count = 0;
    this._transactions.forEach(transaction => {
      if (transaction.checkAndUpdateOverdue()) {
        count++;
      }
    });
    return count;
  }

  /**
   * Génère un rapport d'activité
   * @returns {Object} Statistiques de la bibliothèque
   */
  generateReport() {
    return {
      totalBooks: this._books.size,
      availableBooks: Array.from(this._books.values()).filter(b => b.isAvailable()).length,
      borrowedBooks: Array.from(this._books.values()).filter(b => b.getStatus() === BookStatus.BORROWED).length,
      totalMembers: this._members.size,
      activeMembers: Array.from(this._members.values()).filter(m => m.getStatus() === MemberStatus.ACTIVE).length,
      totalTransactions: this._transactions.size,
      activeTransactions: Array.from(this._transactions.values()).filter(t => t.getStatus() === TransactionStatus.ACTIVE).length,
      overdueTransactions: Array.from(this._transactions.values()).filter(t => t.isOverdue()).length,
      totalFines: Array.from(this._members.values()).reduce((sum, m) => sum + m.getFineBalance(), 0)
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LibraryService };
}
