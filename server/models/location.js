'use strict';
  class Location {
	  constructor (object) {
			this._id = object._id,
			this._key = object._key,
			this.tenant = object.tenant,
			this.name = object.name,
			this.lat = object.lat,
			this.lon = object.lon
		}
  }
module.exports = Location;