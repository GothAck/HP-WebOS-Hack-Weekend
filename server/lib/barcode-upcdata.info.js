// Barcode lookup and normalisation for upcdata.info

var http = require ('http');
function lookup(barcode, type, callback)
{
  http.get(
    {
      host: 'upcdata.info',
      port: 80,
      path: '/feed.php?keycode=CB13B10E4E183386&mode=json&comp=no&find='+barcode
    },
    function (response)
      {
        var data = '';
        response.on('data', function (chunk) { data += chunk });
        response.on('end', function ()
        {
          var object = JSON.parse (data);
          var formatted = {
            name: object.product.product,
            type: [object.product.category_text, object.product.description]
          }
          callback (false, formatted);
        });
      });
}

exports.lookup = lookup;
