'use strict';
  class Edge {
	  constructor (object) {
			this._key = object._key,
			this._id = object._id,
			this._rev = object._rev,
			this._from = object._from,
			this._to = object._to
	  }
  }
module.exports = Edge;