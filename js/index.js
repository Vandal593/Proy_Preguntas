// Definir una variable para almacenar el nivel actual
let nivelActual = 1;

let puntaje = 0;

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

// Cargar información del juego al cargar la página
window.onload = function () {
  // Obtener y parsear la base de preguntas
  base_preguntas = readText("base-preguntas.json");
  interprete_bp = JSON.parse(base_preguntas);

  const enCuestionario = localStorage.getItem('enCuestionario');
  if (enCuestionario === 'true') {
    mostrarCuestionario();
  } else {
    // Código existente para iniciar el juego normalmente
    const categoriaGuardada = localStorage.getItem('categoriaSeleccionada');
    if (categoriaGuardada) {
      iniciarJuego(categoriaGuardada);
    }
  }
};

function iniciarJuego(categoria) {
  // Guardar la categoría en el almacenamiento local
  localStorage.setItem('categoriaSeleccionada', categoria);

  // Oculta la pantalla de inicio
  document.getElementById('inicio').style.display = 'none';

  // Muestra la pantalla de juego
  document.getElementById('juego').style.display = 'block';

  // Actualiza el nombre de la categoría seleccionada y el nivel en el centro
  actualizarInfoJuego();

  // Asegúrate de que los botones de avanzar y retroceder estén visibles
  document.getElementById('btnAvanzar').style.display = 'inline';
  document.getElementById('btnRetroceder').style.display = 'inline';
}

// Función para mostrar el cuestionario
function mostrarCuestionario() {
  localStorage.setItem('enCuestionario', 'true');
  const categoria = localStorage.getItem('categoriaSeleccionada');

  // Ocultar la interfaz del juego y mostrar la del cuestionario
  document.getElementById('inicio').style.display = 'none';
  document.getElementById('juego').style.display = 'none';
  document.getElementById('cuestionario').style.display = 'block';

  // Ocultar todos los contenedores de cuestionario
  const contenedores = document.querySelectorAll('#Animales, #Familia, #Colores, #Frutas');
  contenedores.forEach(contenedor => contenedor.style.display = 'none');

  // Mostrar solo el contenedor de cuestionario de la categoría seleccionada
  const contenedorCategoria = document.getElementById(categoria);
  if (contenedorCategoria) {
    contenedorCategoria.style.display = 'block';
  } else {
    console.error(`Contenedor para la categoría ${categoria} no encontrado.`);
  }

  document.getElementById('categoriaCuestionario').innerText = `${categoria} - Cuestionario`;

  reorganizar();
}

function reorganizar() {
  // Selecciona el contenedor activo de la categoría
  const contenedores = document.querySelectorAll('.categoria-contenedor');
  const categoriaActiva = Array.from(contenedores).find(contenedor => contenedor.style.display === 'block' || getComputedStyle(contenedor).display === 'block');

  if (!categoriaActiva) return;

  const imagenes = Array.from(categoriaActiva.querySelectorAll('.imagenes img'));
  const palabras = Array.from(categoriaActiva.querySelectorAll('.palabras .palabra'));

  // Desordena los arrays
  shuffleArray(imagenes);
  shuffleArray(palabras);

  // Vacía los contenedores y los rellena con los elementos desordenados
  const contenedorImagenes = categoriaActiva.querySelector('.imagenes');
  const contenedorPalabras = categoriaActiva.querySelector('.palabras');

  contenedorImagenes.innerHTML = '';
  contenedorPalabras.innerHTML = '';

  imagenes.forEach(img => contenedorImagenes.appendChild(img));
  palabras.forEach(palabra => contenedorPalabras.appendChild(palabra));
}

// Asigna eventos de arrastrar a las palabras
document.querySelectorAll('.palabra').forEach(palabra => {
  palabra.setAttribute('draggable', true);
  palabra.addEventListener('dragstart', function (event) {
    event.dataTransfer.setData('text', event.target.id); // Usa el ID de la palabra como dato transferido
  });
});

// Habilita la soltura sobre las imágenes y verifica la combinación
document.querySelectorAll('.dropzone').forEach(imagen => {
  imagen.setAttribute('draggable', false);
  imagen.addEventListener('dragover', e => e.preventDefault());

  imagen.addEventListener('drop', function (event) {
    event.preventDefault();
    const idPalabra = event.dataTransfer.getData('text');
    const palabraCorrecta = this.getAttribute('data-palabra-correcta');
    const elementoPalabra = document.getElementById(idPalabra);

    if (idPalabra === palabraCorrecta) {
      console.log('Correcto!');
      puntaje++;
      document.getElementById('puntaje').textContent = `Puntuación: ${puntaje}`;
      elementoPalabra.style.backgroundColor = 'lightgreen';
      this.style.border = '3px solid green';
      elementoPalabra.setAttribute('draggable', false); // Deshabilita arrastrar para la palabra correcta
    } else {
      console.log('Incorrecto');
      elementoPalabra.style.backgroundColor = 'red';
      this.style.border = '3px solid red';
      elementoPalabra.setAttribute('draggable', false); // Deshabilita arrastrar para la palabra correcta
    }
  });
});

function reiniciarCuestionario() {
  puntaje = 0;
  document.getElementById('puntaje').textContent = `Puntuación: 0`;
  // Restablece el estado visual de las palabras e imágenes
  document.querySelectorAll('.palabra').forEach(palabra => {
    palabra.style.backgroundColor = ''; // Limpia el color de fondo
    palabra.setAttribute('draggable', true); // Vuelve a hacerlas arrastrables
    // Vuelve a asignar el evento dragstart si fue removido previamente
    palabra.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text', event.target.id);
    });
  });
  document.querySelectorAll('.dropzone').forEach(imagen => {
    imagen.style.border = ''; // Restablece el estilo del borde
  });
  reorganizar();
  // Aquí puedes añadir más lógica para restablecer el juego a su estado inicial
}

// Función para escoger palabras aleatorias
function escogerPalabrasAleatorias(categoria, nivel) {
  console.log(categoria)
  const categoriaActual = interprete_bp.find(item => item.categoria === categoria);

  if (!categoriaActual || !categoriaActual.niveles) {
    console.error(`Categoría ${categoria} no encontrada.`);
    return [];
  }

  const palabrasNivelesAnteriores = [];
  for (let i = 1; i < nivel; i++) {
    const nivelAnterior = categoriaActual.niveles.find(item => item.nivel === i);
    if (nivelAnterior && nivelAnterior.palabras) {
      palabrasNivelesAnteriores.push(...nivelAnterior.palabras);
    }
  }

  const nivelActual = categoriaActual.niveles.find(item => item.nivel === nivel);

  if (!nivelActual || !nivelActual.palabras) {
    console.error(`Nivel ${nivel} no encontrado para la categoría ${categoria}.`);
    return [];
  }

  const palabrasAleatorias = nivelActual.palabras.concat(palabrasNivelesAnteriores); // Copia el array de palabras
  shuffleArray(palabrasAleatorias); // Función para desordenar el array

  return palabrasAleatorias;
}

function actualizarInfoJuego() {
  // Recuperar la categoría y el nivel actual del almacenamiento local
  const categoria = localStorage.getItem('categoriaSeleccionada');
  nivelActual = parseInt(localStorage.getItem('nivelActual')) || 1;

  // Obtener palabras para el nivel actual y mostrarlas en las tarjetas
  const palabras = escogerPalabrasAleatorias(categoria, nivelActual);
  mostrarPalabrasEnTarjetas(palabras);

  // Actualizar el nombre de la categoría y el nivel en el centro
  document.getElementById('categoriaSeleccionada').innerText = `${categoria} - Nivel ${nivelActual}`;
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

function avanzarNivel() {

  if (nivelActual < 5) {
    // Incrementar el nivel actual
    nivelActual++;
    localStorage.setItem('nivelActual', nivelActual);
    console.log(nivelActual);
    // Actualizar la información del juego
    actualizarInfoJuego();
  } else if (nivelActual === 5) {
    console.log("entra aqui?" + nivelActual);
    localStorage.setItem('nivelActual', nivelActual);
    // Llamar a mostrarCuestionario cuando el jugador alcanza el nivel 6 (después de completar el nivel 5)
    mostrarCuestionario();
  }
  console.log("esto a ver cual va: " + nivelActual);
}

function retrocederNivel() {
  if (nivelActual > 1) {
    // Asegurarse de que el nivel no sea menor que 1
    nivelActual--;
    localStorage.setItem('nivelActual', nivelActual);
    // Actualizar la información del juego
    actualizarInfoJuego();
  }
}

// Función para calcular el puntaje (esto es un esquema simple, deberás adaptarlo según tu lógica de cálculo)
function calcularPuntaje() {
  let puntaje = 0;
  // Calcula el puntaje basado en las respuestas correctas
  // Incrementa el puntaje según las respuestas correctas, e.g., puntaje += 10 por cada respuesta correcta

  alert(`Tu puntaje es: ${puntaje}`);
  // Mostrar botón para regresar al menú
  document.getElementById('btnRegresarMenu').style.display = 'block';
  localStorage.removeItem('enCuestionario');
}

function regresarAlInicio() {
  // Eliminar la categoría seleccionada del almacenamiento local
  localStorage.removeItem('categoriaSeleccionada');
  localStorage.removeItem('nivelActual');
  localStorage.removeItem('enCuestionario');

  // Muestra la pantalla de inicio
  document.getElementById('inicio').style.display = 'block';

  // Oculta la pantalla de juego
  document.getElementById('juego').style.display = 'none';

  //Oculta la pantalla del cuestionario
  document.getElementById('cuestionario').style.display = 'none';
}

// Ejemplo de una función para desordenar un array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}