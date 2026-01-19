/**
 * Énumération des statuts possibles pour un livre
 */
const BookStatus = {
  AVAILABLE: 'AVAILABLE',
  BORROWED: 'BORROWED',
  MAINTENANCE: 'MAINTENANCE',
  LOST: 'LOST',
  RETIRED: 'RETIRED'
};

/**
 * Classe Book - Représente un livre dans le système de bibliothèque
 * Principe de Responsabilité Unique: Gère uniquement les données et comportements d'un livre
 */
class Book {
  /**
   * Constructeur de la classe Book
   * @param {string} isbn - ISBN unique du livre
   * @param {string} title - Titre du livre
   * @param {string} author - Auteur du livre
   * @param {string} category - Catégorie du livre
   * @param {number} publicationYear - Année de publication
   * @param {number} totalCopies - Nombre total d'exemplaires
   */
  constructor(isbn, title, author, category, publicationYear, totalCopies = 1) {
    this._id = this._generateId();
    this._isbn = isbn;
    this._title = title;
    this._author = author;
    this._category = category;
    this._publicationYear = publicationYear;
    this._status = BookStatus.AVAILABLE;
    this._totalCopies = totalCopies;
    this._availableCopies = totalCopies;
    this._createdAt = new Date();
  }

  // Getters - Encapsulation des données privées
  getId() {
    return this._id;
  }

  getIsbn() {
    return this._isbn;
  }

  getTitle() {
    return this._title;
  }

  getAuthor() {
    return this._author;
  }

  getCategory() {
    return this._category;
  }

  getPublicationYear() {
    return this._publicationYear;
  }

  getStatus() {
    return this._status;
  }

  getTotalCopies() {
    return this._totalCopies;
  }

  getAvailableCopies() {
    return this._availableCopies;
  }

  /**
   * Vérifie si le livre est disponible à l'emprunt
   * @returns {boolean} True si au moins un exemplaire est disponible
   */
  isAvailable() {
    return this._status === BookStatus.AVAILABLE && this._availableCopies > 0;
  }

  /**
   * Emprunte un exemplaire du livre
   * @returns {boolean} True si l'emprunt a réussi
   * @throws {Error} Si le livre n'est pas disponible
   */
  borrowCopy() {
    if (!this.isAvailable()) {
      throw new Error(`Le livre "${this._title}" n'est pas disponible pour l'emprunt`);
    }

    this._availableCopies--;
    
    // Si tous les exemplaires sont empruntés, changer le statut
    if (this._availableCopies === 0) {
      this._status = BookStatus.BORROWED;
    }

    return true;
  }

  /**
   * Retourne un exemplaire du livre
   * @returns {boolean} True si le retour a réussi
   * @throws {Error} Si tous les exemplaires sont déjà disponibles
   */
  returnCopy() {
    if (this._availableCopies >= this._totalCopies) {
      throw new Error(`Impossible de retourner le livre "${this._title}" - tous les exemplaires sont déjà disponibles`);
    }

    this._availableCopies++;
    
    // Si au moins un exemplaire est disponible, changer le statut
    if (this._availableCopies > 0 && this._status === BookStatus.BORROWED) {
      this._status = BookStatus.AVAILABLE;
    }

    return true;
  }

  /**
   * Change le statut du livre
   * @param {string} newStatus - Nouveau statut
   * @throws {Error} Si le statut n'est pas valide
   */
  setStatus(newStatus) {
    if (!Object.values(BookStatus).includes(newStatus)) {
      throw new Error(`Statut invalide: ${newStatus}`);
    }
    this._status = newStatus;
  }

  /**
   * Met le livre en maintenance
   */
  setMaintenance() {
    this._status = BookStatus.MAINTENANCE;
  }

  /**
   * Marque le livre comme perdu
   */
  setLost() {
    this._status = BookStatus.LOST;
  }

  /**
   * Retire le livre de la collection
   */
  retire() {
    this._status = BookStatus.RETIRED;
  }

  /**
   * Retourne les détails complets du livre
   * @returns {Object} Objet contenant toutes les informations du livre
   */
  getDetails() {
    return {
      id: this._id,
      isbn: this._isbn,
      title: this._title,
      author: this._author,
      category: this._category,
      publicationYear: this._publicationYear,
      status: this._status,
      totalCopies: this._totalCopies,
      availableCopies: this._availableCopies,
      createdAt: this._createdAt
    };
  }

  /**
   * Représentation textuelle du livre
   * @returns {string}
   */
  toString() {
    return `${this._title} par ${this._author} (${this._isbn}) - ${this._availableCopies}/${this._totalCopies} disponibles`;
  }

  /**
   * Génère un ID unique pour le livre
   * @private
   * @returns {string} ID unique
   */
  _generateId() {
    return `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valide les données du livre
   * @static
   * @param {Object} bookData - Données à valider
   * @returns {Object} Résultat de validation {valid: boolean, errors: Array}
   */
  static validate(bookData) {
    const errors = [];

    if (!bookData.isbn || bookData.isbn.trim() === '') {
      errors.push('ISBN est requis');
    }

    if (!bookData.title || bookData.title.trim() === '') {
      errors.push('Titre est requis');
    }

    if (!bookData.author || bookData.author.trim() === '') {
      errors.push('Auteur est requis');
    }

    if (!bookData.category || bookData.category.trim() === '') {
      errors.push('Catégorie est requise');
    }

    if (!bookData.publicationYear || bookData.publicationYear < 1000 || bookData.publicationYear > new Date().getFullYear()) {
      errors.push('Année de publication invalide');
    }

    if (bookData.totalCopies && (bookData.totalCopies < 1 || !Number.isInteger(bookData.totalCopies))) {
      errors.push('Nombre d\'exemplaires doit être un entier positif');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Book, BookStatus };
}
