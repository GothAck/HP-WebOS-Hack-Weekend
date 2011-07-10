import flash.external.ExternalInterface;
import flash.display.BitmapData;
import flash.geom.Matrix;

class camcanvas {

  public static function exportCapture(input:String):String {
    ExternalInterface.call("console.log", "snap");
    snap();
    return input;
  }
  
  public static function main() {   
    ExternalInterface.call("console.log", "1");
    var cam = Camera.get();
    ExternalInterface.call("console.log", cam);
    cam.setMode(640,480, 15);
    ExternalInterface.call("console.log", cam);
    _root.attachMovie("ObjetVideo", "webcamVideo", 1);
    ExternalInterface.call("console.log", _root.webcamVideo._x);
    ExternalInterface.call("console.log", "1.1");
    _root.webcamVideo.attachVideo(cam);
    
    _root.webcamVideo._x = 0;
    ExternalInterface.call("console.log", _root.webcamVideo._x);
    _root.refFunc = exportCapture;
    ExternalInterface.addCallback("ccCapture", _root, _root.refFunc);
    ExternalInterface.call("console.log", "2");
  }
  
  public static function snap() {

    var snapshot:flash.display.BitmapData = new flash.display.BitmapData(_root.webcamVideo._width,_root.webcamVideo.height,true);
    snapshot.draw(_root.webcamVideo);
    var string="";
    for(var j=0;j<480;j++) { 
      var currLine = "";
      for(var i=0;i<640;i++) { 
        currLine +=  snapshot.getPixel(i,j)+"-";        
      }
      ExternalInterface.call("console.log", currLine)
      ExternalInterface.call("passLine", currLine)
    } 
  }
}
