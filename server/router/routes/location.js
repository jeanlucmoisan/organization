'use strict';

// TODO add tenant management
// TODO add logging management
// TODO sanitize params

module.exports = (app, db) => {

	const locationColl = db.collection('location');
	const Location = require('./../../models/location');

	// GET all locations
	app.get('/locations', async (req, res) => {
		try {
			var locationCursor = await locationColl.all();
			console.log('location cursor retrieved from db');
			var locations = await locationCursor.all();
			console.log(locations.length + ' locations retrieved from db');
			res.json(locations);
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
	});


};