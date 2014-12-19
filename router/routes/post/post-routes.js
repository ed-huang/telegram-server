console.log('post-routes');
var db = require('../../../database/database');
var logger = require('nlogger').logger(module);
var router = require('express').Router();
var userUtil = require('../user/user-util');

var Post = db.model('Post');
var User = db.model('User');


/**
* Requesting posts from the Posts Stream 
* dashboard GET()
*/

router.get('/', function (req, res) {
    logger.info('GET on /api/posts'); 
    if (req.query.operation === 'dashboard') {
        logger.info('GET posts for dashboard');
        getPostsForDashBoard(req, res);
    } else if (req.query.operation === 'index') {
        logger.info('GET posts for user/index route');
        getPostsForUserIndex(req, res);
    } else {
        return res.status(500).end();
    }
});

/**
* Creating a post. Most Likely from the dashboard.
*/
router.post('/', userUtil.ensureAuthenticated, function (req, res) {
    logger.info('Create post'); 
    if (req.user.id === req.body.post.author) {
        logger.info('user.id same as post author');

        var post = {
            author: req.body.post.author,
            original_author: req.body.post.original_author,
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
                original_author: post.original_author,
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

router.delete('/:post_id', userUtil.ensureAuthenticated, function (req, res) {
    logger.info('Post delete route.');
    Post.remove({ _id: req.params.post_id, author: req.user.id }, function (err) {
        if (err) {
            logger.error('Post Remove error: ', err);
            return res.status(404).end();
        }
        logger.info('DELETE POST: ', req.params);
        return res.send({});
    });
});

function getPostsForDashBoard(req, res) {
    var users = [];
    var query = {};
    var emberPosts = [];
    
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
                    original_author: post.original_author,
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
}

function getPostsForUserIndex(req, res) {
    var emberPosts = [];
    var query = { author: req.query.author };
    Post.find(query, function (err, posts) {
        if (err) {
            logger.error('Error in index, Looking for post.');
            return res.status(403).end();
        }
        posts.forEach(function (post) {
            var emberPost = {
                id: post._id,
                author: post.author,
                original_author: post.original_author,
                text: post.text,
                timestamp: post.timestamp
            }
            emberPosts.push(emberPost);
        });
        return res.send({ posts: emberPosts } );
    });
}

module.exports = router;