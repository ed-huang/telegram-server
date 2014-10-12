var logger = require('nlogger').logger(module);
var express = require('express');
var router = express.Router();
var db = require('../../../database/database');
var Post = db.model('Post');

/**
* Requesting posts from the Posts Stream 
* dashboard GET()
*/

router.get('/', function (req, res) {
    
    logger.info('GET on /api/posts');

    var query = {};
    
    if (req.query.operation === 'dashboard') {
        if (req.user) {
            query = { $or: [{ author : { $in: req.user.following }}, { author: req.user.id }]};
            logger.info('this is query: ', query);    
        }
        
    } else {
        query = req.query.author ? { author: req.query.author } : {} ;
    }

    Post.find(query, function (err, posts) {
        if (err) return res.status(403).end();
        var emberPosts = [];
        posts.forEach(function (post) {
            var emberPost = {
                // id: post._id,
                author: post.author, 
                text: post.text,
                timestamp: post.timestamp
            }
            emberPosts.push(emberPost);

        });
        return res.send({ posts: emberPosts } );
    });
});

/**
* Creating a post. Most Likely from the dashboard.
*/
router.post('/', ensureAuthenticated, function (req, res) {
    logger.info('posts request');

    var post = {
        author: req.body.post.author,
        text: req.body.post.text,
        timestamp: req.body.post.timestamp
    };

    if (req.user.id === post.author) {
        logger.info('id and author passed');

        Post.create(post, function (err, post) {
            if (err) return res.status(403).end();
            
            logger.info('Post Record Created: ', post.text);
            
            var emberPost = {
                // id: post._id,
                author: req.user.id,
                text: post.text,
                timestamp: post.timestamp
            };
            
            return res.send({ post: emberPost });
        });
    } else {
        logger.warning('user tried unauthorized post');
        return res.status(403).end();
    }
});

router.delete('/:post_id', ensureAuthenticated, function (req, res) {
    logger.info('DELETE POST: ', req.params.post_id);
    Post.remove({ _id: req.params.post_id }, function (err) {
        if (err) {return res.status(404).end();}
        return res.send({});
    });
});

function ensureAuthenticated (req, res, next) {
    logger.info('ensureAuthticated: ', req.isAuthenticated());
    if (req.isAuthenticated()) {
        logger.info('isAuthenticated');
        return next();
    } else {
        return res.status(403);
    }
}

module.exports = router;