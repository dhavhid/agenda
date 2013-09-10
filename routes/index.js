
/*
 * GET home page.
 */

// Including the mongodb driver
var mongodb = require('mongodb');
 
// create the connection object
var agenda = new mongodb.Db('agenda', new mongodb.Server("127.0.0.1", 27017, {}), {safe:false});

exports.index = function(req, res){
	
	agenda.close();
	/
	agenda.open(function (error, client) {
		if (error) throw error;
		
		// In the param client we get the handler of the recently openned connection, this is necessary to query the database.
		
		// We need to stablish the collection from which we want the data, in our case the collection is Contact
		var collection = new mongodb.Collection(client, 'contact');
		
		// We query the database to get the record the user asked in the petition.
		// with this part of the code we convert the id in the url to a proper bson ID: agenda.bson_serializer.ObjectID.createFromHexString(req.params.id)
		collection.find().toArray(function(err, docs) {
			res.render('index', { title: 'Agenda', contacts: docs });
		});
	});
};