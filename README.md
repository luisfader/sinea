# Sinea — el mapa 3D · Синея — 3D-карта

**Bilingüe: español y ruso.** El botón ES/RU de arriba cambia todo al instante (interfaz, lugares, descripciones, calles, barrios, novelas y personajes). El idioma se recuerda, y se puede forzar con `?lang=ru` o `?lang=es` en la dirección: `index.html?lang=ru#/lugar/faro-ael`.

**Двуязычная карта: испанский и русский.** Кнопка ES/RU переключает всё сразу; выбор запоминается, а ссылкой можно задать язык: `?lang=ru`.

Mapa interactivo en 3D de **Sinea**, la ciudad de las novelas de Robert Fader: se mueve y se acerca como Google Maps, con calles, barrios, colinas, el río Sina, la bahía y los edificios famosos modelados en 3D. Al tocar un lugar se abre su ficha: qué es, una ilustración de la novela y **en qué novelas y capítulos aparece**, con enlace directo a cada capítulo en [LitFader](https://luisfader.github.io/litmir/).

No necesita compilación: es un `index.html` con módulos JavaScript y three.js incluido en `js/vendor/`. Para publicarlo basta con activar GitHub Pages (rama `main`, carpeta raíz).

## Qué se puede hacer

- **Moverse**: arrastrar para desplazarse, clic derecho (o dos dedos) para girar e inclinar, rueda o pellizco para el zoom, doble clic para acercarse a un punto. Botones: norte, 2D/3D, día/noche, ver toda la ciudad, zoom.
- **Buscar** (tecla `/`): lugares, novelas, personajes, calles y también palabras de las descripciones (por ejemplo, «Irina» encuentra la cafetería Fucsia).
- **Filtrar por novela**: se iluminan solo sus lugares y aparece el **recorrido** en el orden en que la novela los menciona, con una línea roja sobre el mapa.
- **Filtrar por personaje**: el detective Vasili, Sasha, Marcos y Alicia, Irina, Franco y Chiara, Luis y Natalia, Alessio y Tatiana, Fabrizio y Lucía.
- **Noche**: se encienden las ventanas, el faro barre la bahía con su haz y, por las vías del barrio de los Locos, pasa el tren fantasma.
- **Enlaces directos**: `#/lugar/faro-ael`, `#/novela/opasnoe-svidanie`, `#/personaje/vasili`.

## Cómo está hecha la ciudad

La geografía sale de las propias novelas:

- En «Стратег», Miguel cuadricula el mapa de Sinea como un tablero: el río en el medio, el Puente Norte arriba, el Puerto Viejo abajo, el Ayuntamiento en e1, la plaza de los Relojes en e3, la colina del Oeste a un lado y la carretera del puerto junto al mar en la columna g.
- En «Знак», los doce alfileres blancos (el molino de la carretera del Norte, el depósito de agua del barrio Este, el observatorio de la escuela náutica, la iglesia de Santa Clara, el Faro de Ael, la central eléctrica junto al faro, la vieja torre de televisión detrás del Ayuntamiento…) forman un círculo cuyo centro es el Planetario, en una colina al oeste del centro.
- En «Голос», el Faro de Ael se levanta al final del muelle, en el lugar de la vieja estación, junto a la central abandonada y al parque de la Alegría.
- En «Волны любви: Город без улыбок», la plaza del Orden era antes la plaza de las Flores, y la torre de televisión está en la colina de San Michele.

Donde los textos no dicen nada, la ciudad se completó con criterio (casco antiguo de tejas junto al puerto, ensanche y orilla norte más modernos, villas en las colinas del suroeste).

## Estructura

```
index.html            la página
css/sinea.css         estilos (escritorio y móvil)
js/app.js             cámara, etiquetas, ficha, búsqueda, filtros, día/noche
js/mundo.js           geografía: costa, río, colinas, barrios, calles, vías, plazas, parques
js/escena.js          relieve, textura del mapa, mar, edificios generados, árboles, puentes
js/hitos.js           los edificios famosos en 3D (faro, torre de TV, ayuntamiento, planetario…)
js/datos.js           GENERADO: lugares + novelas + capítulos
data/lugares.json     FUENTE: los lugares, escritos a mano
data/lugares.ru.json  FUENTE: nombre y descripción de cada lugar en ruso (misma clave id)
tools/build.py        cruza data/lugares.json con los textos de litmir y genera js/datos.js e img/
img/lugares/          una ilustración por lugar (de los capítulos de litmir, reducida a webp)
img/portadas/         portadas de las novelas
```

## Añadir o corregir un lugar

1. Editar `data/lugares.json`. Cada lugar tiene:
   - `id`, `nombre`, `otros` (nombres en otros idiomas), `cat` (monumento, plaza, cafe, edificio, transporte, parque, barrio, calle, misterio);
   - `x`, `y`: posición en metros (x hacia el este, y hacia el norte; la plaza Dante está en 600, −640);
   - `modelo`: el edificio 3D (`faro`, `torre-tv`, `ayuntamiento`, `planetario`, `estacion`, `museo`, `hotel`, `cafe`, `taller`, `molino`, `iglesia`…, o `ninguno` para solo el marcador);
   - `desc`: la descripción;
   - `buscar`: expresión regular que se busca en los capítulos para saber en qué novelas aparece (por ejemplo `площад\\w* Данте|plaza Dante|piazza Dante`);
   - opcionales: `buscar_en` (patrón que solo vale en ciertas novelas), `extra` (capítulos añadidos a mano: `{"el-impostor": [1]}`), `ilustracion` (elegir la imagen a mano: `["golos", "19-01.jpg"]`).
2. Agregar su nombre y descripción en ruso en `data/lugares.ru.json` (el script avisa «FALTA traducción rusa» si falta).
3. Regenerar los datos con una copia local de litmir al lado:

```
python3 tools/build.py ../litmir
```

Las calles, barrios y colinas se editan en `js/mundo.js` (cada calle y barrio lleva también su nombre ruso); un edificio 3D nuevo se agrega como una función más en `MODELOS` de `js/hitos.js`.

## Próximas capas

- Personajes en el mapa: dónde vive cada uno (el piso de Marcos y Alicia, la oficina de Vasili, el balcón de Marisa…).
- Más interiores y escenas: el metro que no existía y sus estaciones, los vagones del tren fantasma, la Sala del Corazón Negro.
- Lugares fuera de Sinea conectados: Verdegrad, Armonia, la Ciudad del Norte.
- Más idiomas: italiano e inglés (los textos de la interfaz están en `js/app.js`, función `tr`).
- Momentos: ver la ciudad tal como está en cada novela (la ciudad triste, la ciudad sin sonrisas, el Carnaval).

three.js © mrdoob y colaboradores, licencia MIT (`js/vendor/three-LICENSE`).
