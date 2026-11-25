#!/usr/bin/env python3
"""Genera js/datos.js (y las imágenes de img/) a partir de data/lugares.json
y de una copia local del repositorio de novelas (litmir).

Uso:  python3 tools/build.py ../litmir

Para cada lugar busca su expresión regular «buscar» en todos los capítulos de
las novelas de Sinea, y anota en qué novela y en qué capítulo aparece. Elige
también una ilustración de uno de esos capítulos y la reduce a webp.
"""
import json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'litmir'))

# Novelas ambientadas (total o parcialmente) en Sinea. Título en español para
# las que no lo tienen. El orden decide qué novela aporta la ilustración.
NOVELAS = {
    'predchuvstvie': 'El presentimiento', 'predchuvstvie-2': 'El presentimiento 2', 'predchuvstvie-2-2': 'El presentimiento 2.2',
    'predchuvstvie-2-3': 'El presentimiento 2.3', 'predchuvstvie-2-4': 'El presentimiento 2.4',
    'grustnyj-gorod': 'La ciudad triste', 'la-citta-triste': 'La ciudad triste (it.)',
    'el-tren-fantasma': None, 'prizrachnyj-poezd': 'El tren fantasma (ru.)', 'il-treno-fantasma': 'El tren fantasma (it.)',
    'el-tren': None, 'bezumie-v-poezde': 'Locura en el tren',
    'golos': 'La voz', 'la-voix': 'La voz (fr.)',
    'volny-lyubvi': 'Ondas de amor (ru.)', 'ondas-de-amor': None, 'onde-d-amore': 'Ondas de amor (it.)',
    'volny-lyubvi-gorod-bez-ulybok': 'Ondas de amor: La ciudad sin sonrisas',
    'volny-lyubvi-krepost': 'Ondas de amor: La fortaleza en la penumbra',
    'volny-lyubvi-narisovannyj-mir': 'Ondas de amor: El mundo dibujado',
    'volny-lyubvi-labirint-zabveniya': 'Ondas de amor: El laberinto del olvido',
    'onde-d-amore-3': 'Ondas de amor 3: El rostro del mal',
    'sny-i-zver': 'Los sueños y la Bestia', 'mashina-snov': 'La máquina de los sueños',
    'opasnoe-svidanie': 'Una cita peligrosa', 'almaznyj-dozhd': 'Lluvia de diamantes',
    'chi-ha-visto-sasha': '¿Quién ha visto a Sasha?',
    'znak': 'El signo', 'strateg': 'El estratega',
    'tikhaya-lyubov': 'Amor en silencio', 'ti-amo-in-silenzio': 'Te amo en silencio (it.)',
    'pokhititel-serdec-portret-osnovatelya': 'Ladrón de corazones: El retrato del fundador',
    'tajna-v-biblioteke': 'El misterio de la biblioteca', 'karnaval-sinei': 'El Carnaval de Sinea',
    'amor-en-el-cosmos': None, 'lluvia-de-meteoritos': None, 'la-chica-del-retrato': None,
    'el-impostor': None, 'the-immigrant': 'El inmigrante', '27-ocak': '27 de enero',
    'la-reina-de-la-vendimia': None, 'kralovna-vinobrani': 'La reina de la Vendimia (checo)',
    'el-misterio-de-los-fader': None, 'tajna-semi-fader': 'El misterio de los Fader (ru.)', 'operacion-londres': None,
    'dikij-chas-2': 'La hora salvaje: Los espíritus de la montaña', 'divlji-chas-malbec': 'La hora salvaje: El amor con sabor a malbec (serbio)',
    'ladro-di-cuori-3': 'Ladrón de corazones 3 (it.)', 'anomalia': None,
    'dikij-chas-karnaval-razdora': 'La hora salvaje: El carnaval de la discordia',
    'rezonans-lyubvi': 'Resonancia del amor',
    'dikij-chas': 'La hora salvaje', 'divlji-chas': 'La hora salvaje (serbio)',
    'maschera-di-venezia': 'La máscara de Venecia (it.)', 'venecianskaya-maska': 'La máscara de Venecia (ru.)',
    'zvezdnyj-roman': 'Novela estelar', 'severnaya-lyubov': 'Amor del Norte', 'severnaya-lyubov-2': 'Amor del Norte 2: Llanto del norte', 'severnaya-lyubov-3': 'Amor del Norte 3: Viento del este', 'la-ciudad-secreta': None,
    'podzemni-tajemstvi': 'El secreto subterráneo (checo)', 'ostrovy-nad-prahou': 'Las islas sobre Praga (checo)', 'predtucha': 'El presentimiento (checo)',
}
# Título en ruso para las novelas que no están escritas en ruso
NOVELAS_RU = {
    'la-citta-triste': 'Грустный город (ит.)', 'el-tren-fantasma': 'Призрачный поезд (исп.)', 'il-treno-fantasma': 'Призрачный поезд (ит.)',
    'el-tren': 'Поезд', 'la-voix': 'Голос (фр.)', 'ondas-de-amor': 'Волны любви (исп.)', 'onde-d-amore': 'Волны любви (ит.)',
    'onde-d-amore-3': 'Волны любви 3: Лицо зла (ит.)', 'chi-ha-visto-sasha': 'Кто видел Сашу?', 'ti-amo-in-silenzio': 'Люблю тебя молча (ит.)',
    'amor-en-el-cosmos': 'Любовь в космосе', 'lluvia-de-meteoritos': 'Метеоритный дождь (исп.)', 'la-chica-del-retrato': 'Девушка с портрета',
    'el-impostor': 'Самозванец', 'the-immigrant': 'Иммигрант', '27-ocak': '27 января',
    'la-reina-de-la-vendimia': 'Королева Вендимии (исп.)', 'kralovna-vinobrani': 'Королева Вендимии (чеш.)',
    'el-misterio-de-los-fader': 'Тайна семьи Фадер (исп.)', 'operacion-londres': 'Тайна семьи Фадер: Операция «Лондон» (исп.)',
    'divlji-chas-malbec': 'Дикий час: Любовь со вкусом мальбека (серб.)', 'ladro-di-cuori-3': 'Похититель сердец 3 (ит.)', 'anomalia': 'Аномалия (исп.)',
    'maschera-di-venezia': 'Венецианская маска (ит.)',
    'divlji-chas': 'Дикий час (серб.)',
    'la-ciudad-secreta': 'Тайный город (исп.)',
    'podzemni-tajemstvi': 'Подземная тайна (чеш.)', 'ostrovy-nad-prahou': 'Острова над Прагой (чеш.)', 'predtucha': 'Предчувствие (чеш.)',
}
LANG_RU = {'ru': 'русский', 'es': 'испанский', 'it': 'итальянский', 'fr': 'французский', 'en': 'английский', 'tr': 'турецкий', 'cs': 'чешский', 'sr': 'сербский'}
LANG = {'ru': 'ruso', 'es': 'español', 'it': 'italiano', 'fr': 'francés', 'en': 'inglés', 'tr': 'turco', 'cs': 'checo', 'sr': 'serbio'}
# Novelas que se buscan para cada ciudad (Sinea usa todas las de NOVELAS)
CIUDADES = {
    'sinea': {'dir': 'data', 'novelas': None},
    'verdegrad': {'dir': os.path.join('data', 'verdegrad'), 'novelas': [
        'volny-lyubvi-krepost', 'volny-lyubvi-narisovannyj-mir', 'volny-lyubvi-labirint-zabveniya', 'onde-d-amore',
        'volny-lyubvi-gorod-bez-ulybok', 'pokhititel-serdec-portret-osnovatelya', 'tajna-v-biblioteke', 'karnaval-sinei'],
     # capítulos que pasan en Verdegrad (el resto ocurre en Sinea, en Новая Любовь o en la Ciudad del Norte)
     'rangos': {'volny-lyubvi-narisovannyj-mir': [(1, 13)], 'volny-lyubvi-labirint-zabveniya': [(1, 6)],
                'volny-lyubvi-gorod-bez-ulybok': [(1, 3), (43, 44)], 'onde-d-amore': [(11, 20)]}},
    'utopia': {'dir': os.path.join('data', 'utopia'), 'novelas': [
        'predchuvstvie', 'predchuvstvie-2', 'predchuvstvie-2-2', 'predchuvstvie-2-3', 'predchuvstvie-2-4']},
    # Mendoza es una ciudad real: los lugares llevan coordenadas reales («ll»: lat, lon) o su cuadra («g»: e, n)
    'mendoza': {'dir': os.path.join('data', 'mendoza'), 'geo': 'mendoza', 'novelas': [
        'la-reina-de-la-vendimia', 'kralovna-vinobrani', 'el-misterio-de-los-fader', 'tajna-semi-fader', 'operacion-londres',
        'dikij-chas-2', 'divlji-chas-malbec', 'ladro-di-cuori-3', 'anomalia']},
    # Venecia: «Maschera di Venezia» y su versión rusa «Венецианская маска»
    'venezia': {'dir': os.path.join('data', 'venezia'), 'geo': 'venezia', 'novelas': ['maschera-di-venezia', 'venecianskaya-maska']},
    'madrid': {'dir': os.path.join('data', 'madrid'), 'geo': 'madrid', 'novelas': ['dikij-chas-karnaval-razdora']},
    'petersburgo': {'dir': os.path.join('data', 'petersburgo'), 'geo': 'petersburgo', 'novelas': ['rezonans-lyubvi']},
    'belgrado': {'dir': os.path.join('data', 'belgrado'), 'geo': 'belgrado', 'novelas': ['dikij-chas', 'divlji-chas']},
    # Praga: la serie checa de Luis y Jana y los capítulos praguenses de «La reina de la Vendimia»
    'praga': {'dir': os.path.join('data', 'praga'), 'geo': 'praga', 'novelas': [
        'podzemni-tajemstvi', 'ostrovy-nad-prahou', 'predtucha', 'la-reina-de-la-vendimia', 'kralovna-vinobrani'],
     'rangos': {'la-reina-de-la-vendimia': [(1, 2), (49, 50)], 'kralovna-vinobrani': [(1, 2), (30, 30)]}},
    'londres': {'dir': os.path.join('data', 'londres'), 'geo': 'londres', 'novelas': ['operacion-londres']},
    'atlantida': {'dir': os.path.join('data', 'atlantida'), 'novelas': ['zvezdnyj-roman']},
    # el esquema del metro: solo la versión rusa de «El tren fantasma»
    'metro': {'dir': os.path.join('data', 'metro'), 'novelas': ['prizrachnyj-poezd'], 'rangos': {'prizrachnyj-poezd': [(1, 46)]}},
    # el fiordo de Sofía y Román: la tercera parte de «Северная любовь», con las dos primeras
    'fiordo': {'dir': os.path.join('data', 'fiordo'), 'novelas': ['severnaya-lyubov-3', 'severnaya-lyubov-2', 'severnaya-lyubov']},
    'secreta': {'dir': os.path.join('data', 'secreta'), 'novelas': ['la-ciudad-secreta'], 'rangos': {'la-ciudad-secreta': [(1, 8)]}},
}

# Mendoza: (0,0) en el centro de la Plaza Independencia; cuadrícula de 122,5 m girada 12,5° (igual que js/ciudades/mendoza.js)
import math
_LAT0, _LON0 = -32.8897243, -68.8444983
_KX, _KY = 111320 * math.cos(math.radians(_LAT0)), 110920
_TH = math.radians(12.5)
GEO = {'mendoza': (-32.8897243, -68.8444983, 110920), 'venezia': (45.43416, 12.33845, 111135), 'madrid': (40.41689, -3.70358, 111040), 'petersburgo': (59.9390, 30.3158, 111410), 'belgrado': (44.8170, 20.4573, 111140), 'praga': (50.0875, 14.4213, 111230), 'londres': (51.50073, -0.12463, 111250)}
def geo_xy(L, geo='mendoza'):
    if 'll' in L:
        lat0, lon0, ky = GEO[geo]
        lat, lon = L['ll']; return round((lon - lon0) * 111320 * math.cos(math.radians(lat0))), round((lat - lat0) * ky)
    if 'g' in L:
        e, n = L['g'][0] * 122.5, L['g'][1] * 122.5
        return round(e * math.cos(_TH) + n * math.sin(_TH)), round(-e * math.sin(_TH) + n * math.cos(_TH))
    return L['x'], L['y']
# Excepciones: patrones demasiado generales que solo valen en ciertas novelas
SOLO = {
    'faro-ael': None,
    'central-electrica': ['golos', 'la-voix', 'karnaval-sinei', 'almaznyj-dozhd', 'znak', 'grustnyj-gorod'],
    'brecha': ['golos', 'la-voix'],
    'estacion-central': ['el-tren-fantasma', 'prizrachnyj-poezd', 'il-treno-fantasma', 'el-tren', 'bezumie-v-poezde',
                         'strateg', 'tajna-v-biblioteke', 'karnaval-sinei', 'amor-en-el-cosmos', 'znak'],
    'tuneles': ['tikhaya-lyubov', 'ti-amo-in-silenzio', 'tajna-v-biblioteke', 'karnaval-sinei'],
    'laberinto-cristal': ['amor-en-el-cosmos'],
    'casa-amarilla': ['tikhaya-lyubov', 'ti-amo-in-silenzio'],
    'casa-grande': ['grustnyj-gorod', 'la-citta-triste', 'karnaval-sinei'],
    'puerto-viejo': None,
    'ayuntamiento': None,
}


def main():
    cat = json.load(open(os.path.join(LIT, 'novels', 'catalog.json')))['novels']
    cat = {n['slug']: n for n in cat}
    textos, titulos = {}, {}
    seg = _SEG
    for slug in NOVELAS:
        n = cat[slug]
        k = e = 0
        for c in n['chapters']:
            f = c['file']
            if c.get('label'):
                e += 1; sg = f'extra-{e}'
            else:
                k += 1; sg = str(k)
            seg[(slug, f)] = sg
            titulos[(slug, f)] = c.get('title', '')
            p = os.path.join(LIT, 'novels', slug, f)
            if os.path.exists(p):
                t = open(p, encoding='utf-8').read()
                # glosario de las novelas para estudiantes: **palabra**{traducción|...}
                t = re.sub(r'\*\*([^*\n]+)\*\*\{[^}\n]*\}', r'\1', t).replace('**', '')
                textos[(slug, f)] = t
    os.makedirs(os.path.join(ROOT, 'img', 'lugares'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'img', 'portadas'), exist_ok=True)
    salida, usadas = {}, set()
    for ciudad, cfg in CIUDADES.items():
        print(f'== {ciudad}')
        salida[ciudad] = procesar(cfg, textos, titulos, seg, usadas)

    novelas = {}
    for slug in usadas:
        n = cat[slug]
        portada = reducir(os.path.join(LIT, n['cover']), os.path.join('img', 'portadas', slug + '.webp'), 180) if n.get('cover') else None
        novelas[slug] = {'t': n['title'], 'es': NOVELAS[slug] or n['title'], 'l': n['lang'], 'y': n.get('year'),
                         'ru': n['title'] if n['lang'] == 'ru' else NOVELAS_RU.get(slug, n['title']), 'p': portada, 'tr': n.get('translations') or {}}
    js = ('// Generado por tools/build.py a partir de data/ y de litmir. No editar a mano.\n'
          'export const CIUDADES = ' + json.dumps(salida, ensure_ascii=False, indent=0) + ';\n'
          'export const NOVELAS = ' + json.dumps(novelas, ensure_ascii=False, indent=0) + ';\n'
          'export const IDIOMAS = ' + json.dumps(LANG, ensure_ascii=False) + ';\n'
          'export const IDIOMAS_RU = ' + json.dumps(LANG_RU, ensure_ascii=False) + ';\n')
    open(os.path.join(ROOT, 'js', 'datos.js'), 'w', encoding='utf-8').write(js)
    print(f"{sum(len(v) for v in salida.values())} lugares, {len(novelas)} novelas")


def procesar(cfg, textos, titulos, seg, usadas):
    d = os.path.join(ROOT, cfg['dir'])
    lugares = json.load(open(os.path.join(d, 'lugares.json')))['lugares']
    ru = json.load(open(os.path.join(d, 'lugares.ru.json')))
    resenas = json.load(open(os.path.join(d, 'resenas.json')))
    ids = {L['id'] for L in lugares}
    for k in resenas:
        if not k.startswith('_') and k not in ids:
            print('  reseñas para un lugar que no existe:', k)
    novs = cfg['novelas'] or list(NOVELAS)
    out = []
    for L in lugares:
        if cfg.get('geo'):
            L['x'], L['y'] = geo_xy(L, cfg['geo'])
        rx = re.compile(L['buscar'], re.I) if L.get('buscar') else None
        solo = L.get('solo') or SOLO.get(L['id'])
        excl = set(L.get('excluir') or [])
        hits = collections.OrderedDict(); primera = {}
        rangos = cfg.get('rangos') or {}
        excl_caps = L.get('excluir_caps') or {}
        def ok(slug, f):
            if slug not in novs or slug in excl or (solo and slug not in solo):
                return False
            if f[:2].isdigit() and int(f[:2]) in excl_caps.get(slug, []):
                return False
            if slug in rangos:
                num = int(f[:2]) if f[:2].isdigit() else 0
                return any(a <= num <= b for a, b in rangos[slug])
            return True
        if rx:
            for (slug, f), t in textos.items():
                if not ok(slug, f):
                    continue
                m = rx.search(t)
                if m:
                    hits.setdefault(slug, []).append(f); primera.setdefault((slug, f), m.start())
        for slug, r2 in (L.get('buscar_en') or {}).items():
            r2 = re.compile(r2, re.I)
            for (s2, f), t in textos.items():
                if s2 == slug and ok(slug, f):
                    m = r2.search(t)
                    if m and f not in hits.setdefault(slug, []):
                        hits[slug].append(f); primera.setdefault((slug, f), m.start())
        for slug, nums in (L.get('extra') or {}).items():
            for num in nums:
                f = f'{num:02d}.md'
                if f not in hits.setdefault(slug, []):
                    hits[slug].append(f)
        apar = []
        for slug in NOVELAS:
            if not hits.get(slug):
                continue
            cs = [[seg.get((slug, f), f[:-3].lstrip('0')), titulos.get((slug, f), '')] for f in set(hits[slug])]
            cs.sort(key=lambda c: (c[0].startswith('extra'), int(re.sub(r'\D', '', c[0]) or 0)))
            apar.append({'n': slug, 'c': cs})
            usadas.add(slug)
        apar.sort(key=lambda a: -len(a['c']))
        if L.get('sin_ilustracion'):
            img = None
        elif L.get('ilustracion'):
            sl, fn = L['ilustracion']
            r = reducir(os.path.join(LIT, 'novels', sl, 'img', fn), os.path.join('img', 'lugares', L['id'] + '.webp'), 640)
            cap = re.search(r'(\d+)', fn).group(1).zfill(2)  # «05-x.jpg» o «cap05-l3-04.jpg»
            for f in sorted(os.listdir(os.path.join(LIT, 'novels', sl))):  # mejor: el capítulo que de verdad muestra la imagen
                if f.endswith('.md') and ('img/' + fn) in open(os.path.join(LIT, 'novels', sl, f), encoding='utf-8').read(): cap = f[:-3]; break
            img = {'src': r, 'n': sl, 'c': seg_of(sl, cap + '.md')} if r else None
        else:
            img = elegir_ilustracion(L['id'], apar, hits, primera, textos)
        o = {k: L[k] for k in ('id', 'nombre', 'otros', 'cat', 'x', 'y', 'modelo', 'borde', 'linea', 'num', 'desc') if k in L}
        if L['id'] in ru:
            o['nombre_ru'] = ru[L['id']]['nombre']; o['desc_ru'] = ru[L['id']]['desc']
        else:
            print('  FALTA traducción rusa:', L['id'])
        o['apar'] = apar
        if resenas.get(L['id']):
            o['res'] = resenas[L['id']]
        if img:
            o['img'] = img
        out.append(o)
        print(f"  {o['id']:24} {sum(len(a['c']) for a in o['apar']):3} caps en {len(o['apar']):2} novelas  {'img' if o.get('img') else '---'}")
    return out


IMG_RX = re.compile(r'!\[[^\]]*\]\((novels/[^)]+\.(?:jpe?g|png|webp))\)', re.I)


def elegir_ilustracion(pid, apar, hits, primera, textos):
    # la novela con más capítulos primero; dentro del capítulo, la imagen más cercana a la mención
    for a in apar:
        slug = a['n']
        for f in sorted(set(hits.get(slug, []))):
            t = textos.get((slug, f))
            if not t:
                continue
            pos = primera.get((slug, f), 0)
            ims = [(abs(m.start() - pos), m.group(1)) for m in IMG_RX.finditer(t)]
            for _, rel in sorted(ims):
                p = os.path.join(LIT, rel)
                if os.path.exists(p):
                    r = reducir(p, os.path.join('img', 'lugares', pid + '.webp'), 640)
                    if r:
                        return {'src': r, 'n': slug, 'c': seg_of(slug, f)}
    return None


_SEG = {}


def seg_of(slug, f):
    return _SEG.get((slug, f), f[:-3].lstrip('0'))


def reducir(src, dst_rel, w):
    try:
        from PIL import Image
        im = Image.open(src).convert('RGB')
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        im.save(os.path.join(ROOT, dst_rel), 'WEBP', quality=72, method=6)
        return dst_rel
    except Exception as e:
        print('  (sin imagen)', src, e)
        return None


if __name__ == '__main__':
    main()
