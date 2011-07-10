// Any requires here

var http = require ('http');
var querystring = require('querystring');

function search (term, location, callback) {
  http.get(
    {
      host: 'content.guardianapis.com',
      port: 80,
      path: api_call_url(term)
    },
    function (response) {
      var data = '';
      response.setEncoding('utf8');
      response.on('data', function (chunk) { data = data + chunk });

      response.on('end', function () {
        // process data here
        data =JSON.parse(data);
        var myResultObjects = parse_data(data);
        try {
          callback(false, myResultObjects);
        } catch (err) {
          callback(true, ['JSON Error'])
        }
      });
    }).on('error', function (error) {
      callback(true, ['HTTP Error']);
    });
}

// Makes keyword search url using given paramater string
function api_call_url(keywords) {
  var base_url = "/search?";
  var appid = "mxew8ja7zukpxz87kaw2cbjq"; 
  var section = "media";
  var apicall = base_url + querystring.stringify({
    q:  keywords,
    section:  section,
    format: "json",
    'api-key':  appid,
    'order-by': "relevance",
    'show-fields':  "all"
  });
  return apicall;
}

function parse_data(data) {
  var results = [];
  var items = data.response.results;
  for (var i = 0; i < 3 || i < results.length; i++) {
    var item = items[i].fields;
    results[i] = ({
      title:  item.headline,
      text: item.trailText,
      url:  item.shortUrl,
      thumburl: item.thumbnail || ''
    });
  }
  return results;
}

exports.search = search;
