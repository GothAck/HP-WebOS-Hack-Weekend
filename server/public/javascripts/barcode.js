
//------------------------------------------------------------------------------
        function read_barcode(canvas) {
            var c = canvas;
            
            // Find and return the most frequently occouring value in an array
            function most_frequent_value(list) {
                list = list.sort();
                var max_value     = null;
                var max_count     = 0;
                var current_value = null;
                var current_count = 0;
                for (var i=0 ; i < numbers.length ; i++) {
                    if (list[i]==current_value) {
                        current_count++;
                    }
                    else {
                        if (current_count > max_count) {
                            max_count = current_count;
                            max_value = current_value;
                        }
                        current_value = list[i];
                        current_count = 0;
                    }
                }
                return current_value;
            }
            
            function average_value(list) {
                var total = 0.0;
                for (var i=0 ; i<list.size ; i++) {
                    total += list[i];
                }
                return total / list.size;
            }
            
            // pixeldata is a line of pixels from an image
            function read_number_from_pixeldata(pixeldata) {
                // pixeldata is in the format linear array as [r,g,b,a,r,g,b,a .. repeat]
                
                // Convert to greyscale
                //----------------------------------------------------------
                // greyscale pixel data by averaging r,g,b and ignoring alpha
                var pixeldata_grey = [pixeldata.length/4]
                for (i=0 ; i < pixeldata.length ; i+=4) {
                    // grey             = (          r              g                b   ) / 3
                    pixeldata_grey[i/4] = (pixeldata[i] + pixeldata[i+1] + pixeldata[i+2]) / 3;
                }
                
                // Normalize pixel data - based on the min and max - convert into floats between 0.0 and 1.0
                // ---------------------------------------------------------
                // now we have a list of greyscale values
                // find the max and min
                var min=255;
                var max=0;
                for (i=0 ; i < pixeldata_grey.length ; i++) {
                    if (pixeldata_grey[i] < min) {min = pixeldata_grey[i];}
                    if (pixeldata_grey[i] > max) {max = pixeldata_grey[i];}
                }
                // recreate the array with each pixel being 0.0 to 1.0 of floats
                pixeldata = [pixeldata_grey.length];
                var range = max - min;
                for (i=0 ; i < pixeldata_grey.length ; i++) {
                    pixeldata[i] = (pixeldata_grey[i]-min) / range;
                }
                
                // Edge detection
                //----------------------------------------------------------
                // Start in the middle and work left and right
                // find the longest string of consecutive values in a row (based on threshold)
                //
                // with run_max and run_start_pos we can assertain the edge
                // return the run_max_start to slice array
                function edge_detection(pixeldata, direction) {
                    var direction_function = null;
                    if (direction>0) {direction_function = function(i_val){return i_val<pixeldata.length;}}
                    if (direction<0) {direction_function = function(i_val){return i_val>0               ;}}
                    
                    var edge_threshhold = 0.2;
                    
                    var run_length    = 0; // Run is a term for a set of ajacent pixels with the same value
                    var run_value     = 0;
                    
                    var run_start     = pixeldata.length/2;
                    var run_max       = 0;
                    var run_max_start = 0;
                    for (var i = run_start ; direction_function(i) ; i+=direction) {
                        // If pixel is within threashhold
                        var diff = Math.abs(pixeldata[i]-run_value);
                        if (diff < edge_threshhold) {
                            run_length += 1;                   //   increment the run length
                        }
                        // Else next pixel is outside of threshold
                        else {                                 // Next pixel is not in threshhold
                            if (run_length > run_max) {        // Record the end of the run
                                run_max       = run_length;
                                run_max_start = run_start;
                            }
                            run_start   = i;                   // record the start of the run
                            run_value   = pixeldata[i];        // record the next comparison value as this value // AllanC - humm ... maybe this isnt enough?
                            run_length  = 0;                   // reset the number of matchs so far
                        }
                    }
                    if (run_length > run_max) {        // had to duplicte this at the end, because the last one should always be checked and recorded if it's the longest
                        run_max       = run_length;
                        run_max_start = run_start;
                    }
                    
                    return run_max_start;
                }
                
                var index_start = edge_detection(pixeldata, -1);
                var index_end   = edge_detection(pixeldata,  1);
                
                //console.log(index_start);
                //console.log(index_end  );
                //c.fillStyle = "rgb(255,0,0)";
                //c.fillRect(index_start,0,1,100);
                //c.fillRect(index_end  ,0,1,100);
                
                // Remove the edges
                //   by sending seekers out from the center and finding the start pos of the longest run of the same colour
                pixeldata = pixeldata.slice(
                                index_start,
                                index_end
                            );
                
                // Get Bit size
                var bit_size = pixeldata.length / 95;
                console.log(bit_size);
                
                // Take a descreate bit item location and attempt to recover the binary value at that point using aliasing
                function get_bit(descreate_index) {
                    index  = descreate_index * bit_size;
                    //offset = index - Math.round(index);
                    
                    c.fillStyle = "rgb(255,0,0)";
                    c.fillRect(index_start+index,0,1,100);
                    
                    var count = 0;
                    var total = 0;
                    for (var i=index ; i<index+bit_size ; i++) {
                        total += pixeldata[Math.round(i)];
                        count++;
                    }
                    var r = Math.abs(Math.round(total / count)-1);
                    //console.log('total:'+total+' count:'+count+' return:'+r);
                    return r;
                }
                
                
                // Generate diget bit patterns
                // EAN-13
                // http://en.wikipedia.org/wiki/EAN-13
                bit_patterns = {
                    l: {
                        '0001101':0, // 0
                        '0011001':1, // 1
                        '0010011':2, // 2
                        '0111101':3, // 3
                        '0100011':4, // 4
                        '0110001':5, // 5
                        '0101111':6, // 6
                        '0111011':7, // 7
                        '0110111':8, // 8
                        '0001011':9, // 9
                    },
                    g: {},
                    r: {}
                }
                
                // make r codes
                function string_invert(s) {
                    s_inverted = ''
                    for (var i=0; i<s.length ; i++) {
                        s_char = s.substring(i, i+1);
                        if      (s_char=='1') {s_char='0';}
                        else if (s_char=='0') {s_char='1';}
                        s_inverted += s_char;
                    }
                    return s_inverted;
                }
                for (pattern in bit_patterns.l) {
                    var inv_pattern = string_invert(pattern);
                    bit_patterns.r[inv_pattern] = bit_patterns.l[pattern];
                }
                
                // make g codes
                function string_reverse(s) {
                    var s_reversed = '';
                    for (var i=s.length ; i>0 ; i--) { 
                        s_reversed += s.substring(i-1, i);
                    }
                    return s_reversed;
                }
                for (pattern in bit_patterns.r) {
                    var rev_pattern = string_reverse(pattern);
                    bit_patterns.g[rev_pattern] = bit_patterns.r[pattern];
                }
                
                var head_size   = 3;
                var mid_size    = 5;
                var foot_size   = 3;
                var didget_size = 7; // bits per diget
                var head_didgets = 6;
                var foot_didgets = 6;
                function get_didget(index) {
                    if (index <= 5) {start_bit = head_size + index*didget_size;}
                    if (index  > 5) {start_bit = head_size + index*didget_size + mid_size;}
                    var didget = ''
                    for (var i=0 ; i<didget_size ; i++) {
                        didget += get_bit(start_bit + i);
                    }
                    return didget;
                }
                
                function lookup_didget(didget_string) {
                    if (typeof bit_patterns.l[didget_string] !== 'undefined') {
                        return {type:'l',val:bit_patterns.l[didget_string]}
                    }
                    if (typeof bit_patterns.g[didget_string] !== 'undefined') {
                        return {type:'g',val:bit_patterns.g[didget_string]}
                    }
                    if (typeof bit_patterns.r[didget_string] !== 'undefined') {
                        return {type:'r',val:bit_patterns.r[didget_string]}
                    }
                    return {type:'',val:''}
                }
                
                //console.log(get_didget(7));
                for (var i=0 ; i<12 ; i++) {
                    console.log(lookup_didget(get_didget(i)));
                }
                
                return 0;
            }
            
            /**
            var line_spacing = 10; // Rather than reading EVERY line (too much processing), take one line every line_spacing
            
            
            // Get horizontal lines of the canvas can regular intivals
            // The algoithum will be run on multiple horizontal lines
            // The most commonly occouring number is the one to validate
            var numbers = Array();
            for (y=0 ; y<=c.canvas.height ; y+=line_spacing) {
                //numbers.push(read_number_from_pixeldata( pixeldata.slice(y*width*4, y*width+1*4) ));
                var number = read_number_from_pixeldata( c.getImageData(0, y, c.canvas.width, 1).data );
                numbers.push(number);
                //console.log(number);
            }
            // find most common
            var number = most_frequent_value(numbers);
            */
            
            var number = read_number_from_pixeldata( c.getImageData(0, 100, c.canvas.width, 1).data );
            
            console.log(number);
            
            return number
        }
    

//------------------------------------------------------------------------------

    
        function draw() {
            var canvas = document.getElementById("canvas");
            if (canvas.getContext) {
                var c = canvas.getContext("2d");

    
                
                var i = new Image();
                i.onload = function() {
                    c.drawImage(i, 0, 0);                    
                    
                }
                i.src = "barcode_test_1.png";

            /**
                                                 
            */
                
                
                
                
                
                
                //EAN-13
                
                //UPC-A
                
                // Draw the ImageData at the given (x,y) coordinates.
                //c.putImageData(imgd, 0, 0);
                
            }
        }
        
        function read() {
            var canvas = document.getElementById("canvas");
            if (canvas.getContext) {
                var c = canvas.getContext("2d");
                read_barcode(c);

                /*
                c.fillStyle = "rgb(40,0,0)";
                c.fillRect (20, 20, 65, 60);
                c.fillStyle = "rgba(0, 0, 160, 0.5)";
                c.fillRect (40, 40, 65, 60);
                

                var imgd = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
                var pix = imgd.data;
                
                // Loop over each pixel and invert the color.
                for (var i = 0, n = pix.length; i < n; i += 4) {
                    pix[i  ] = 255 - pix[i  ]; // red
                    pix[i+1] = 255 - pix[i+1]; // green
                    pix[i+2] = 255 - pix[i+2]; // blue
                    // i+3 is alpha (the fourth element)
                }
            
                // Draw the ImageData at the given (x,y) coordinates.
                c.putImageData(imgd, 0, 0);
                */
                
                
                //    c.getImageData(0, 0, c.canvas.width, c.canvas.height).data,
                //    c.canvas.width,
                //    c.canvas.height
                //);
                


            }
        }