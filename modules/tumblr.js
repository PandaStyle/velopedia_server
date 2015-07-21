var tumblr = require('tumblr');



var oauth = {
    consumer_key: 'g0tjMDWC1jHasbTkTdi6jkYz0lcBz9cPMUC3Fz8PnV6LUjmzBo',
    consumer_secret: 'KFKTyBlIZ6ZeIdBrais2ylfcp052DFnPSVlHQW3VXnb1jj1R5z',
    token: 'UXqgyWDhidYbH9nIsBg8r2DxQqKxDWmYAsjxiaDMDfYPVlqgIs',
    token_secret: 'nePBkXogpc7tWzW3E5z6htKPs48N6xJ2v4ldYX7AmhsuFB1Yyu'
};
var user = new tumblr.User(oauth);

user.info(function (error, response) {
    if (error) {
        throw new Error(error);
    }
    console.log(response.user);
    return response.user;
});

module.exports = {
    getPosts: function(){
        return
    }
};
