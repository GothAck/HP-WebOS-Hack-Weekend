	var passLine = null;

	var gCtx = null;
	var gCanvas = null;

	var imageData = null;
	var ii=0;
	var jj=0;
	var c=0;

	function pageLoad() { 
		initCanvas(320,240);
	} 


	function initCanvas(ww,hh)
	{
		gCanvas = document.getElementById("canvas");
		var w = ww;
		var h = hh;
		gCanvas.style.width = w + "px";
		gCanvas.style.height = h + "px";
		gCanvas.width = w;
		gCanvas.height = h;
		gCtx = gCanvas.getContext("2d");
		gCtx.clearRect(0, 0, w, h);
		imageData = gCtx.getImageData( 0,0,320,240);
		//console.log('!');
	}

	passLine = function (stringPixels) { 
		//a = (intVal >> 24) & 0xff;
		//console.log(stringPixels);
		var coll = stringPixels.split("-");
	
		for(var i=0;i<320;i++) { 
			var intVal = parseInt(coll[i]);
			r = (intVal >> 16) & 0xff;
			g = (intVal >> 8) & 0xff;
			b = (intVal ) & 0xff;
			imageData.data[c+0]=r;
			imageData.data[c+1]=g;
			imageData.data[c+2]=b;
			imageData.data[c+3]=255;
			c+=4;
		} 

		if(c>=320*240*4) { 
			c=0;
      			gCtx.putImageData(imageData, 0,0);
		} 
 	} 

        function captureToCanvas() {
		flash = document.getElementById("embedflash");
		flash.ccCapture();
        }

