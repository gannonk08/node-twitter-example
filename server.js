const debug = require('debug')('sockettest:server');
const http = require('http');

const port = '3000';
const app = require('./app');
const Twitter = require('twitter');
const config = require('./_config');

const server = app.listen(3000, () => {
  console.log('The server is listening on port 3000');
});

const io = require('socket.io').listen(server);

const client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

const hashtags = '#Trump, #DonaldTrump, #makeamericagreatagain, #hillaryclinton #StrongerTogether';

client.stream('statuses/filter', {track: hashtags}, (stream) => {
  stream.on('data', (tweet) => {
    if (tweet.place) {
      if (tweet.place.country_code === 'US') {
        var box = tweet.place.bounding_box.coordinates[0]
        var center = getCenter(box)
        if (inside(center, colorado)) {
          console.log(tweet.place);
        }
        io.emit('newTweet', tweet);

      }
    }
  });
  stream.on('error', (error) => {
    throw error;
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

function getCenter([[bl_X, bl_Y], [tl_X, tl_Y], [tr_X, tr_Y], [br_X, br_Y]]) {
    var centerX = parseFloat(((tl_Y+bl_Y)/2).toPrecision(7))
    var centerY = parseFloat(((br_X + bl_X)/2).toPrecision(7))
    return [centerX, centerY]
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

var colorado =
[[37.0004, -109.0448],[36.9949, -102.0424],[41.0006, -102.0534],[40.9996, -109.0489],[37.0004, -109.0448]]
