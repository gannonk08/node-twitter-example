const twitterStream = angular.module('myApp', ['chart.js'])

twitterStream.controller("mainCtrl", ['$scope', 'socket',
function ($scope, socket) {
  //chart labels
  $scope.labels = ["iPhone", "iPad", "Android", "Web Client", "Other"];
  //chart colors
  $scope.colors = ['#6c6a6c','#000000','#7FFD1F','#EC872A', '#9527C2'];
  //intial data values
  $scope.trumpData = [0,0,0,0,0];
  $scope.clintonData = [0,0,0,0,0];

  socket.on('newTweet', function (tweet) {
    $scope.tweet = tweet.text;
    $scope.user = tweet.user.screen_name;
    $scope.location = tweet.place.full_name;
    $scope.user = tweet.user.screen_name;
    $scope.center =
    //parse source from payload
    var source = tweet.source.split('>')[1].split('<')[0].split(' ')[2];
    //all hashtags in the tweet
    var hashtags = tweet.entities.hashtags.map(function(el){
      return el.text.toLowerCase();
    });

    //check source and increment for #trump tweets
    if (hashtags.includes('trump', 'donaldtrump', 'makeamericagreatagain')) {
      switch (source) {
        case 'iPhone': $scope.trumpData[0]++;
        break;
        case 'iPad': $scope.trumpData[1]++;
        break;
        case 'Android': $scope.trumpData[2]++;
        break;
        case 'Web': $scope.trumpData[3]++;
        break;
        default: $scope.trumpData[4]++;
      }
    }

    //check source and increment for #strongertogether tweets
    else if (hashtags.includes('strongertogether','hillaryclinton')) {
      switch (source) {
        case 'iPhone': $scope.clintonData[0]++;
        break;
        case 'iPad': $scope.clintonData[1]++;
        break;
        case 'Android': $scope.clintonData[2]++;
        break;
        case 'Web': $scope.clintonData[3]++;
        break;
        default: $scope.clintonData[4]++;
      }
    }
  });
}
]);


/*---------SOCKET IO METHODS (careful)---------*/

twitterStream.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});


function getCenter([[bl_X, bl_Y], [tl_X, tl_Y], [tr_X, tr_Y], [br_X, br_Y]]) {
    return [((tl_Y+bl_Y)/2).toPrecision(7), ((br_X + bl_X)/2).toPrecision(7)]
}
