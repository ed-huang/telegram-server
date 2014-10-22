var logger = require('nlogger').logger(module);
var express = require('express');
var router = express.Router();
var db = require('../../../database/database');
var Post = db.model('Post');
var User = db.model('User');
var userUtil = require('../user/user-util');

/**
* Requesting posts from the Posts Stream 
* dashboard GET()
*/

router.get('/', function (req, res) {
    
    logger.info('GET on /api/posts');

    var query = {};
    var emberPosts = [];
    
    
    if (req.query.operation === 'dashboard') {
        var users = [];
        if (req.user) {
            var searchArray = req.user.following.slice(0);
            searchArray.push(req.user.id);
            query = { author: { $in: searchArray }};
            logger.info('this is query: ', query);

            Post.find(query, function (err, posts) {
                if (err) return res.status(403).end();
                posts.forEach(function (post) {
                    var emberPost = {
                        id: post._id,
                        author: post.author, 
                        text: post.text,
                        timestamp: post.timestamp
                    }
                    emberPosts.push(emberPost);
                    users.push(post.author);
                });

                User.find({ id: { $in: users }}, function (err, users) {
                    if (err) return res.status(403).end();
                    var copyUsers = [];
                    users.forEach(function (user) {
                        var u = userUtil.createClientUser(user, req.user);
                        copyUsers.push(u);
                    });
                    return res.send({ posts: emberPosts, users: copyUsers } );
                });
            });
        }
        
    } else if (req.query.operation === 'index') {
        logger.info('index route');
        query = { author: req.query.author };
        var author = userUtil.createClientUser(req.query.author, req.user);
        Post.find(query, function (err, posts) {
            if (err) return res.status(403).end();
            posts.forEach(function (post) {
                var emberPost = {
                    id: post._id,
                    author: post.author, 
                    text: post.text,
                    timestamp: post.timestamp
                }
                emberPosts.push(emberPost);
            });
            return res.send({ posts: emberPosts } );
        });
    }
});

/**
* Creating a post. Most Likely from the dashboard.
*/
router.post('/', ensureAuthenticated, function (req, res) {
    logger.info('posts request err??');

    if (req.user.id === req.body.post.author) {
        logger.info('user.id same as post author');

        var post = {
            author: req.body.post.author,
            text: req.body.post.text,
            timestamp: req.body.post.timestamp
        };

        logger.info('id and author passed');

        Post.create(post, function (err, post) {
            if (err) return res.status(403).end();
            
            logger.info('Post Record Created: ', post.text);
            
            var emberPost = {
                id: post._id,
                author: req.user.id,
                text: post.text,
                timestamp: post.timestamp
            };
            
            return res.send({ post: emberPost });
        });
    } else {
        logger.error('user tried unauthorized post');
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