var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
// var Schema = mongoose.Schema;

// var userSchema = new Schema({
//     name: String,
//     password: String,
//     picture: String
// })

var kittySchema = new mongoose.Schema({
        name: String
    });

    // var Kitten = mongoose.model('Kitten', kittySchema);

    // console.log(silence.name); // 'Silence'

    kittySchema.methods.speak = function() {
        var greeting = this.name
            ? "Meow name is " + this.name
            : "I don't have a name"
        console.log(greeting);
    };

    var Kitten = mongoose.model('Kitten', kittySchema);

    var silence = new Kitten({ name: 'Silence' });

    silence.speak();

    var fluffy = new Kitten({ name: 'fluffy' });
    fluffy.speak(); // "Meow name is fluffy"


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    //yay
    console.log('opened server');
    
    

    fluffy.save(function (err, fluffy) {
        if (err) return console.error(err);
        fluffy.speak();
    });

    Kitten.find(function (err, kittens) {
        if (err) return console.error(err);
        console.log(kittens);
    });

    // var Kitten = mongoose.model('Kitten', kittySchema);

    // var fluffy = new Kitten({ name: 'fluffy' });
    // fluffy.speak(); // "Meow name is fluffy"
    
    // fluffy.save(function (err, fluffy) {
    //     if (err) return console.error(err);
    //     fluffy.speak();
    // });

    // Kitten.find(function (err, kittens) {
    //     if (err) return console.error(err);
    //     console.log(kittens);
    // });

    

});


