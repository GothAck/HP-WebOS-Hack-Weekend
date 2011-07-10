// Any requires here

var http = require ('http');
var querystring = require('querystring');

function search (term, callback, location) {
  http.get(
    {
      host: 'gdata.youtube.com',
      port: 80,
      path: "/feeds/api/videos?q="+querystring.escape(term)+"&alt=json&max-results=3&format=5" 
    },
    function (response) {
      var data = '';
      response.on('data', function (chunk) { data += chunk })
      response.on('end', function () {
        // process data here
        data = JSON.parse(data);
        var myResultObjects = parse_data(data);
        callback(false, myResultObjects); //If there is an error, callback with true as first value and data = error string
      });
    }).on('error', function (error) {
      callback(true, 'HTTP Error');
    });
}

function parse_data(data) {
  var feed = data.feed;
  var items = feed.entry || [];
  var results = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    results[i] = ({
      title:  item.title.$t,
      thumburl: items[i].media$group.media$thumbnail[0].url,
      playerurl:  items[i].media$group.media$content[0].url,
      content:  items[i].content.$t,
      published:  items[i].published.$t
    });
  }
  return results;
}

exports.search = search;
