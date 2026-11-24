# Mapas de los mundos literarios de Robert Fader · Карты миров Роберта Фадера

Sinea, Verdegrad, Nuestra Utopía, Mendoza, Venecia, Madrid, San Petersburgo, Belgrado, Praga, la Atlántida y la Ciudad Secreta en 3D. La página principal (`index.html`) abre siempre Sinea; las demás se eligen arriba.

Once mapas en el mismo sitio, con el selector **Sinea | Verdegrad | Utopía | Mendoza | Venecia | Madrid | San Petersburgo | Belgrado | Praga | Atlántida | Ciudad Secreta** arriba (en el celular y en pantallas de menos de 1180 px, el botón «Mapas ▾» abre la lista):

- **Sinea**, la ciudad junto al mar: `index.html`
- **Verdegrad**, el pueblo verde de Natalia, con su fortaleza en la penumbra: `index.html?ciudad=verdegrad` (o `verdegrad.html`)
- **Nuestra Utopía** (Наша Утопия), la fortaleza de Robert en «Предчувствие»: `index.html?ciudad=utopia` (o `utopia.html`)
- **Mendoza** (Мендоса), la ciudad real de «La reina de la Vendimia», «El misterio de los Fader», «Дикий час: Духи гор» y otras: `index.html?ciudad=mendoza` (o `mendoza.html`)
- **Venecia** (Венеция), la ciudad real de «Maschera di Venezia» / «Венецианская маска»: `index.html?ciudad=venezia` (o `venezia.html`)
- **Madrid** (Мадрид), la ciudad real de «Дикий час: Карнавал раздора»: `index.html?ciudad=madrid` (o `madrid.html`)
- **San Petersburgo** (Санкт-Петербург), la ciudad real de «Резонанс любви»: `index.html?ciudad=petersburgo` (o `petersburgo.html`)
- **Belgrado** (Белград), la ciudad real de «Дикий час» y de su versión serbia «Дивљи час»: `index.html?ciudad=belgrado` (o `belgrado.html`)
- **Praga** (Прага), la ciudad real de «Podzemní tajemství», «Ostrovy nad Prahou», «Předtucha» y los capítulos praguenses de «La reina de la Vendimia»: `index.html?ciudad=praga` (o `praga.html`)
- **Atlántida** (Атлантида), los dos mundos de «Звёздный роман»: `index.html?ciudad=atlantida` (o `atlantida.html`)
- **La Ciudad Secreta** (Тайный город), de «La ciudad secreta»: `index.html?ciudad=secreta` (o `secreta.html`)

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

## Mendoza

A diferencia de las otras tres, Mendoza es una ciudad real y el mapa sigue su geografía real, con datos de © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL), consultados con Nominatim y Overpass en noviembre de 2026:

- **La cuadrícula del centro** está medida sobre los ejes reales de las calles: manzanas de 122,5 m de eje a eje, giradas 12,5° (las calles «norte-sur» apuntan al NNE). El (0,0) es el centro de la Plaza Independencia; la calle Mitre y Sarmiento son los ejes. Las calles con nombre (San Martín, Peatonal Sarmiento, Colón, Arístides Villanueva, Las Heras, Belgrano, Patricias Mendocinas, España, 9 de Julio…) están en su cuadra real, y las cuatro plazas satélite quedan a dos cuadras de cada esquina de la Independencia, como en la realidad.
- **Los lugares** llevan coordenadas reales en `data/mendoza/lugares.json`: `"ll": [lat, lon]` o `"g": [cuadras al este de Mitre, cuadras al norte de Sarmiento]`; `tools/build.py` las convierte a metros. El parque San Martín, el lago, el Cerro de la Gloria, el Teatro Griego, la Casa de Gobierno, el Área Fundacional, el aeropuerto, el Challao, el museo Fader, Chacras de Coria y La Rural están donde están.
- **Lo aproximado**: los contornos de los barrios y departamentos (Godoy Cruz, Guaymallén, Las Heras, Luján…), el trazado de las rutas fuera del centro, el relieve de la precordillera y la cordillera del horizonte (con las distancias acortadas; el Aconcagua y el Tupungato van en su dirección real). Los negocios y casas que inventan las novelas (la peluquería de Mirta, la casa de Sergio en la «calle de los Olmos», la librería de Garibaldi…) van en la calle o el barrio que dice el texto.
- **Fuera del mapa**: Potrerillos, Cacheuta, Uspallata, el Aconcagua, el Valle de Uco, Malargüe y otros aparecen en el borde, en la dirección en que hay que ir, con la distancia en km.

Las reseñas (`data/mendoza/resenas.json`) son de Jana, Mirta, Julieta Arancibia, Natalia, Natasha, Luis, Sergio, Karl Fader, Carlita Martínez, Estela González, Zmaj y otros personajes.

## Venecia

El mapa de «Maschera di Venezia» (y de su versión rusa, «Венецианская маска», que agrega el Arsenal, la Salute, San Giorgio, San Michele y la red de cartas). La forma de las islas y de los canales grandes es la real: sale de una máscara tierra/agua de OpenStreetMap a 6,7 m por píxel, guardada como campo de distancias en `img/venezia-tierra.png` y leída por `js/ciudades/venezia.js`. Los canales chicos (rii) no entran a esa resolución. Los monumentos (Basílica, Campanile, Palacio Ducal, Puente de los Suspiros, Rialto, Salute, San Giorgio, la Porta Magna del Arsenal) están en sus coordenadas reales y modelados a mano; por el Canal Grande andan góndolas y vaporetti. Los lugares subterráneos de la novela (la Venecia perdida, las mazmorras de la Logia, el nivel sumergido, San Michele dell'Abisso, el palacio de Natalia) van debajo del sitio que dice el texto; los que la novela no ubica lo dicen en su ficha. Datos: `data/venezia/`.

## Madrid

El Madrid de «Дикий час: Карнавал раздора», del Templo de Debod al Retiro y de Colón a Atocha. El suelo es el mapa real de OpenStreetMap reclasificado (calles, manzanas, parques, el Manzanares) en `img/madrid-suelo.png`, a 3,64 m por píxel; los edificios salen de ese mismo mapa: uno cada 12 m donde OSM dibuja edificios (`js/ciudades/madrid-lotes.js`), con alturas inventadas. Modelados a mano: el monumento a Cervantes, la Torre de Madrid, el Templo de Debod, el Oso y el Madroño, la Plaza Mayor, el Mercado de la Cebada, la Biblioteca Nacional, la columna de Colón con la bandera, el Banco de España y una boca de metro. Datos: `data/madrid/`.

## San Petersburgo

El Petersburgo de «Резонанс любви», de la isla Vasílievski a la estación de Moscú. Igual que Madrid, el suelo, el agua (el Neva, el Fontanka, el Moika, los canales) y los edificios salen del mapa de OpenStreetMap a 4,79 m por píxel (`img/spb-suelo.png`, `img/spb-tierra.png`, `js/ciudades/spb-lotes.js`). Modelados a mano: la Casa Singer con su globo, los atlantes de la Millónnaya, la Columna de Alejandro, el Palacio de Invierno, las esfinges, el Puente del Banco con los grifos, San Isaac, el puente Anichkov, el Museo Ruso, el Mariinski, el Puente del Palacio (que de noche se abre) y el Puente de los Besos, que es «el puente que callaba» del final. Datos: `data/petersburgo/`.

## Belgrado

El Belgrado de «Дикий час» (ruso) y «Дивљи час» (serbio): cada lugar muestra los capítulos de las dos versiones. Suelo, ríos y edificios del mapa de OpenStreetMap a 6,78 m por píxel (`img/bg-suelo.png`, `img/bg-tierra.png`, `js/ciudades/bg-lotes.js`), generados con `tools/mapa_osm.py` a partir de las teselas. Modelados a mano: el Pobednik sobre Kalemegdan, la torre Nebojša, el príncipe Mihailo y el Museo Nacional, el edificio bombardeado del Estado Mayor, el templo de San Sava con su cruz ortodoxa y el Puente Branko. Datos: `data/belgrado/`.

## Praga

La Praga de la serie checa de Luis y Jana: «Podzemní tajemství», «Ostrovy nad Prahou» y «Předtucha», más los capítulos praguenses de «La reina de la Vendimia» y de «Královna vinobraní». Suelo, río y edificios del mapa de OpenStreetMap a 6,13 m por píxel (`img/praga-suelo.png`, `img/praga-tierra.png`, `js/ciudades/praga-lotes.js`, con `tools/mapa_osm.py`). Modelados a mano: el Puente de Carlos con sus estatuas y torres, el Castillo con San Vito, la Plaza de la Ciudad Vieja con Týn, el reloj astronómico y Jan Hus, San Nicolás de Malá Strana, el mirador de Petřín, Vyšehrad y la torre de Žižkov. Encima flotan las cinco islas de Černoboh («Ostrovy nad Prahou»), con sus cadenas azules clavadas en los cinco corazones de la ciudad. Datos: `data/praga/`.

## Atlántida

Mapa imaginado a partir de «Звёздный роман», con sus dos mundos: al oeste la Tierra (la aldea de Laura, el bosque de la estrella caída, la gruta de las luces azules y el viejo faro sobre el mar); al este, cruzando el mar, la Atlántida del cap. 18, con torres blancas y de cristal como caracolas. La novela no dibuja la ciudad: los anillos de tierra y agua siguen a Platón y la cúpula recuerda que está «bajo la masa del océano». La nave enemiga flota entre las nubes. Configuración en `js/ciudades/atlantida.js`; datos en `data/atlantida/`.

## La Ciudad Secreta

Mapa imaginado a partir de «La ciudad secreta»: la ciudad blanca está «debajo de la tierra, dentro de las montañas», así que se ve como un valle cerrado por un anillo de picos con los cristales dorados del techo flotando encima. Afuera, al sureste, el pueblito de Martín, con el parque y la cafetería, y el camino hasta la roca de la llave. Configuración en `js/ciudades/secreta.js`; datos en `data/secreta/`.

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
