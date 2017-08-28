'use strict';

const db = require('./server/config/db.js'),
  departmentReader = require('readline').createInterface({
	 input: require('fs').createReadStream('./server/sample/departments.json')
  }),
  edgeReader =  require('readline').createInterface({
	 input: require('fs').createReadStream('./server/sample/departmentTree.json')
  }),
  Department = require('./server/models/department'),
  Edge = require('./server/models/edge');

function readAndLoad() {
	var arrayDept = [];
	var arrayEdges = [];
	//read the file
	//loop on lines and load the object
	departmentReader.on('line',function (line) {
		var department = new Department(JSON.parse(line));
		arrayDept.push(department);
	});
	//delete the collection content and bulk import the collection
	departmentReader.on('close',async function () {
		console.log(arrayDept.length+' departments loaded');
		const departments = db.collection('department');
		await departments.truncate()
		console.log('collections emptied');
		//insert the vertex
		await departments.import(arrayDept,{"waitForSync":true,"type":"documents"});
		var nbDept = await departments.count();
		console.log(JSON.stringify(nbDept)+' departments in collection');
	});
	//read the file
	//loop on lines and load the object
	edgeReader.on('line',function (line) {
		var edge = new Edge(JSON.parse(line));
		arrayEdges.push(edge);
	});
	//delete the edge content and bulk import the collection
	edgeReader.on('close',async function () {
		console.log(arrayEdges.length+' edges loaded');
		const edges = db.edgeCollection('departmentContainedBy');
		await edges.truncate();
		console.log('edges emptied');
		//insert the edges			
		await edges.import(arrayEdges,{"waitForSync":true,"type":"documents"});
		var nbEdges = await edges.count();
		console.log(JSON.stringify(nbEdges)+' edges in collection');		
	});
}

readAndLoad();
