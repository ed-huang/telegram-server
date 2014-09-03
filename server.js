var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(function (req, res, next) {
  console.log('bp: ', req.body); // populated!
  next();
});

var users = {
    'users': [
        { 
            id: 'cristianstrat', 
            name: 'Christian Strat',
            password: 'hello',
            picture: '/assets/images/cristian-strat.png'
        },
        { 
            id: 'johnmaeda', 
            name: 'John Maeda',
            password: 'hello',
            picture: '/assets/images/cristian-strat.png'
        },
        { 
            id: 'clarkewolfe', 
            name: 'Clarke Wolfe',
            password: 'hello',
            picture: '/assets/images/cristian-strat.png'
        },
        { 
            id: 'fastcompany', 
            name: 'Fast Company',
            password: 'hello',
            picture: '/assets/images/cristian-strat.png'
        },
        { 
            id: 'fastcompany', 
            name: 'Fast Company',
            password: 'hello',
            picture: '/assets/images/cristian-strat.png'
        }
    ]
}

var posts = {
    'posts': [
      { 
        id: '1',
          author: 'cristianstrat', 
          text: 'Great team constantly learn and re-learn how to move from the ego of *I* to the ego of *WE*.',
          timestamp: '2013-08-22T14:06:00+08:00'
      },
      {
        id: '2',
          author: 'clarkewolfe', 
          text: 'Listen, I don\'t want to brag about my awesome #gaming skills but someone made it into an @IGN article today...',
          timestamp: '2014-01-22T14:06:00+08:00'
      },
      { 
        id: '3',
          author: 'fastcompany', 
          text: 'THIS APP IS LIKE A REMOTE CONTROL FOR YOUR CREDIT CARDS',
          timestamp: '2014-08-22T14:17:37+08:00'
      },
      { 
        id: '4',
          author: 'fastcompany', 
          text: 'Leica is celebrating its 100th birthday by launching an entirely new camera system. Born out of a design partnership with Audi, the unibody Leica T is an APS-C-sensored minimalistic masterpiece.',
          timestamp: '2014-08-22T14:06:00+08:00'
      }
    ]
}

// Route implementation
app.get('/hello.txt', function (req, res) {
    res.send(posts);
});

app.get('/api/posts', function (req, res) {
    res.send(posts);
});

app.post('/api/posts', function (req, res ) {
       
});

app.get('/api/users', function (req, res) {
    res.send(users);
});

app.post('/api/users', function (req, res) {
    
});

app.delete('/api/posts/:post_id', function(req, res) {});



var server = app.listen(3000, function() {
    console.log('Serving on: ', server.address().port);
});

