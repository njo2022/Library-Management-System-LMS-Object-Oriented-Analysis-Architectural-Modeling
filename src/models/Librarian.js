/**
 * Classe Librarian - Représente un bibliothécaire
 * Responsabilité: Gestion administrative de la bibliothèque
 */
class Librarian {
  /**
   * Constructeur de la classe Librarian
   * @param {string} name - Nom du bibliothécaire
   * @param {string} email - Email professionnel
   * @param {string} employeeId - Identifiant employé
   * @param {string} department - Département (optionnel)
   */
  constructor(name, email, employeeId, department = 'General') {
    this._id = this._generateId();
    this._name = name;
    this._email = email;
    this._employeeId = employeeId;
    this._department = department;
    this._hireDate = new Date();
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

  getEmployeeId() {
    return this._employeeId;
  }

  getDepartment() {
    return this._department;
  }

  getHireDate() {
    return this._hireDate;
  }

  /**
   * Retourne les détails du bibliothécaire
   * @returns {Object}
   */
  getDetails() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      employeeId: this._employeeId,
      department: this._department,
      hireDate: this._hireDate
    };
  }

  /**
   * Représentation textuelle du bibliothécaire
   * @returns {string}
   */
  toString() {
    return `${this._name} (${this._employeeId}) - ${this._department}`;
  }

  /**
   * Génère un ID unique
   * @private
   * @returns {string}
   */
  _generateId() {
    return `LIB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Librarian };
}
