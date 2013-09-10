
/*
 * Contacts controller, it provides the middle layer between data and presentation
 */

// 
var mongodb = require('mongodb');
var fs = require('fs');
 
// We need to initialize the database connection.
var agenda = new mongodb.Db('agenda', new mongodb.Server("127.0.0.1", 27017, {}), {safe:false});

exports.contact = function(req, res){
	
	// Important to make sure to close any open conexion before atempting to query the database
	agenda.close();
	
	// We will push the the contact requested by the user.
	agenda.open(function (error, client) {
		if (error) throw error;
		
		// In the param client we get the handler of the recently openned connection, this is necessary to query the database.
		
		// We need to stablish the collection from which we want the data, in our case the collection is Contact
		var collection = new mongodb.Collection(client, 'contact');
		
		// We query the database to get the record the user asked in the petition.
		// with this part of the code we convert the id in the url to a proper bson ID: agenda.bson_serializer.ObjectID.createFromHexString(req.params.id)
		collection.find({_id: agenda.bson_serializer.ObjectID.createFromHexString(req.params.id)}).toArray(function(err, docs) {
			res.render('contact', { title: 'Agenda ' + docs[0].name, contact: docs });
		});
	});
};


// this action is intented to return the picture from the contact saved in database.
exports.picture = function(req, res){

	agenda.close();

	agenda.open(function(error, client){
		if(error) throw error;
		var collection = new mongodb.Collection(client, 'contact');
		collection.findOne({_id: agenda.bson_serializer.ObjectID.createFromHexString(req.params.id)},function(err,pic){
			res.set('Content-type', pic.profile_picture.image_type);
			res.end(new Buffer(pic.profile_picture.image_buffer, 'base64'));
		});
	});
};

exports.save = function(req, res){
	
	agenda.close();
	agenda.open(function (error, client) {
		if (error) throw error;
		
		var collection = new mongodb.Collection(client, 'contact');
		
		// we get the uploaded picture then we buffer it and then we parse with the base64 algorigthm before save it into database.		
		var picture = req.files.profile_picture;
		var pictureBuffer = fs.readFileSync(picture.path); // it is necessary to include the FS Grid library from Node.js
		pictureBuffer = pictureBuffer.toString('base64');
		
		
		collection.update(
			{_id: agenda.bson_serializer.ObjectID.createFromHexString(req.param('contact_id'))}, 
			{ $set: 
				{ 
					firstname: req.param('txt_name'), 
					phone: req.param('txt_telephone'),
					email: req.param('txt_email'), 
					location: {
						country: req.param('txt_country'), 
						city: req.param('txt_city'), 
						neighboardhood: req.param('txt_address')
					},
					profile_picture: { 
						image_size: picture.size, 
						image_name: picture.name, 
						image_type: picture.type, 
						image_buffer: pictureBuffer 
					}
				} 
			});
			
		fs.unlink(picture.path); // Delete the uploaded picture from the file system.
		
		res.redirect('/');
	});
	
};