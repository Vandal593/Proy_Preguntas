let datosConfiguracion;

var sonidoAmbiente = new Audio('audio/fondo.mp3');

function readText(ruta_local) {
  var texto = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", ruta_local, false);
  xmlhttp.send();
  if (xmlhttp.status == 200) {
    texto = xmlhttp.responseText;
  }
  return texto;
}

function lanzarConfeti() {
  for (let i = 0; i < 100; i++) {
      crearConfeti();
  }
}

function crearConfeti() {
  const confeti = document.createElement('div');
  confeti.classList.add('confeti');
  document.body.appendChild(confeti);

  // Configuración inicial
  confeti.style.left = `${Math.random() * window.innerWidth}px`;
  confeti.style.top = `0px`;
  confeti.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

  // Animación
  let intervalo = setInterval(() => {
      if (parseInt(confeti.style.top) > window.innerHeight) {
          clearInterval(intervalo);
          confeti.remove();
      } else {
          confeti.style.top = `${parseInt(confeti.style.top) + 4}px`;
      }
  }, 10 + Math.random() * 10); // Velocidad de caída
}


function reproducirSonido(sonido) {
  var clone = sonido.cloneNode();
  clone.play();
}

function unmuteAudio() {
  var icono = document.getElementById('iconoAudio');

  if (sonidoAmbiente.muted) {
    sonidoAmbiente.muted = false;
    sonidoAmbiente.loop = true;
    // Intenta reproducir el audio y maneja posibles errores
    sonidoAmbiente.play().catch(error => console.error("Error al intentar reproducir el audio:", error));
    icono.textContent = '🔊'; // Icono de sonido activo
  } else {
    sonidoAmbiente.muted = true;
    icono.textContent = '🔇'; // Icono de sonido inactivo
  }
}

function mostrarPalabrasEnTarjetas(palabras) {
  // Lógica para mostrar las palabras en tarjetas (puedes adaptar esto según tu diseño)
  const tarjetasContainer = document.getElementById('tarjetasContainer');
  tarjetasContainer.innerHTML = '';

  palabras.forEach((palabra, index) => {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
    tarjeta.innerText = palabra;

    tarjetasContainer.appendChild(tarjeta);
  });
}

// Ejemplo de una función para desordenar un array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function gestionarBotonesFooter(contexto, categoria) {
  // Primero, ocultamos todos los botones para empezar de cero
  const todosLosBotones = ['btnRegresarInicio', 'btnRetroceder', 'btnAvanzar', 'btnReintentar', 'btnRegresarCategoria'];
  todosLosBotones.forEach(id => document.getElementById(id).style.display = 'none');
  // Ahora, basado en el contexto, decidimos qué botones mostrar
  switch (contexto) {
    case 'inicio':
      // En el inicio, tal vez queremos mostrar solo el botón de "Regresar al Menú"
      document.getElementById('btnRegresarInicio').style.display = 'block';
      break;
    case 'cuestionario':
      // En el cuestionario, mostramos "Reintentar" y "Regresar al Menú" o "Regresar a las Categorías"
      document.getElementById('btnReintentar').style.display = 'block';
      document.getElementById('btnRegresarCategoria').style.display = 'block';
      break;
    case 'juego':
      // Durante el juego, podríamos querer mostrar "Avanzar", "Retroceder" y "Regresar al Menú"
      document.getElementById('btnAvanzar').style.display = 'block';
      document.getElementById('btnRetroceder').style.display = 'block';
      document.getElementById('btnRegresarCategoria').style.display = 'block';
      break;
    // Agrega más casos según sea necesario
  }

  // Ajuste adicional para manejar específicamente 'nivel2'
  if (categoria === 'Nivel2' || categoria === 'Nivel3' || categoria === 'Nivel4' || categoria === 'Nivel5') {
    document.getElementById('btnRegresarCategoria').style.display = 'none';
    document.getElementById('btnRegresarInicio').style.display = 'block';
    // Aquí puedes agregar o modificar la visibilidad de botones específicamente para 'nivel2'
    // Por ejemplo, mostrar u ocultar botones adicionales que sean relevantes solo para esta categoría
  }
}
