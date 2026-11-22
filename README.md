# Sinea, Verdegrad y Nuestra Utopía — mapas 3D · Синея, Вердеград и Наша Утопия — 3D-карты

Tres mapas en el mismo sitio, con el selector **Sinea | Verdegrad | Utopía** arriba:

- **Sinea**, la ciudad junto al mar: `index.html`
- **Verdegrad**, el pueblo verde de Natalia, con su fortaleza en la penumbra: `index.html?ciudad=verdegrad` (o `verdegrad.html`)
- **Nuestra Utopía** (Наша Утопия), la fortaleza de Robert en «Предчувствие»: `index.html?ciudad=utopia` (o `utopia.html`)

Los rótulos verdes en el borde del mapa también llevan de una ciudad a la otra («← Verdegrad · estación Nubecita» en Sinea; «← Antiguo camino a Sinea» en Verdegrad).

**Bilingüe: español y ruso.** El botón ES/RU de arriba cambia todo al instante (interfaz, lugares, descripciones, calles, barrios, novelas y personajes). El idioma se recuerda, y se puede forzar con `?lang=ru` o `?lang=es` en la dirección: `index.html?lang=ru#/lugar/faro-ael`.

**Двуязычная карта: испанский и русский.** Кнопка ES/RU переключает всё сразу; выбор запоминается, а ссылкой можно задать язык: `?lang=ru`.

Mapa interactivo en 3D de **Sinea**, la ciudad de las novelas de Robert Fader: se mueve y se acerca como Google Maps, con calles, barrios, colinas, el río Sina, la bahía y los edificios famosos modelados en 3D. Al tocar un lugar se abre su ficha: qué es, una ilustración de la novela y **en qué novelas y capítulos aparece**, con enlace directo a cada capítulo en [LitFader](https://luisfader.github.io/litmir/).

No necesita compilación: es un `index.html` con módulos JavaScript y three.js incluido en `js/vendor/`. Para publicarlo basta con activar GitHub Pages (rama `main`, carpeta raíz).

## Qué se puede hacer

- **Moverse**: arrastrar para desplazarse, clic derecho (o dos dedos) para girar e inclinar, rueda o pellizco para el zoom, doble clic para acercarse a un punto. Botones: norte, 2D/3D, día/noche, ver toda la ciudad, zoom.
- **Buscar** (tecla `/`): lugares, novelas, personajes, calles y también palabras de las descripciones (por ejemplo, «Irina» encuentra la cafetería Fucsia).
- **Filtrar por novela**: se iluminan solo sus lugares y aparece el **recorrido** en el orden en que la novela los menciona, con una línea roja sobre el mapa.
- **Filtrar por personaje**: el detective Vasili, Sasha, Marcos y Alicia, Irina, Franco y Chiara, Luis y Natalia, Alessio y Tatiana, Fabrizio y Lucía.
- **Casas de los personajes**: Marcos y Alicia (calle de los Castaños), la familia Grande (Franco, Alfredo y Gaia), Chiara, Sasha, el piso de Luis y Natalia, la oficina del detective Vasili y el carrito de helados de Octavio Grande en la plaza Dante. En el menú: «Casas de los personajes».
- **Reseñas**: restaurantes, cafés, tiendas, bares y lugares famosos tienen reseñas con estrellas escritas por los propios personajes (Casimiro Condena, el zorro, Doña Carmen, Ashot…), en español y en ruso. En el menú: «Lugares con reseñas».
- **El autobús n.º 7 de Víctor** (Verdegrad) anda sin parar: cocheras → malecón → estación «Nubecita» → mercado → calle de los Tilos (dos bocinazos bajo las ventanas de Natalia) → calle del Molino. Tocándolo, la cámara lo sigue. El recorrido está en `RUTA_BUS` de `js/ciudades/verdegrad.js`.
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
js/mundo.js           elige la ciudad activa y tiene las utilidades geométricas (altura, río, costa)
js/ciudades/sinea.js  geografía de Sinea: costa, río, colinas, barrios, calles, vías, plazas, parques, vista inicial
js/ciudades/verdegrad.js  geografía de Verdegrad (sin mar: río, arroyo, estanque, fortaleza, campos)
js/escena.js          relieve, textura del mapa, mar, edificios generados, árboles, puentes
js/hitos.js           los edificios famosos en 3D (faro, torre de TV, ayuntamiento, planetario…)
js/datos.js           GENERADO: lugares + novelas + capítulos
data/lugares.json     FUENTE: los lugares, escritos a mano
data/lugares.ru.json  FUENTE: nombre y descripción de cada lugar en ruso (misma clave id)
data/resenas.json     FUENTE: las reseñas de los personajes (autor ES/RU, estrellas, texto ES/RU)
data/verdegrad/       lo mismo para Verdegrad: lugares.json, lugares.ru.json, resenas.json
tools/build.py        cruza data/lugares.json con los textos de litmir y genera js/datos.js e img/
img/lugares/          una ilustración por lugar (de los capítulos de litmir, reducida a webp)
img/portadas/         portadas de las novelas
```

## Verdegrad

Verdegrad está armado con lo que cuentan «Волны любви: Крепость в полумраке», «Нарисованный мир», «Лабиринт забвения», «Onde d'amore» y «Город без улыбок»: la calle de los Tilos (Липовая) baja suave hasta el mercado junto al campanario, la fortaleza se ve desde cualquier calle, por la calle del Molino se cruza el arroyo, después vienen el callejón de los Zapateros y la iglesia de Santa Ana, y al final de la calle del Oeste están las Puertas del Oeste y el antiguo camino a Sinea. La estación «Nubecita» (Облачко) queda en el borde, donde las calles se vuelven campo. En `tools/build.py` solo se buscan los capítulos que pasan en Verdegrad (por ejemplo, de «Нарисованный мир» solo los capítulos 1–13, porque después la acción se va a Новая Любовь).

## Nuestra Utopía

La fortaleza sigue la descripción de «Предчувствие», cap. 4: un fuerte pentagonal turquesa sobre una colina empinada de cima plana, con dos anillos de murallas, torres cilíndricas de vigía (de ventanas angostas y con adornos) en el anillo exterior, y la torre principal con su mirador junto a la plaza central. Alrededor, el valle verde; más allá, el desierto con el búnker de Robert y la tumba vacía de Luis; al oeste, el mar de los tanques-araña; al este, los túneles hacia el campamento de las montañas. Delante del muro sur está el Muro de Luis de «Предчувствие 2.4», cuyas placas brillan de noche. Sobre la fortaleza vuelan los drones-gaviota. Los datos están en `data/utopia/` y la geografía en `js/ciudades/utopia.js`.

## Añadir o corregir un lugar

1. Editar `data/lugares.json`. Cada lugar tiene:
   - `id`, `nombre`, `otros` (nombres en otros idiomas), `cat` (monumento, plaza, cafe, edificio, transporte, parque, barrio, calle, misterio);
   - `x`, `y`: posición en metros (x hacia el este, y hacia el norte; la plaza Dante está en 600, −640);
   - `modelo`: el edificio 3D (`faro`, `torre-tv`, `ayuntamiento`, `planetario`, `estacion`, `museo`, `hotel`, `cafe`, `taller`, `molino`, `iglesia`…, o `ninguno` para solo el marcador);
   - `desc`: la descripción;
   - `buscar`: expresión regular que se busca en los capítulos para saber en qué novelas aparece (por ejemplo `площад\\w* Данте|plaza Dante|piazza Dante`);
   - opcionales: `solo` (buscar solo en esas novelas), `excluir` (novelas), `excluir_caps` (capítulos: `{"predchuvstvie-2-4": [1]}`), `buscar_en` (patrón que solo vale en ciertas novelas), `extra` (capítulos añadidos a mano: `{"el-impostor": [1]}`), `ilustracion` (elegir la imagen a mano: `["golos", "19-01.jpg"]`).
2. Agregar su nombre y descripción en ruso en `data/lugares.ru.json` (el script avisa «FALTA traducción rusa» si falta).
3. Opcional: reseñas en `data/resenas.json`, con la misma clave id: `{"a": "Vasili", "ar": "Василий", "s": 4, "es": "…", "ru": "…"}`. Si el texto empieza con «Respuesta del propietario» / «Ответ владельца», se muestra como respuesta del dueño.
4. Regenerar los datos con una copia local de litmir al lado:

```
python3 tools/build.py ../litmir
```

Las calles, barrios y colinas se editan en `js/mundo.js` (cada calle y barrio lleva también su nombre ruso); un edificio 3D nuevo se agrega como una función más en `MODELOS` de `js/hitos.js`.

## Próximas capas

- Más casas: el balcón de Marisa, la casa de Nadia sobre la librería, el piso de Irina.
- Más interiores y escenas: el metro que no existía y sus estaciones, los vagones del tren fantasma, la Sala del Corazón Negro.
- Lugares fuera de Sinea conectados: Verdegrad, Armonia, la Ciudad del Norte.
- Más idiomas: italiano e inglés (los textos de la interfaz están en `js/app.js`, función `tr`).
- Momentos: ver la ciudad tal como está en cada novela (la ciudad triste, la ciudad sin sonrisas, el Carnaval).

three.js © mrdoob y colaboradores, licencia MIT (`js/vendor/three-LICENSE`).
