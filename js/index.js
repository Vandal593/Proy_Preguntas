// Definir una variable para almacenar el nivel actual
let faseActual = 1;
let puntaje = 0;

var sonidoCorrecto = new Audio('audio/correcto.mp3'); // Reemplaza con la ruta de tu archivo de sonido correcto
var sonidoIncorrecto = new Audio('audio/incorrecto.mp3'); // Reemplaza con la ruta de tu archivo de sonido incorrecto
var sonidoFinalizado = new Audio('audio/finalizado.mp3');

// Cargar información del juego al cargar la página
window.onload = function () {
  // Obtener y parsear la base de preguntas
  base_preguntas = readText("base-preguntas.json");
  interprete_bp = JSON.parse(base_preguntas);

  const enCuestionario = localStorage.getItem('enCuestionario');
  const categoriaGuardada = localStorage.getItem('categoriaSeleccionada');
  // Determina si el juego está actualmente en el cuestionario o en un nivel específico
  if (enCuestionario === 'true') {
    mostrarCuestionario();
  } else if (categoriaGuardada === 'Nivel5') {
    // Si estamos en el nivel 5, iniciar ese nivel específico
    iniciarNivel5(categoriaGuardada); // Asume que esta función está definida para manejar el nivel 5
  } else if (categoriaGuardada) {
    // Iniciar el juego normalmente para cualquier otra categoría guardada
    iniciarJuego(categoriaGuardada);
  }
};

function iniciarNivel(nivel) {
  localStorage.setItem('nivelActual', nivel);
  document.getElementById('niveles').style.display = 'none'; // Oculta la pantalla de niveles
  document.getElementById('inicio').style.display = 'block'; // Muestra la pantalla de inicio
  gestionarBotonesFooter('inicio', null);
  // Aquí puedes agregar lógica adicional si necesitas cargar dinámicamente las categorías
}

// Función para iniciar el nivel 5
function iniciarNivel5(categoria) {
  localStorage.setItem('categoriaSeleccionada', categoria);
  document.getElementById('niveles').style.display = 'none'; // Oculta la pantalla de niveles
  document.getElementById('inicio').style.display = 'none';
  document.getElementById('juego').style.display = 'none';
  document.getElementById('juego-nivel5').style.display = 'block';
  gestionarBotonesFooter('juego', categoria);
  // Asume que 'interprete_bp' tiene una propiedad que es un array para el nivel 5
  let nivel5Data = interprete_bp.find(categoria => categoria.categoria === 'Nivel5');
  if (!nivel5Data) {
    console.error('Datos del Nivel 5 no encontrados en el JSON.');
    return;
  }
  // Asume que tienes una función 'iniciarFaseNivel5' que inicia la fase del nivel 5
  faseActual = parseInt(localStorage.getItem('faseActual')) || 1;

  iniciarFaseNivel5(faseActual, nivel5Data);
}

function iniciarJuego(categoria) {
  // Guardar la categoría en el almacenamiento local
  localStorage.setItem('categoriaSeleccionada', categoria);
  // Oculta la pantalla de niveles
  document.getElementById('niveles').style.display = 'none'; // Oculta la pantalla de niveles
  document.getElementById('inicio').style.display = 'none';
  // Muestra la pantalla de juego
  document.getElementById('juego').style.display = 'block';
  // Actualiza el nombre de la categoría seleccionada y el nivel en el centro
  gestionarBotonesFooter('juego', categoria);
  actualizarInfoJuego();
}

// Función para mostrar el cuestionario
function mostrarCuestionario() {

  localStorage.setItem('enCuestionario', 'true');
  const categoria = localStorage.getItem('categoriaSeleccionada');

  // Ocultar la interfaz del juego y mostrar la del cuestionario
  document.getElementById('niveles').style.display = 'none'; // Oculta la pantalla de niveles
  document.getElementById('inicio').style.display = 'none';
  document.getElementById('juego').style.display = 'none';
  document.getElementById('cuestionario').style.display = 'block';

  gestionarBotonesFooter('cuestionario', categoria);
  // Ocultar todos los contenedores de cuestionario
  const contenedores = document.querySelectorAll('#Animales, #Familia, #Colores, #Frutas, #Nivel2');
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
      reproducirSonido(sonidoCorrecto);
      puntaje++;
      document.getElementById('puntaje').textContent = `Puntuación: ${puntaje}`;
      elementoPalabra.style.backgroundColor = 'lightgreen';
      this.style.border = '3px solid green';
      elementoPalabra.setAttribute('draggable', false); // Deshabilita arrastrar para la palabra correcta

    } else {
      reproducirSonido(sonidoIncorrecto);
      elementoPalabra.style.backgroundColor = 'red';
      if (this.style.border !== '3px solid green') {
        elementoPalabra.style.backgroundColor = 'red';
        this.style.border = '3px solid red';
      }
    }
    if (puntaje === 5) {
      lanzarConfeti();
      reproducirSonido(sonidoFinalizado);
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

function escogerPalabrasAleatorias(categoria, fase) {
  const categoriaActual = interprete_bp.find(item => item.categoria === categoria);
  if (!categoriaActual || !categoriaActual.fases) {
    console.error(`Categoría ${categoria} no encontrada.`);
    return [];
  }

  let palabrasSeleccionadas = [];

  if (categoria === "Nivel3" || categoria === "Nivel4") {
    const faseActual = categoriaActual.fases.find(item => item.fase === fase);
    if (!faseActual || !faseActual.palabras) {
      console.error(`Fase ${fase} no encontrada para la categoría ${categoria}.`);
      return [];
    }
    // Copia las palabras de la fase actual para evitar mutaciones
    palabrasSeleccionadas = [...faseActual.palabras];
  } else {
    // Para otras categorías, incluye las palabras de la fase actual y todas las anteriores
    for (let i = 1; i <= fase; i++) {
      const faseActual = categoriaActual.fases.find(item => item.fase === i);
      if (faseActual && faseActual.palabras) {
        palabrasSeleccionadas.push(...faseActual.palabras);
      }
    }
  }

  // Mezcla las palabras seleccionadas para obtener un resultado aleatorio
  shuffleArray(palabrasSeleccionadas);
  return palabrasSeleccionadas;
}

function actualizarInfoJuego() {
  // Recuperar la categoría y el nivel actual del almacenamiento local
  const categoria = localStorage.getItem('categoriaSeleccionada');
  faseActual = parseInt(localStorage.getItem('faseActual')) || 1;

  // Obtener palabras para el nivel actual y mostrarlas en las tarjetas
  const palabras = escogerPalabrasAleatorias(categoria, faseActual);
  mostrarPalabrasEnTarjetas(palabras);

  // Actualizar el nombre de la categoría y el nivel en el centro
  document.getElementById('categoriaSeleccionada').innerText = `${categoria} - Fase ${faseActual}`;
}

function avanzarFase() {
  var categoriaSeleccionada = localStorage.getItem('categoriaSeleccionada');
  let nivel5Data = interprete_bp.find(categoria => categoria.categoria === 'Nivel5');
  // Verifica si la categoría actual es 'Nivel5'
  if (categoriaSeleccionada === 'Nivel5') {
    // Incrementa la fase y actualiza la interfaz para 'Nivel5'
    if (faseActual < 5) {
      faseActual++;
      localStorage.setItem('faseActual', faseActual);
      iniciarFaseNivel5(faseActual, nivel5Data);
      
    } else {
      console.log("Has completado todas las fases del Nivel 5!");
      // Manejar la finalización del Nivel 5 aquí
    }
  } else if (categoriaSeleccionada === 'Nivel3' || categoriaSeleccionada === 'Nivel4') {
    // Lógica para 'Nivel3' y 'Nivel4'
    if (faseActual < 4) {
      faseActual++;
      localStorage.setItem('faseActual', faseActual);
      actualizarInfoJuego();
    } else {
      console.log("Has completado todas las fases de " + categoriaSeleccionada + "!");
      // Aquí puedes redirigir al usuario o mostrar un mensaje de finalización
    }
  } else {
    // Lógica para otros niveles que no son 'Nivel3', 'Nivel4', ni 'Nivel5'
    if (faseActual < 5) {
      faseActual++;
      localStorage.setItem('faseActual', faseActual);
      actualizarInfoJuego();
    } else if (faseActual === 5) {
      mostrarCuestionario();
    }
  }
}

function retrocederFase() {
  var categoriaSeleccionada = localStorage.getItem('categoriaSeleccionada');
  console.log(faseActual);
  let nivel5Data = interprete_bp.find(categoria => categoria.categoria === 'Nivel5');
  
  // Lógica general para retroceder fases
  if (faseActual > 1) {
    faseActual--;
    localStorage.setItem('faseActual', faseActual);

    if (categoriaSeleccionada === 'Nivel5') {
      iniciarFaseNivel5(faseActual, nivel5Data); // Asegúrate de que interprete_bp es accesible
    } else {
      actualizarInfoJuego();
    }
  }
}


function regresarInicio() {
  // Eliminar la categoría seleccionada del almacenamiento local
  localStorage.removeItem('categoriaSeleccionada');
  localStorage.removeItem('faseActual');
  localStorage.removeItem('enCuestionario');
  // Muestra la pantalla de inicio
  document.getElementById('niveles').style.display = 'block';
  document.getElementById('inicio').style.display = 'none';
  document.getElementById('juego').style.display = 'none';
  document.getElementById('cuestionario').style.display = 'none';
  document.getElementById('juego-nivel5').style.display = 'none';
  gestionarBotonesFooter('niveles', null);
}

function regresarACategorias() {
  // Eliminar la categoría seleccionada del almacenamiento local
  localStorage.removeItem('categoriaSeleccionada');
  localStorage.removeItem('faseActual');
  localStorage.removeItem('enCuestionario');

  reiniciarCuestionario();
  // Muestra la pantalla de inicio
  document.getElementById('inicio').style.display = 'block';
  document.getElementById('niveles').style.display = 'none';
  // Oculta la pantalla de juego
  document.getElementById('juego').style.display = 'none';

  //Oculta la pantalla del cuestionario
  document.getElementById('cuestionario').style.display = 'none';
  gestionarBotonesFooter('inicio', null);
}

/** Logica nivel 5 */

function iniciarFaseNivel5(fase, nivel5Data) {
  document.getElementById('nivel5').innerText = `Nivel 5 - Fase ${fase}`;
  let faseData = nivel5Data.fases.find(f => f.fase === fase);
  if (!faseData) {
    console.error('Datos de la fase ' + fase + ' no encontrados.');
    return;
  }

  // Guarda el orden correcto en una variable global o en el almacenamiento local
  let ordenCorrecto = faseData.oraciones;
  localStorage.setItem('ordenCorrecto', JSON.stringify(ordenCorrecto)); // Almacenar el orden correcto

  let oracionesMezcladas = [...ordenCorrecto]; // Crea una copia para mezclar
  shuffleArray(oracionesMezcladas); // Mezcla las oraciones para la visualización
  generarDropzonesNivel5(ordenCorrecto.length);
  generarPalabrasNivel5(oracionesMezcladas); // Usa las oraciones mezcladas para generar los elementos arrastrables
}

function generarDropzonesNivel5(cantidad) {
  let contenedorDropzones = document.querySelector('.dropzones-nivel5');
  contenedorDropzones.innerHTML = ''; // Limpiar contenedor anterior
  for (let i = 0; i < cantidad; i++) {
    let div = document.createElement('div');
    div.classList.add('dropzone-nivel5');
    div.addEventListener('dragover', handleDragOverNivel5);
    div.addEventListener('drop', handleDropNivel5);
    contenedorDropzones.appendChild(div);
  }
}

function generarPalabrasNivel5(oraciones) {
  let contenedorPalabras = document.querySelector('.oraciones-nivel5');
  contenedorPalabras.innerHTML = ''; // Limpiar contenedor anterior
  oraciones.forEach((palabra, index) => {
    let div = document.createElement('div');
    div.textContent = palabra;
    div.setAttribute('draggable', true);
    div.setAttribute('id', 'palabra-nivel5-' + index);
    div.addEventListener('dragstart', handleDragStartNivel5);
    contenedorPalabras.appendChild(div);
  });
  asignarEventosDrag();
}

function handleDragStartNivel5(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
  event.dataTransfer.effectAllowed = 'move'; // Especifica el efecto de mover
}

function handleDragOverNivel5(event) {
  event.preventDefault(); // Necesario para permitir el drop
  event.dataTransfer.dropEffect = 'move'; // Especifica el efecto visual de mover
}

function handleDropNivel5(event) {
  event.preventDefault();
  const idPalabra = event.dataTransfer.getData('text/plain');
  const palabra = document.getElementById(idPalabra);
  let target = event.target;

  // Si se suelta sobre una palabra existente, reasigna el target al dropzone padre
  if (!target.classList.contains('dropzone-nivel5')) {
      target = target.closest('.dropzone-nivel5');
  }

  if (target && target.classList.contains('dropzone-nivel5')) {
      // Maneja el caso de un dropzone vacío
      if (!target.hasChildNodes()) {
          target.appendChild(palabra);
      } else {
          // Intercambio de palabras si el dropzone ya está ocupado
          const existingWord = target.firstChild;
          const sourceDropzone = palabra.parentNode;
          // Solo realiza el intercambio si la palabra proviene de otro dropzone
          if (sourceDropzone !== target) {
              sourceDropzone.appendChild(existingWord);
              target.appendChild(palabra);
          }
      }
      verificarOrdenNivel5();
  }
}

function asignarEventosDrag() {
  document.querySelectorAll('.oraciones-nivel5 div').forEach(palabra => {
    palabra.addEventListener('dragstart', handleDragStartNivel5);
  });
}


function verificarOrdenNivel5() {
  let dropzones = document.querySelectorAll('.dropzone-nivel5');
  let palabrasEnOrden = Array.from(dropzones).map(dz => dz.textContent.trim());

  // Recupera el orden correcto del almacenamiento local o de la variable global
  let ordenCorrecto = JSON.parse(localStorage.getItem('ordenCorrecto'));

  if (ordenCorrecto && JSON.stringify(palabrasEnOrden) === JSON.stringify(ordenCorrecto)) {
    console.log("¡Orden correcto!");
    reproducirSonido(sonidoFinalizado);
    // Lógica para cuando el orden es correcto
  } else {

    console.log("Orden incorrecto, sigue intentando.");
    // Lógica para cuando el orden es incorrecto
  }
}