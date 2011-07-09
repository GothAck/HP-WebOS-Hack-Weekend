
/**
 * Module dependencies.
 */

var express = require('express');
var barcodeLookup = require('./lib/barcode-upcdata.info.js');

// Lookup plugin structure
var pp = './lib/lookup-';
var pluginList = ['ebay'];

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

app.get('/lookup/:barcode', function (req, res) {
  console.log (res.data);
  res.render('lookup', {
    name: res.data.name,
  });
});

// Route parameter processors

app.param('barcode', function (req, res, next, id) {
  barcodeLookup.lookup(id, '', function (err, data) {
    if (!err) {
      res.data = data;
      next();
    } else {
      throw Error()
    }
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
