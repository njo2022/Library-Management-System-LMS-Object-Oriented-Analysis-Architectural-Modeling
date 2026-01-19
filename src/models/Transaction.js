/**
 * Énumération des statuts de transaction
 */
const TransactionStatus = {
  ACTIVE: 'ACTIVE',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE',
  RENEWED: 'RENEWED',
  LOST: 'LOST'
};

/**
 * Classe Transaction - Représente une transaction d'emprunt/retour
 * Principe de Responsabilité Unique: Gère uniquement une opération d'emprunt
 */
class Transaction {
  // Constantes de classe
  static BORROW_DURATION_DAYS = 14;
  static MAX_RENEWALS = 2;
  static DAILY_FINE_RATE = 0.50; // 0.50€ par jour de retard

  /**
   * Constructeur de la classe Transaction
   * @param {string} bookId - ID du livre emprunté
   * @param {string} memberId - ID du membre empruntant
   */
  constructor(bookId, memberId) {
    this._id = this._generateId();
    this._bookId = bookId;
    this._memberId = memberId;
    this._borrowDate = new Date();
    this._dueDate = this._calculateDueDate(this._borrowDate);
    this._returnDate = null;
    this._status = TransactionStatus.ACTIVE;
    this._fineAmount = 0.00;
    this._renewalCount = 0;
  }

  // Getters
  getId() {
    return this._id;
  }

  getBookId() {
    return this._bookId;
  }

  getMemberId() {
    return this._memberId;
  }

  getBorrowDate() {
    return this._borrowDate;
  }

  getDueDate() {
    return this._dueDate;
  }

  getReturnDate() {
    return this._returnDate;
  }

  getStatus() {
    return this._status;
  }

  getFineAmount() {
    return this._fineAmount;
  }

  getRenewalCount() {
    return this._renewalCount;
  }

  /**
   * Calcule la date de retour attendue
   * @param {Date} fromDate - Date de départ (emprunt ou renouvellement)
   * @returns {Date} Date de retour calculée
   */
  _calculateDueDate(fromDate) {
    const dueDate = new Date(fromDate);
    dueDate.setDate(dueDate.getDate() + Transaction.BORROW_DURATION_DAYS);
    return dueDate;
  }

  /**
   * Vérifie si le livre est en retard
   * @returns {boolean}
   */
  isOverdue() {
    if (this._status === TransactionStatus.RETURNED) {
      return false;
    }
    return new Date() > this._dueDate;
  }

  /**
   * Calcule le nombre de jours de retard
   * @returns {number} Nombre de jours de retard (0 si pas de retard)
   */
  getDaysOverdue() {
    if (!this.isOverdue()) {
      return 0;
    }

    const today = new Date();
    const diffTime = today - this._dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Calcule l'amende pour retard
   * @returns {number} Montant de l'amende en euros
   */
  calculateFine() {
    const daysOverdue = this.getDaysOverdue();
    if (daysOverdue <= 0) {
      return 0.00;
    }

    const fine = daysOverdue * Transaction.DAILY_FINE_RATE;
    this._fineAmount = parseFloat(fine.toFixed(2));
    return this._fineAmount;
  }

  /**
   * Renouvelle l'emprunt
   * @returns {boolean} True si le renouvellement a réussi
   * @throws {Error} Si le renouvellement n'est pas possible
   */
  renew() {
    // Vérifications
    if (this._status === TransactionStatus.RETURNED) {
      throw new Error('Impossible de renouveler un livre déjà retourné');
    }

    if (this._renewalCount >= Transaction.MAX_RENEWALS) {
      throw new Error(`Limite de renouvellement atteinte (${Transaction.MAX_RENEWALS} maximum)`);
    }

    if (this._status === TransactionStatus.LOST) {
      throw new Error('Impossible de renouveler un livre déclaré perdu');
    }

    // Effectuer le renouvellement
    this._renewalCount++;
    this._dueDate = this._calculateDueDate(new Date());
    this._status = TransactionStatus.RENEWED;

    return true;
  }

  /**
   * Complète la transaction (retour du livre)
   * @param {Date} returnDate - Date de retour (par défaut: aujourd'hui)
   * @returns {Object} Résultat du retour {success: boolean, fine: number}
   */
  complete(returnDate = new Date()) {
    if (this._status === TransactionStatus.RETURNED) {
      throw new Error('Cette transaction est déjà terminée');
    }

    this._returnDate = returnDate;
    this._status = TransactionStatus.RETURNED;

    // Calculer l'amende si retard
    const fine = this.calculateFine();

    return {
      success: true,
      fine: fine,
      daysOverdue: this.getDaysOverdue()
    };
  }

  /**
   * Marque le livre comme perdu
   */
  markAsLost() {
    if (this._status === TransactionStatus.RETURNED) {
      throw new Error('Impossible de marquer comme perdu un livre déjà retourné');
    }
    this._status = TransactionStatus.LOST;
  }

  /**
   * Met à jour le statut en "En retard" si nécessaire
   * @returns {boolean} True si le statut a été changé
   */
  checkAndUpdateOverdue() {
    if (this._status === TransactionStatus.RETURNED || this._status === TransactionStatus.LOST) {
      return false;
    }

    if (this.isOverdue() && this._status !== TransactionStatus.OVERDUE) {
      this._status = TransactionStatus.OVERDUE;
      return true;
    }

    return false;
  }

  /**
   * Obtient les jours restants avant la date limite
   * @returns {number} Nombre de jours (négatif si en retard)
   */
  getDaysRemaining() {
    if (this._status === TransactionStatus.RETURNED) {
      return 0;
    }

    const today = new Date();
    const diffTime = this._dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Retourne les détails complets de la transaction
   * @returns {Object}
   */
  getDetails() {
    return {
      id: this._id,
      bookId: this._bookId,
      memberId: this._memberId,
      borrowDate: this._borrowDate,
      dueDate: this._dueDate,
      returnDate: this._returnDate,
      status: this._status,
      fineAmount: this._fineAmount,
      renewalCount: this._renewalCount,
      isOverdue: this.isOverdue(),
      daysOverdue: this.getDaysOverdue(),
      daysRemaining: this.getDaysRemaining()
    };
  }

  /**
   * Représentation textuelle de la transaction
   * @returns {string}
   */
  toString() {
    const statusText = this.isOverdue() ? 'EN RETARD' : this._status;
    return `Transaction ${this._id} - Livre: ${this._bookId} - Statut: ${statusText} - Retour prévu: ${this._dueDate.toLocaleDateString()}`;
  }

  /**
   * Génère un ID unique pour la transaction
   * @private
   * @returns {string}
   */
  _generateId() {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crée une transaction depuis des données sérialisées
   * @static
   * @param {Object} data - Données de transaction
   * @returns {Transaction}
   */
  static fromJSON(data) {
    const transaction = new Transaction(data.bookId, data.memberId);
    transaction._id = data.id;
    transaction._borrowDate = new Date(data.borrowDate);
    transaction._dueDate = new Date(data.dueDate);
    transaction._returnDate = data.returnDate ? new Date(data.returnDate) : null;
    transaction._status = data.status;
    transaction._fineAmount = data.fineAmount;
    transaction._renewalCount = data.renewalCount;
    return transaction;
  }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Transaction, TransactionStatus };
}
