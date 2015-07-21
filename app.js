var Hapi = require('hapi');
var Good = require('good');

var FeedParser = require('feedparser')
var Request = require('request');

var xml2js = require('xml2js');
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
    port: 8000
});


server.route({
    method: 'GET',
    path:'/getposts/{offset}',
    handler: function (request, reply) {
        user.dashboard({offset: request.params.offset, limit: 20, type: 'photo' }, function (error, response) {
            if (error) {
                throw new Error(error);
            }
            reply( response);
        });
    }
});

// Add the route
server.route({
    method: 'GET',
    path:'/getnews',
    handler: function (request, reply) {
        var url = rssUrls[1];

        var req = Request(url),
            feedparser = new FeedParser();

        req.on('error', function (error) {
            // handle any request errors
        });
        req.on('response', function (res) {
            var stream = this;

            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

            stream.pipe(feedparser);
        });


        feedparser.on('error', function(error) {
            // always handle errors
        });
        feedparser.on('readable', function() {
            // This is where the action is!
            var stream = this
                , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
                , item;

            while (item = stream.read()) {
                reply(item);
            }
        });
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