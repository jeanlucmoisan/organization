'use strict';

const db = require('./server/config/db.js'),
  locationReader = require('readline').createInterface({
	 input: require('fs').createReadStream('./server/sample/locations.json')
  }),
  edgeReader =  require('readline').createInterface({
	 input: require('fs').createReadStream('./server/sample/locationTree.json')
  }),
  Location = require('./server/models/location'),
  Edge = require('./server/models/edge');

function readAndLoad() {
	var arrayLoc = [];
	var arrayEdges = [];
	//read the file
	//loop on lines and load the object
	locationReader.on('line',function (line) {
		var location = new Location(JSON.parse(line));
		arrayLoc.push(location);
	});
	//delete the collection content and bulk import the collection
	locationReader.on('close',async function () {
		console.log(arrayLoc.length+' locations loaded');
		const locations = db.collection('location');
		await locations.truncate()
		console.log('collections emptied');
		//insert the vertex
		await locations.import(arrayLoc,{"waitForSync":true,"type":"documents"});
		var nbLoc = await locations.count();
		console.log(JSON.stringify(nbLoc)+' locations in collection');
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
		const edges = db.edgeCollection('locationContainedBy');
		await edges.truncate();
		console.log('edges emptied');
		//insert the edges			
		await edges.import(arrayEdges,{"waitForSync":true,"type":"documents"});
		var nbEdges = await edges.count();
		console.log(JSON.stringify(nbEdges)+' edges in collection');		
	});
}

readAndLoad();
