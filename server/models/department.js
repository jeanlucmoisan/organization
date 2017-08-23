'use strict';
  class Department {
	  constructor (object) {
			this._id = object._id,
			this._key = object._key,
			this.tenant = object.tenant,
			this.name = object.name,
			this.collaborators = object.collaborators,
			this.manager = object.manager,
			this.addressID = object.addressID
	  }
  }
module.exports = Department;