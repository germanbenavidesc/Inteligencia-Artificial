
let zamek = false;
let img;
let open;
var X,Y;
let dousky = 0;
//La dirección de nuestro modelo en Google

let URL = "https://teachablemachine.withgoogle.com/models/Wjwde9Rut/";
// 
let model, kamera, ctx, popiskyTrid, vsechnyTridy, song;



async function setup() {
  // Descargue y cargue el modelo de red neuronal en la memoria
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmPose.load(modelURL, metadataURL);
  vsechnyTridy = model.getTotalClasses();
  //Resolución de la cámara
  kamera = new tmPose.Webcam(640, 480, true);
  await kamera.setup();
  await kamera.play();


  //Ejecute un bucle infinito
  window.requestAnimationFrame(loop);

  // Vinculando la cámara a la etiqueta <canvas> en el código HTML,
  // en el que se dibujará la imagen
  const canvas = document.getElementById("kamera");
  canvas.width = 640;
  canvas.height = 480;
  ctx = canvas.getContext("2d");
  var s = getComputedStyle(canvas);
  var w = s.width;
  var h = s.height;
console.log(w);
  X = Math.floor(w.split("px")[0]);
  Y = Math.floor(h.split("px")[0]);
console.log(X);

  
  // Crear una etiqueta <div> para clases individuales (nuestro modelo usa dos: el dock y el fondo)
  popiskyTrid = document.getElementById("popisky");
  for (let i = 0; i < vsechnyTridy; i++) {
    popiskyTrid.appendChild(document.createElement("div"));
  }

}

//
async function loop(ts) {
  //Sejmi snimek z kamery
  kamera.update();
  // Llame a la función de detección que vende la imagen a la red neuronal
  await detekce();
  // Llame a esta función de nuevo
  window.requestAnimationFrame(loop);

}

// La función de detección realiza el análisis de la imagen de la propia cámara mediante una red neuronal
async function detekce() {
  // Encuentra el esqueleto humano en la imagen de la cámara y guárdalo en el objeto 'pose'
  const {pose,posenetOutput
  } = await model.estimatePose(kamera.canvas);
  // Busque nuestro gesto en la imagen con una mano levantada c
  // y guarda los resultados en el campo de predicción
  const predikce = await model.predict(posenetOutput);
   document.getElementById('music').play();
   //document.getElementById("image").src = "jump0.png";


  // Revise las clases individuales y enumere sus nombres y probabilidades en la página.
  for (let i = 0; i < vsechnyTridy; i++) {
    //popiskyTrid.childNodes[i].innerHTML = predikce[i].className + ": " + predikce[i].probability.toFixed(2);
    popiskyTrid.childNodes[i].innerHTML = "Derecha: " + predikce[i].probability.toFixed(2);
    // Si la clase actual tiene el nombre doskek
    if (predikce[i].className == "Class 1") {
        popiskyTrid.childNodes[i].innerHTML = "Izquierda: " + predikce[i].probability.toFixed(2);
      //Si esta clase también tiene una probabilidad del 80% o más
      // En este punto, es muy probable que nuestro gesto de la mano sea hacia arriba
      if (predikce[i].probability > 0.8) {
        //
        if (!zamek) {
          // Suba el contador
          dousky++;
          // Zamkni zamek
          zamek = true;
          // enumere
          document.getElementById("pocitadlo").innerHTML = "REPETICIONES : " + dousky;

          document.getElementById("myMeter").value = dousky;
          if (dousky == 10) {
            document.getElementById('music').pause();
            document.getElementById("aplause").play();
            dousky = 0;
            document.getElementById('music').play();

          }
        }
      }
      // Si la probabilidad de una clase de caídas cae por debajo del 10%,
      // sobre el final del gesto, la mano cae sobre la mesa,
      // así que vuelvo a desbloquear el bloqueo de gestos
      else if (predikce[i].probability < 0.1) {
        zamek = false;
      }
    }
  }

//Dibuja un esqueleto humano en la imagen de la cámara
  nakresliPostavu(pose);
}

// Funciones para dibujar el esqueleto humano.
function nakresliPostavu(postava) {
  // Si la cámara está funcionando y tengo acceso a su pantalla
  if (kamera.canvas) {
    // Haz un dibujo de la cámara en la página
    ctx.drawImage(kamera.canvas, 0, 0);
    // Si la neurona reconociera el esqueleto humano
    if (postava) {
      // Dibuja nodos en la imagen si tienen una probabilidad de al menos el 50%
      tmPose.drawKeypoints(postava.keypoints, 0.5, ctx);
      //Dibuja las líneas de conexión del esqueleto en la imagen si tienen una probabilidad de al menos el 50%
      tmPose.drawSkeleton(postava.keypoints, 0.5, ctx);
    }
  }
}
