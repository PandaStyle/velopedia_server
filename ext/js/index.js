var postsOffset = 0,
    selectedRss = 0;

NProgress.start();

document.addEventListener('DOMContentLoaded', function () {
    console.log('domready in ' + ((new Date().getTime()) - (a.getTime()))+ "ms");

    getNews();
    getPosts(postsOffset);

    $(window).resize(function(){
        $('.news').height($(window).height()-90);
    });

    $('.loading').css('top', ($(window).height()-350)/2);

    $(window).on("scrollstart", function(){ $('body').addClass('disable-hover');});
    $(window).on("scrollstop", scrollHandler);



    $('.header-icon').click(function(){
        selectedRss += 1;
        if(selectedRss == 4){
            selectedRss = 0;
        }
        getNews(rss[Object.keys(rss)[selectedRss]]);
    })

});


var
    //serverUrl = "http://velopedia.meteor.com/getposts",
    serverUrl = "http://localhost:8081",
    //serverUrl = "http://velopedia-dev.elasticbeanstalk.com",

    getPostTriggered = true,
    smallestColumnOffset,
    postItemCount = 20,
    a = new Date(),
    postIds = [],

    appendedItems = [],

    DELAYVALUE = 0.05;



function getNewsInfo(feedname){
    var dict = {
        "Cycling Tips": ["cyclingTips.jpg", "cyclingnews.com"],
        "road.cc": ["roadCc.jpg", "road.cc"],
        "Cyclingnews Latest News": ["cyclingNews.jpg", "cyclingnews.com"],
        "Road Bike Action": ["roadBikeAction.jpg", "roadbikeaction.com"],
        "Roadcycling.com - Cycling info as it should be": ["roadCycling.jpg", "roadcycling.com"]
    }

    return dict[feedname];
}

NProgress.inc();
function getNews(){

    var
        spinner = $('.header > .spinner');

    $('.header > img, .header > .txt').fadeOut(100);

    $('.news').fadeOut(100);

    spinner.fadeIn(100);


    $.ajax({
        type: "GET",
        url: serverUrl + "/getnews"
    })
        .fail(function(err){
            console.log(err);
        })
        .done(function( res ) {
            console.log(res.length + "item arrived in " + ((new Date().getTime()) - (a.getTime()))+ "ms");

            var newsCont = $('.news').empty().show();

            for(var i=0; i < res.length; i++){
                var fragment = $('<div class="cont">\
                <div class="holder">\
                    <div class="image">\
                        <img class="site" src="assets/img/' + getNewsInfo(res[i].feed.name)[0] +'"/>\
                    </div>\
                    <div class="links">\
                                    <a class="title" href="'+ res[i].link +'">'+ res[i].title +'</a>\
                                    <div>\
                                    <a class="url" href="'+ res[i].link +'">' + getNewsInfo(res[i].feed.name)[1] + '</a> \
                                    <span class="time">' + res[i].diff + ' ago</span>\
                                    </div>\
                                    </div>\
                    </div>\
                </div>');

                var trd = i*0.1 + 's';
                newsCont.append(fragment.css({'transition-delay': trd}));
                //debugger;


            }
            spinner.fadeOut(100);

            setTimeout(function(){
                newsCont.find('.cont').css({ 'opacity': '1',
                    '-webkit-transform': 'translate3d(0,0,0)',
                    'transform': 'translate3d(0,0,0)' });
            }, 200);

            NProgress.inc();
            console.log("news append ready in " + ((new Date().getTime()) - (a.getTime()))+ "ms");
        })
}

function getPosts(o){
    var postTime = new Date();

    $.get( serverUrl + "/getposts/" + o)
        .fail(function(err){
            console.log(err);
        })
        .done(function( results ) {

            console.log(results.length + ' image with offset: ' + o + ' in ' + ((new Date().getTime()) - (postTime.getTime())) + ' ms');

            var originalLenght  = results.length;

            var uniqueList = _.uniq(results, function(item, key, a) {
                return item.reblog_key;
            });

            var newLength = uniqueList.length;

            if(originalLenght != newLength){
                console.log('duplicate, new length: ', newLength);
            }


            if(o == 0){
                salvattore.register_grid($('.tumblr')[0]);
            }

            var counter = 0;

            appendedItems = [];

            var loaded = 0;

            for(var i=0; i < results.length; i++){
                postIds.push(results[i].id);
                if(_.where(results[i].photos[0].alt_sizes, {width: 400}).length>0){
                    var url = _.where(results[i].photos[0].alt_sizes, {width: 400})[0].url;
                } else if(_.where(results[i].photos[0].alt_sizes, {width: 399}).length>0){
                    var url = _.where(results[i].photos[0].alt_sizes, {width: 399})[0].url;
                } else {
                    console.log("Image doesn't have 400 or 399 width ", results[i]);
                    var url = results[i].photos[0].alt_sizes[0].url;
                    console.log("Using width ", results[i].photos[0].alt_sizes[0]);
                }

                var item = $('<div class="box item">\
                                <div class="overlay">\
                                <div class="lay"></div>\
                                <i class="flaticon-logotype1 nameicon"></i> <span class="blogname">' + results[i].blog_name  + '</span> \
                                </div>\
                                <img src="' + url + '" alt=""/> \
                                </div>');

                item.imagesLoaded()
                    .done(function(c,b){

                        salvattore.append_elements($('.tumblr')[0], [c.elements[0]]);

                        var delay = DELAYVALUE * counter;

                        $(c.elements[0]).css({"transition-delay": delay + "s","-webkit-transition-delay": delay + "s"})

                        appendedItems.push($(c.elements[0]));

                        counter++;
                        NProgress.inc();
                        if(counter == results.length){
                            onFinish();
                        }
                    })
                    .fail (function( instance ) {
                        console.log('imagesLoaded failed for ', instance);
                    });

            };

            function onFinish(){
                $('.loading').remove();

                var c = _.sortBy(postIds);
                for(var i = 0; i < c.length; i ++){
                   if([i] == c[i++]){
                       console.log('IDENTITITI');
                   }
                }

                for(var i =0; i < appendedItems.length; i++){
                    appendedItems[i].css({"-webkit-transform": "translateY(0)","-moz-transform": "translateY(0)","-ms-transform": "translateY(0)","-o-transform": "translateY(0)",transform: "translateY(0)",opacity: 1});
                }

                $(window).on("scrollstop", scrollHandler);getPostTriggered = true;

                console.log("images loaded and appended, in " + ((new Date().getTime()) - (postTime.getTime()))+ "ms");
                NProgress.done();

                getPostTriggered = true;
                postsOffset += postItemCount;

                setColumnHeights();
            };
        });



}

function scrollHandler() {
    $('body').removeClass('disable-hover');

    var b = $(window).scrollTop() + $(window).height();
    if (b >= (smallestColumnOffset - ($(document).height()/5)) || b >= $(document).height() ) {
        $(window).off("scrollstop");

        if(getPostTriggered){
            getPostTriggered = false;
            getPosts(postsOffset);

        }
    };
}

function setColumnHeights() {
    for (var b = $(".column"), c = null, d = 0, e = b.length; e > d; d++) {
        var f = $(b[d]);
        null == c ? (c = f.height(), smallestColumnOffset = f.children("div").last().offset().top + f.children("div").last().height() / 2) : c > f.height() && (c = f.height(), smallestColumnOffset = f.children("div").last().offset().top + f.children("div").last().height() / 2)
    }
}




