/**
 * Énumération des statuts possibles pour un membre
 */
const MemberStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE'
};

/**
 * Classe Member - Représente un membre de la bibliothèque
 * Principe de Responsabilité Unique: Gère uniquement les données et comportements d'un membre
 */
class Member {
  // Constantes de classe
  static MAX_BORROW_LIMIT = 5;
  static MAX_FINE_THRESHOLD = 10.00;

  /**
   * Constructeur de la classe Member
   * @param {string} name - Nom complet du membre
   * @param {string} email - Adresse email
   * @param {string} phone - Numéro de téléphone
   * @param {string} address - Adresse postale
   */
  constructor(name, email, phone, address) {
    this._id = this._generateId();
    this._name = name;
    this._email = email;
    this._phone = phone;
    this._address = address;
    this._registrationDate = new Date();
    this._status = MemberStatus.ACTIVE;
    this._fineBalance = 0.00;
    this._borrowLimit = Member.MAX_BORROW_LIMIT;
    this._currentBorrowings = [];
  }

  // Getters
  getId() {
    return this._id;
  }

  getName() {
    return this._name;
  }

  getEmail() {
    return this._email;
  }

  getPhone() {
    return this._phone;
  }

  getAddress() {
    return this._address;
  }

  getRegistrationDate() {
    return this._registrationDate;
  }

  getStatus() {
    return this._status;
  }

  getFineBalance() {
    return this._fineBalance;
  }

  getBorrowLimit() {
    return this._borrowLimit;
  }

  getCurrentBorrowings() {
    return [...this._currentBorrowings]; // Retourne une copie pour éviter les modifications externes
  }

  /**
   * Vérifie si le membre peut emprunter un livre
   * @returns {Object} {canBorrow: boolean, reason: string}
   */
  canBorrow() {
    // Vérifier le statut
    if (this._status !== MemberStatus.ACTIVE) {
      return {
        canBorrow: false,
        reason: `Membre ${this._status.toLowerCase()} - impossible d'emprunter`
      };
    }

    // Vérifier les amendes
    if (this._fineBalance >= Member.MAX_FINE_THRESHOLD) {
      return {
        canBorrow: false,
        reason: `Amendes impayées (${this._fineBalance.toFixed(2)}€) - veuillez régler votre compte`
      };
    }

    // Vérifier la limite d'emprunts
    if (this._currentBorrowings.length >= this._borrowLimit) {
      return {
        canBorrow: false,
        reason: `Limite d'emprunts atteinte (${this._borrowLimit} livres)`
      };
    }

    return {
      canBorrow: true,
      reason: 'Emprunt autorisé'
    };
  }

  /**
   * Obtient le nombre actuel d'emprunts
   * @returns {number}
   */
  getCurrentBorrowCount() {
    return this._currentBorrowings.length;
  }

  /**
   * Ajoute un emprunt à la liste des emprunts actifs
   * @param {string} transactionId - ID de la transaction d'emprunt
   */
  addBorrowing(transactionId) {
    if (!this._currentBorrowings.includes(transactionId)) {
      this._currentBorrowings.push(transactionId);
    }
  }

  /**
   * Retire un emprunt de la liste des emprunts actifs
   * @param {string} transactionId - ID de la transaction d'emprunt
   */
  removeBorrowing(transactionId) {
    const index = this._currentBorrowings.indexOf(transactionId);
    if (index > -1) {
      this._currentBorrowings.splice(index, 1);
    }
  }

  /**
   * Ajoute une amende au solde du membre
   * @param {number} amount - Montant de l'amende
   * @throws {Error} Si le montant est négatif
   */
  addFine(amount) {
    if (amount < 0) {
      throw new Error('Le montant de l\'amende ne peut pas être négatif');
    }

    this._fineBalance += amount;

    // Suspendre le membre si les amendes dépassent le seuil
    if (this._fineBalance >= Member.MAX_FINE_THRESHOLD && this._status === MemberStatus.ACTIVE) {
      this._status = MemberStatus.SUSPENDED;
    }
  }

  /**
   * Paye une amende
   * @param {number} amount - Montant payé
   * @throws {Error} Si le montant est négatif ou supérieur au solde
   */
  payFine(amount) {
    if (amount < 0) {
      throw new Error('Le montant du paiement ne peut pas être négatif');
    }

    if (amount > this._fineBalance) {
      throw new Error(`Montant payé (${amount}€) supérieur au solde d'amendes (${this._fineBalance}€)`);
    }

    this._fineBalance -= amount;

    // Réactiver le membre si les amendes sont réglées
    if (this._fineBalance < Member.MAX_FINE_THRESHOLD && this._status === MemberStatus.SUSPENDED) {
      this._status = MemberStatus.ACTIVE;
    }
  }

  /**
   * Suspend le compte du membre
   */
  suspend() {
    this._status = MemberStatus.SUSPENDED;
  }

  /**
   * Réactive le compte du membre
   * @throws {Error} Si des amendes sont impayées
   */
  activate() {
    if (this._fineBalance >= Member.MAX_FINE_THRESHOLD) {
      throw new Error('Impossible d\'activer le compte - amendes impayées');
    }
    this._status = MemberStatus.ACTIVE;
  }

  /**
   * Désactive le compte du membre
   */
  deactivate() {
    this._status = MemberStatus.INACTIVE;
  }

  /**
   * Retourne les détails complets du membre
   * @returns {Object}
   */
  getDetails() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      phone: this._phone,
      address: this._address,
      registrationDate: this._registrationDate,
      status: this._status,
      fineBalance: this._fineBalance,
      borrowLimit: this._borrowLimit,
      currentBorrowCount: this._currentBorrowings.length,
      currentBorrowings: [...this._currentBorrowings]
    };
  }

  /**
   * Représentation textuelle du membre
   * @returns {string}
   */
  toString() {
    return `${this._name} (${this._email}) - ${this._currentBorrowings.length}/${this._borrowLimit} emprunts - Amendes: ${this._fineBalance.toFixed(2)}€`;
  }

  /**
   * Génère un ID unique pour le membre
   * @private
   * @returns {string}
   */
  _generateId() {
    return `MBR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valide les données du membre
   * @static
   * @param {Object} memberData - Données à valider
   * @returns {Object} Résultat de validation {valid: boolean, errors: Array}
   */
  static validate(memberData) {
    const errors = [];

    if (!memberData.name || memberData.name.trim() === '') {
      errors.push('Nom est requis');
    }

    if (!memberData.email || !this._isValidEmail(memberData.email)) {
      errors.push('Email invalide');
    }

    if (!memberData.phone || memberData.phone.trim() === '') {
      errors.push('Téléphone est requis');
    }

    if (!memberData.address || memberData.address.trim() === '') {
      errors.push('Adresse est requise');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide le format d'un email
   * @private
   * @static
   * @param {string} email
   * @returns {boolean}
   */
  static _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Member, MemberStatus };
}
