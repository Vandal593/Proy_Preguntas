// Definir una variable para almacenar el nivel actual
let faseActual = 1;

let puntaje = 0;

var sonidoCorrecto = new Audio('audio/correcto.mp3'); // Reemplaza con la ruta de tu archivo de sonido correcto
var sonidoIncorrecto = new Audio('audio/incorrecto.mp3'); // Reemplaza con la ruta de tu archivo de sonido incorrecto

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

function iniciarNivel(nivel) {
  localStorage.setItem('nivelActual', nivel);
  document.getElementById('niveles').style.display = 'none'; // Oculta la pantalla de niveles
  document.getElementById('inicio').style.display = 'block'; // Muestra la pantalla de inicio
  gestionarBotonesFooter('inicio', null);
  // Aquí puedes agregar lógica adicional si necesitas cargar dinámicamente las categorías
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
  const palabrasFasesAnteriores = [];
  for (let i = 1; i < fase; i++) {
    const faseAnterior = categoriaActual.fases.find(item => item.fase === i);
    if (faseAnterior && faseAnterior.palabras) {
      palabrasFasesAnteriores.push(...faseAnterior.palabras);
    }
  }
  const faseActual = categoriaActual.fases.find(item => item.fase === fase);
  if (!faseActual || !faseActual.palabras) {
    console.error(`Fase ${fase} no encontrada para la categoría ${categoria}.`);
    return [];
  }
  const palabrasAleatorias = faseActual.palabras.concat(palabrasFasesAnteriores);
  shuffleArray(palabrasAleatorias);
  return palabrasAleatorias;
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
  var nivelActual = localStorage.getItem('categoriaSeleccionada');
  console.log(nivelActual);
  
  if (nivelActual === 'Nivel3' || nivelActual === 'Nivel4') {
    // Si el nivel actual es Nivel3 o Nivel4, verifica si la fase actual es menor que el máximo permitido
    if (faseActual < 4) {
      faseActual++;
      localStorage.setItem('faseActual', faseActual);
      actualizarInfoJuego();
    } else {
      console.log("Has completado todas las fases de " + nivelActual + "!");
    }
  } else {
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
  if (faseActual > 1) {
    faseActual--;
    localStorage.setItem('faseActual', faseActual);
    actualizarInfoJuego();
  }
}

function regresarInicio() {
  // Eliminar la categoría seleccionada del almacenamiento local
  localStorage.removeItem('categoriaSeleccionada');
  localStorage.removeItem('faseActual');
  localStorage.removeItem('enCuestionario');
  // Muestra la pantalla de inicio
  document.getElementById('niveles').style.display = 'block';
  // Muestra la pantalla de inicio
  document.getElementById('inicio').style.display = 'none';

  // Oculta la pantalla de juego
  document.getElementById('juego').style.display = 'none';

  //Oculta la pantalla del cuestionario
  document.getElementById('cuestionario').style.display = 'none';
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

