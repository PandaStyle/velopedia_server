var Hapi = require('hapi');
var Good = require('good');
var async = require('async');
var feed = require('feed-read');
var _ = require('lodash');
var moment = require('moment');


var tumblr = require('tumblr');
var rssUrls = require('./modules/rssurls.js')

var oauth = {
    consumer_key: 'g0tjMDWC1jHasbTkTdi6jkYz0lcBz9cPMUC3Fz8PnV6LUjmzBo',
    consumer_secret: 'KFKTyBlIZ6ZeIdBrais2ylfcp052DFnPSVlHQW3VXnb1jj1R5z',
    token: 'UXqgyWDhidYbH9nIsBg8r2DxQqKxDWmYAsjxiaDMDfYPVlqgIs',
    token_secret: 'nePBkXogpc7tWzW3E5z6htKPs48N6xJ2v4ldYX7AmhsuFB1Yyu'
};
var user = new tumblr.User(oauth);



// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8081,
    routes: {
        cors: {
            origin: ['*']
        }
    }
});



server.route({
    method: 'GET',
    path:'/getposts/{offset}',
    handler: function (request, reply) {
        user.dashboard({offset: request.params.offset, limit: 20, type: 'photo' }, function (error, response) {
            if (error) {
                throw new Error(error);
            }
            //_.uniq(response.posts,)

           // _.map(arr, function(o) { return _.pick(o, 'q'); });

            var unique  = _.uniq(response.posts,  'reblog_key');
            var reduced = _.map(unique,
                function(o) {
                    return _.pick(o, [
                        'blog_name',
                        'id',
                        'post_url',
                        'date',
                        'reblog_key',
                        'note_count',
                        'photos']);
                });


            console.log(" --------------- ", reduced.length);
            reply( reduced);
        });


    }
});

// Add the route
server.route({
    method: 'GET',
    path:'/getnews',
    handler: function (request, reply) {
        async.map(rssUrls, function (i, callback) {
            feed(i, callback);
        }, function (err, result) {
            if (err) {
                // Somewhere, something went wrong…
            }
            var res = _.map(_.flattenDeep(result), function(item){
                return {
                    title: item.title,
                    link: item.link,
                    date: item.published,
                    feed: item.feed,
                    diff: moment.duration(moment().diff(moment(new Date(item.published)))).humanize()
                }
            });

            reply(_.sortByOrder(res, function(item) {return new Date(item.date);}, ['desc']));

        });
    }
});

server.route({
    method: 'GET',
    path:'/ext/{param*}',
    handler: {
        directory: {
            path: 'ext'
        }
    }
});



server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
