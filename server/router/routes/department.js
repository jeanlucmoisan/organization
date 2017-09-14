'use strict';

// TODO add tenant management
// TODO add logging management
// TODO sanitize params

module.exports = (app, db) => {

	const deptColl = db.collection('department');
	const edgeColl = db.edgeCollection('departmentContainedBy');
	const Department = require('./../../models/department');
	const Edge = require('./../../models/edge');

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

	// GET all departments links
	app.get('/departmentLinks', async (req, res) => {
		try {
			var edgeCursor = await edgeColl.all();
			var links = [];
			var edges = await edgeCursor.all().then((results)=>{
				for (var i=0;i<results.length;i++) {
					var link = {};
					link.source = results[i]._from;
					link.source = link.source.replace('department\/','');
					link.target = results[i]._to;
					link.target = link.target.replace('department\/','');
					links.push(link);
				}
				res.json(links);
			});
			/*	
				res.json(edges);*/
		} catch(e) {
			res.status(500);
			res.render('error',{error:e});
		}
	});

	// GET departments by property
	app.get('/department/property/:name/:value', async (req, res) => {
		const property = req.params;
		console.log('Department API - GET property with '+JSON.stringify(property));
		if (property.name == "name" || property.name == "topDepartment" || property.name == "id") {
			if (property.name == "id") property.name = "_key";
			var query = {
				query: 'FOR doc IN department FILTER doc.@propName == @propValue RETURN doc',
				bindVars: {propName:property.name, propValue:property.value}
			};
			var deptCursor = await db.query(query);
			var departments = await deptCursor.all();
			for (let i=0;i<departments.length;i++) {
				query = {
					query: 'FOR doc IN departmentContainedBy FILTER doc._from == @key RETURN doc',
					bindVars: { key: departments[i]._id }
				};
				var linkCursor = await db.query(query);
				var attachedTo = await linkCursor.all();
				if (attachedTo) {
					departments[i].attachedTo = attachedTo[0]._to;
				} else {
					departments[i].attachedTo = '';
				}
			}
		}
		res.json(departments);
	});

	// GET department tree branch by node and number of levels
	app.get('/department/tree/:nodekey/:levels', async (req, res) => {
		const property = req.params;
		property.nodeid = property.nodekey ? 'department/'+property.nodekey : null;
		console.log(JSON.stringify(property));
		const graph = db.graph('departmentTree');
		const options = {
			maxDepth: property.levels,
			direction:'inbound'
		};
		const result = await graph.traversal(property.nodeid,options);
		const vertices = result.visited.vertices;
		const rawEdges = [];
		const links = [];
		// resulting paths is an array of {edges,vertices}
		// we must cleanup the array to get unique edges
		const paths = result.visited.paths;
		for (var i=0;i<paths.length;i++) {
			var currentEdges = paths[i].edges;
			for (var j=0;j<currentEdges.length;j++) {
				var edgeFound = false;
				for (var k=0;k<rawEdges.length;k++) {
					if (currentEdges[j]._key===rawEdges[k]._key) {
						edgeFound = true;
					}
				}
				if (!edgeFound) {
					rawEdges.push(currentEdges[j]);
				}
			}
		}
		for (var i=0;i<rawEdges.length;i++) {
			var link = {};
			link.source = rawEdges[i]._from;
			link.source = link.source.replace('department\/','');
			link.target = rawEdges[i]._to;
			link.target = link.target.replace('department\/','');
			links.push(link);
		}
		const response = {vertices:vertices,links:links};
		res.json(response);
	});

	// POST single department
	app.post('/department', async (req, res) => {
		try {
			// department sent in body may have an array of {_from,_to} called "edges" to feed the edges
			// by convention value of 1 is assigned to the new object
			const newDept = req.body.department;
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