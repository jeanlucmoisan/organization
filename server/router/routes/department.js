'use strict';

// TODO add tenant management
// TODO add logging management

module.exports = (app, db) => {

	const deptColl = db.collection('department');
	const edges = db.edgeCollection('departmentContains');
	const Department = require('./../../models/department');
	// GET all departments
	app.get('/departments', async (req, res) => {
		try {
			var deptCursor = await deptColl.all();
			var departments = await deptCursor.all();
			res.json(departments);
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
	});

	// GET one department by id
	app.get('/department/:id', async (req, res) => {
		const id = req.params.id;
		try {
			var department = await deptColl.document(id);
			res.json(department);
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
	});

	// POST single department
	app.post('/department', async (req, res) => {
		try {
			// department sent in body may have an array of {_from,_to} called "edges" to feed the edges
			// by convention value of 1 is assigned to the new object
			// TODO assign each property to newDept
			const newDept = req.body;
			var department = new Department(newDept);
			var feedbackDepartment = await deptColl.save(department);
			console.log('department '+JSON.stringify(feedbackDepartment)+' has been created');
			if (newDept.edges) {
				var edges = newDept.edges;
				for (var i=0;i<edges.length;i++) {
					edges[i]._from = edges[i]._from == '1' ? feedbackDepartment._id : edges[i]._from;
					edges[i]._to = edges[i]._to == '1' ? feedbackDepartment._id : edges[i]._to;
					var edge = new Edge(edges[i]);
					var newEdge = await db.edgeCollection.save(edge);
					console.log('department edge '+JSON.stringify(newEdge)+' has been created');
				}
			}
			res.json(feedbackDepartment);
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
  });

	// PATCH single department
	app.patch('/department/:id', async (req, res) => {
		try {
			const updates = req.body.updates;
			updates._id = req.params.id;
			var department = new Department(updates);
			if (department._rev) {
				var feedbackDepartment = await deptColl.update(department,{'waitForSync':true,'rev':department._rev,'policy':'error'});
				console.log('department '+JSON.stringify(feedbackDepartment)+' has been updated');
			} else {
				res.status(500);
				res.render('error',{error:'department updates should contain _rev'});
			}
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
	});

	// DELETE single department
	app.delete('/department/:id', async (req, res) => {
		// delete vertex and associated edges
		try {
			const id = req.params.id;
			// TODO search for edges to delete before deleting the vertex
			await deptColl.remove(id,{'waitForSync':true});
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
	});
};