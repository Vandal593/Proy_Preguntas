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

function reproducirSonido(sonido) {
  var clone = sonido.cloneNode();
  clone.play();
}

function unmuteAudio() {
  var audio = document.getElementById('audioAmbiente');
  botonaudio = document.getElementById('botonAudio');
  if (audio.muted) {
    audio.muted = false;
    audio.play().catch(error => console.error("Error al intentar reproducir el audio:", error));
    botonAudio.textContent = "Mutear audio"; // Cambia el texto a 'Mutear audio'
  } else {
    audio.muted = true;
    botonAudio.textContent = "Activar Sonido"; // Cambia el texto a 'Activar Sonido'
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

function gestionarBotonesFooter(contexto) {
  // Primero, ocultamos todos los botones para empezar de cero
  const todosLosBotones = ['btnRegresarInicio', 'btnRetroceder', 'btnAvanzar', 'btnReintentar', 'btnRegresarCategoria'];
  todosLosBotones.forEach(id => document.getElementById(id).style.display = 'none');

  // Ahora, basado en el contexto, decidimos qué botones mostrar
  switch(contexto) {
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
}