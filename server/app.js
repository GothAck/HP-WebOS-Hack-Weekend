
/**
 * Module dependencies.
 */

var express = require('express');
var redis = require('redis').createClient();
var redis_prefix = 'barcode.';
var barcodeLookup = require('./lib/barcode-upcdata.info.js');

// Lookup plugin structure
var pp = './lib/lookup-';
var pluginList = ['ebay', 'youtube', 'guardian'];

var pluginsLookup = {};
for (plugin in pluginList) {
  plugin = pluginList[plugin];
  console.log('Loading plugin: ' + plugin);
  try {
    pluginsLookup[plugin] = require(pp + plugin + '.js');
  } catch (err) {
    console.log('Error loading plugin');
    process.exit(1);
  }
}

// Lookup keyword lookups

var keywords = [
  {
    //Find CDs
    type: 'regex',
    lookup: /^cd$/i,
    plugins: ['ebay', 'youtube', 'guardian']
  },
  {
    //Find CDs 2
    type: 'string',
    lookup: 'Electronics / Photography: A/V Media'.toLowerCase(),
    plugins: ['ebay', 'youtube', 'guardian']
  }
];

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.register('.html', require('jqtpl').express);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
//  app.use(function (req, res, next) { res.render('404', { status: 404, url: req.url })});
//  app.use(function (err, req, res, next) { res.render('500', { status: err.status || 500, error: err});});
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/lookup', function (req, res) {
  if (req.query.barcode)
    res.redirect('/lookup/'+req.query.barcode);
});

app.get('/lookup/:barcode', function (req, res) {
  console.log ('Render with data', res.results);
  if (res.results.length > 0) {
    res.render('lookup', {
      name: res.data.name,
      results: res.results
    });
  } else {
    res.render('404', { status: 404, url: req.url })
  }
});

app.get('/lookup/:barcode/:format', function (req, res) {
  console.log ('Render with format', res.results, req.params.format);
  switch (req.params.format) {
    case 'json':
      res.write(JSON.stringify(res.results));
      res.end();
      break;
    default:
      next();
      break;
  }
});

// Route parameter processors

app.param('barcode', function (req, res, next, id) {

  function search(data, location) {
    getPluginSearchResults(data, location, id, function (results) {
      console.log ('We have search results', results);
      res.results = results;
      next ();
    });
  }

  var redis_key = redis_prefix + id;
  console.log ('Redis key', redis_key);
  var loc_obj = undefined;
  if (req.query.lat && req.query.lon) {
    loc_obj = {
      lat: req.query.lat,
      lon: req.query.lon
    }
    console.log("We have a location", loc_obj);
  }
  redis.exists(redis_key, function (err, exists) {
    if (exists == 1) {
      redis.get(redis_key, function (err, data) {
        data = JSON.parse(data);
        res.data = data;
        console.log ('We have cached data', data);
        search(data, loc_obj, id);
      });
    } else {
      barcodeLookup.lookup(id, '', function (err, data) {
        if (!err) {
          res.data = data;
          console.log ('We have data', data);
          var cache_data = JSON.stringify(data);
          console.log ('Caching data', cache_data);
          redis.set(redis_key, cache_data);
          getPluginSearchResults(data, loc_obj, id, function (results) {
            console.log ('We have search results', results);
            res.results = results;
            next ();
          });
        } else {
          throw Error()
        }
      });
    }
  });

});

function getPluginSearchResults(barcodeObject, location, barcode, callback) {
  console.log ('getPluginSearchResults', barcodeObject);
  getPlugins(barcodeObject.types, function (plugins) {
    console.log ('We have plugins', plugins);
    if (plugins.length == 0) callback([]);
    results = [];
    var count = 0;
    function runCallback() {
      count += 1;
      if (count >= plugins.length)
        callback(results);
    }

    plugins.forEach(function (pluginName, inx, arr) {
      var plugin = pluginsLookup[pluginName].search (barcodeObject.name, function (error, resultArray) {
        results.push({
          plugin: pluginName,
          error: error,
          results: resultArray
        });
        runCallback();
      }, location, barcode);
    });
  }); 
}

function getPlugins(typesArray, callback) {
  console.log('getPlugins', typesArray);
  var plugins = {};
  var count = 0;
  function runCallback() {
    count += 1;
    if (count >= keywords.length) {
      var pluginsReturn = [];
      for (plugin in plugins)
        pluginsReturn.push(plugin);
      callback(pluginsReturn);
    }
  }

  keywords.forEach(function (keyword, inx, arr) {
    for (type in typesArray) {
      type = typesArray[type];
      var matched = false;
      switch (keyword.type) {
        case 'regex':
          if (keyword.lookup.exec(type))
            matched = true;
          break;
        case 'string':
          if (type.toLowerCase().match(keyword.lookup))
            matched = true;
          break;
      }
      if (matched)
        for (i in keyword.plugins)
          plugins[keyword.plugins[i]] = true;
    }
    runCallback(); // Check if we need to run the callback function
  });
}

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
