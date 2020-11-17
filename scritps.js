/**
 * 		
 * 		
 * 		https://inspirit.github.io/jsfeat/
 * 		https://inspirit.github.io/jsfeat/sample_haar_face.html
 * 
 * 		Devido às restrições de CORS dos navegadores, a carga das imagens dos apretrechos somente pode ser dar dentro do mesmo servidor/dominio. Por isto não roda local. 
 * 		Para rodar local é preciso acessar as regras do navegador e desabititar a validação de CORS. 
 */
		'use strict';
			
			var rbCearense = document.getElementById("cearense");
            var rbBruxa = document.getElementById("bruxa");
            var rbNiver = document.getElementById("niver");
            var rbPeralta = document.getElementById("peralta");
            var rbPolicia = document.getElementById("policia");
            var rbPraia = document.getElementById("praia");
            var rbViking = document.getElementById("viking");
            var rbTwd = document.getElementById("twd");
            var rbPirata = document.getElementById("pirata");
			
			const video = document.getElementById('video');
			const canvasRA = document.getElementById('canvasRA');
			const canvas = document.getElementById('screenshot-canvas');
			
			//const constraints = { audio: false, video: { width: 1280, height: 720 }};
			const constraints = { audio: false, video: { width: 1280, height: 720, facingMode: { exact: "environment" }  }};
			
			//video: { } 
			
			const canvasWidth = 640;
			const canvasHeight = 480;
			const tempoClock = 100;
			
			var max_work_size = 160;						
			var scale = Math.min(max_work_size / canvasWidth, max_work_size / canvasHeight);
			var w = (canvasWidth * scale) | 0;
            var h = (canvasHeight * scale) | 0;
                        
            var work_canvas = document.createElement('canvas'); 		//Pulo do gato. Canvas para processamento da haar cascade com a escala de imagens para a qual a rede foi treinada.
            work_canvas.width = w;
            work_canvas.height = h;
            var work_ctx = work_canvas.getContext('2d');
            
            var classifier = jsfeat.haar.frontalface;
            
            var img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
            var edg = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
            var ii_sum = new Int32Array((w + 1) * (h + 1));
            var ii_sqsum = new Int32Array((w + 1) * (h + 1));
            var ii_tilted = new Int32Array((w + 1) * (h + 1));
            var ii_canny = new Int32Array((w + 1) * (h + 1));

			var contextProcess = canvasRA.getContext('2d');
            contextProcess.fillStyle = "rgb(0,255,0)";
            contextProcess.strokeStyle = "rgb(0,255,0)";
			
             function ativaCaptura() {
            	 //para rodar em um servidor dentro do loopback não é necessário muita coisa. Mas para hospedar em um servidor na nuvem precisa habilitar¨o https e apelar para o compability...
            	 try {
                     var attempts = 0;
                     var readyListener = function(event) {
                         findVideoSize();
                     };
                     var findVideoSize = function() {
                         if(video.videoWidth > 0 && video.videoHeight > 0) {
                             video.removeEventListener('loadeddata', readyListener);
                             onDimensionsReady(video.videoWidth, video.videoHeight);
                         } else {
                             if(attempts < 10) {
                                 attempts++;
                                 setTimeout(findVideoSize, 200);
                             } else {
                                 onDimensionsReady(640, 480);
                             }
                         }
                     };
                     var onDimensionsReady = function(width, height) {
                         compatibility.requestAnimationFrame(tick);
                     };
                     video.addEventListener('loadeddata', readyListener);
                     compatibility.getUserMedia({video: true}, function(stream) {
                         if(video.srcObject !== undefined){
                             video.srcObject = stream
                         } else {
                             try {
                                 video.src = compatibility.URL.createObjectURL(stream);
                             } catch (error) {
                                 video.src = stream;
                             }
                         }
                         setTimeout(function() {
                                 video.play();
                             }, 500);
                     }, function (error) {
                         $('#no_rtc').html('<h4>WebRTC not available.</h4>');
                         $('#no_rtc').show();
                     });
                 } catch (error) {
                     $('#no_rtc').html('<h4>Something goes wrong...</h4>');
                     $('#no_rtc').show();
                 }
             }
            	 
             function tick() {
                compatibility.requestAnimationFrame(tick);
				if (video.readyState === video.HAVE_ENOUGH_DATA) {
					try{
						contextProcess.drawImage(video, 0, 0, canvasWidth, canvasHeight);
						
						work_ctx.drawImage(canvasRA, 0, 0, work_canvas.width, work_canvas.height);						//Canvas aonde rodará a haar cascade. Redefinido para a escala de imagens para a qual a rede foi treinada.
	                    var imageData = work_ctx.getImageData(0, 0, work_canvas.width, work_canvas.height);
						
	                    jsfeat.imgproc.grayscale(imageData.data, work_canvas.width, work_canvas.height, img_u8);
	                    
						jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
						
						jsfeat.imgproc.compute_integral_image(img_u8, ii_sum, ii_sqsum, classifier.tilted ? ii_tilted : null);
                    
	                    jsfeat.haar.edges_density = 0.13;	//0.01, 1
                    
	                    /*
	                    Evaluates a Haar cascade classifier at all scales
	                     
	                    int_sum         - integral of the source image
	                    int_sqsum       - squared integral of the source image
	                    int_tilted      - tilted integral of the source image
	                    int_canny_sum   - integral of canny source image or undefined
	                    width           - width of the source image
	                    height          - height of the source image
	                    classifier      - haar cascade classifier
	                    scale_factor    - how much the image size is reduced at each image scale
	                    scale_min       - start scale
	                    rects           - rectangles representing detected object
	                    */
	                    //var rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, options.use_canny? ii_canny : null, img_u8.cols, img_u8.rows, classifier, options.scale_factor, options.min_scale);
	                    var rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, null, img_u8.cols, img_u8.rows, classifier, 1.15,  2);
	                    
	                    rects = jsfeat.haar.group_rectangles(rects, 1);
	                    
	                    //Descomentar para exibir a região detectada..
	                    //draw_faces(contextProcess, rects,  (canvasWidth / img_u8.cols), 1);
						
						setaImagem(contextProcess, rects, (canvasWidth / img_u8.cols), 1);
						
					} catch (e) {
						alert('deu caca aqui óóóóóó = ' + e.toString());
					}
	            }
				setTimeout(processaImagem, tempoClock);				
			}
			
			function draw_faces(ctx, rects, sc, max) {
				try {
					var on = rects.length;
	                //alert(on);                
	                if(on && max) {
	                    jsfeat.math.qsort(rects, 0, on-1, function(a,b){return (b.confidence<a.confidence);})
	                }
	                var n = max || on;
	                n = Math.min(n, on);
	                var r;
	                for(var i = 0; i < n; ++i) {
	                    r = rects[i];
	                    ctx.strokeRect((r.x * sc) | 0, (r.y * sc) | 0, (r.width * sc) | 0 ,(r.height * sc) | 0);
	                }
				} catch (e) {
					alert('deu caca aqui óóóóóó = ' + e.toString());
				}
            }
			
			function setaImagem(ctx, rects, sc, max) {	//Na hora de recuperar as coordenadas lembrar que a imagem foi processada em escada, e deve recalcular o local correspondente na imagem grande.
	            var urlPadrao = 'http://127.0.0.1/simplesRaWeb/imagens/';
	            var imgTemp = document.createElement("img");
	            try{
	            	var valX = 0; 
		            var valY = 0;
		            
	            	var on = rects.length;
	                if(on && max) {
	                    jsfeat.math.qsort(rects, 0, on-1, function(a,b){return (b.confidence<a.confidence);})
	                }
	                var n = max || on;
	                n = Math.min(n, on);
	                var r;
	                if(n > 0){
	                	r = rects[0];
			            valY = (r.x * sc); 
			            valX = (r.y * sc);
	                }
		            var imgW = 0;
		            var imgH = 0;
	                if(rbCearense.checked == true) {
	                	imgTemp.src = urlPadrao + 'cearense.png';
	                	imgW = 350;
	    	            imgH = 150;
	                	valX = valX - 100;
	                	valY = valY - 80;
	                }
	                if(rbBruxa.checked == true) {
	                	imgTemp.src = urlPadrao + 'bruxa.png';
	                	imgW = 450;
	    	            imgH = 180;
	    	            valX = valX - 150;
	                	valY = valY - 130;
	                }
	                if(rbNiver.checked == true) {
	                	imgTemp.src = urlPadrao + 'niver.png';
	                	imgW = 320;
	    	            imgH = 200;
	    	            valX = valX - 170;
	                	valY = valY - 80;
	                }
	                if(rbPeralta.checked == true) {
	                	imgTemp.src = urlPadrao + 'peralta.png';
	                	imgW = 320;
	    	            imgH = 200;
	    	            valX = valX - 170;
	                	valY = valY - 55;
	                }
	                if(rbPolicia.checked == true) {
	                	imgTemp.src = urlPadrao + 'policia.png';
	                	imgW = 320;
	    	            imgH = 200;
	    	            valX = valX - 150;
	                	valY = valY - 60;
	                }
	                if(rbPraia.checked == true) {
	                	imgTemp.src = urlPadrao + 'praia.png';
	                	imgW = 320;
	    	            imgH = 200;
	    	            valX = valX - 150;
	                	valY = valY - 60;
	                }
	                if(rbViking.checked == true) {
	                	imgTemp.src = urlPadrao + 'viking.png';
	                	imgW = 400;
	    	            imgH = 220;
	    	            valX = valX - 180;
	                	valY = valY - 90;
	                }
	                if(rbTwd.checked == true) {
	                	imgTemp.src = urlPadrao + 'twd.png';
	                	imgW = 400;
	    	            imgH = 200;
	    	            valX = valX - 150;
	                	valY = valY - 100;
	                }
	                if(rbPirata.checked == true) {
	                	imgTemp.src = urlPadrao + 'pirata.png';
	                	imgW = 450;
	    	            imgH = 300;
	    	            valX = valX - 150;
	                	valY = valY - 130;
	                }
	                if(valX < 0){
                		valX = 0;
                	}
                	if(valY < 0){
                		valY = 0;
                	}
	                ctx.drawImage(imgTemp,  valY, valX, imgW, imgH);
	            } catch (e) {
	            	alert('deu caca aqui óóóóóó = ' + e.toString());
	            }
			}

            function capturaImagem(){
            	var context = canvas.getContext('2d');
				context.drawImage(canvasRA, 0, 0, canvasWidth, canvasHeight);
            }
            
            function downloadImage(){
            	var link = document.createElement('a');
            	  link.download = 'MinhaFotoFelizdeChapeu.png';
            	  link.href = document.getElementById('screenshot-canvas').toDataURL();
            	  link.click();
            }
