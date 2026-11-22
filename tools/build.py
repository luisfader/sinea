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
}
LANG = {'ru': 'ruso', 'es': 'español', 'it': 'italiano', 'fr': 'francés', 'en': 'inglés', 'tr': 'turco'}
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
    'puerto-viejo': None,
    'ayuntamiento': None,
}


def main():
    cat = json.load(open(os.path.join(LIT, 'novels', 'catalog.json')))['novels']
    cat = {n['slug']: n for n in cat}
    src = json.load(open(os.path.join(ROOT, 'data', 'lugares.json')))
    lugares = src['lugares']

    # textos y rutas de capítulos
    textos, titulos = {}, {}
    seg = _SEG
    for slug in NOVELAS:
        n = cat[slug]
        k = e = 0
        for c in n['chapters']:
            f = c['file']
            if c.get('label'):
                e += 1; s = f'extra-{e}'
            else:
                k += 1; s = str(k)
            seg[(slug, f)] = s
            titulos[(slug, f)] = c.get('title', '')
            p = os.path.join(LIT, 'novels', slug, f)
            if os.path.exists(p):
                t = open(p, encoding='utf-8').read()
                # glosario de las novelas para estudiantes: **palabra**{traducción|...}
                t = re.sub(r'\*\*([^*\n]+)\*\*\{[^}\n]*\}', r'\1', t).replace('**', '')
                textos[(slug, f)] = t

    out_lugares, usadas = [], set()
    os.makedirs(os.path.join(ROOT, 'img', 'lugares'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'img', 'portadas'), exist_ok=True)
    for L in lugares:
        rx = re.compile(L['buscar'], re.I) if L.get('buscar') else None
        solo = SOLO.get(L['id'])
        hits = collections.OrderedDict()
        primera = {}
        if rx:
            for (slug, f), t in textos.items():
                if solo and slug not in solo:
                    continue
                m = rx.search(t)
                if m:
                    hits.setdefault(slug, []).append(f)
                    primera.setdefault((slug, f), m.start())
        for slug, r2 in (L.get('buscar_en') or {}).items():
            r2 = re.compile(r2, re.I)
            for (s2, f), t in textos.items():
                if s2 == slug:
                    m = r2.search(t)
                    if m and f not in hits.setdefault(slug, []):
                        hits[slug].append(f); primera.setdefault((slug, f), m.start())
        for slug, nums in (L.get('extra') or {}).items():
            for num in nums:
                f = f'{num:02d}.md'
                if f not in hits.setdefault(slug, []):
                    hits[slug].append(f)
        apar = []
        for slug in NOVELAS:  # orden fijo
            if slug not in hits:
                continue
            cs = [[seg.get((slug, f), f[:-3].lstrip('0')), titulos.get((slug, f), '')] for f in set(hits[slug])]
            cs.sort(key=lambda c: (c[0].startswith('extra'), int(re.sub(r'\D', '', c[0]) or 0)))
            apar.append({'n': slug, 'c': cs})
            usadas.add(slug)
        apar.sort(key=lambda a: -len(a['c']))
        if L.get('ilustracion'):
            sl, fn = L['ilustracion']
            rel = os.path.join('novels', sl, 'img', fn)
            r = reducir(os.path.join(LIT, rel), os.path.join('img', 'lugares', L['id'] + '.webp'), 640)
            img = {'src': r, 'n': sl, 'c': seg_of(sl, fn.split('-')[0].split('.')[0] + '.md')} if r else None
        else:
            img = elegir_ilustracion(L['id'], apar, hits, primera, textos)
        o = {k: L[k] for k in ('id', 'nombre', 'otros', 'cat', 'x', 'y', 'modelo', 'desc') if k in L}
        o['apar'] = apar
        if img:
            o['img'] = img
        out_lugares.append(o)

    novelas = {}
    for slug in usadas:
        n = cat[slug]
        portada = reducir(os.path.join(LIT, n['cover']), os.path.join('img', 'portadas', slug + '.webp'), 180) if n.get('cover') else None
        novelas[slug] = {'t': n['title'], 'es': NOVELAS[slug] or n['title'], 'l': n['lang'], 'y': n.get('year'),
                         'p': portada, 'tr': n.get('translations') or {}}
    js = ('// Generado por tools/build.py a partir de data/lugares.json y de litmir. No editar a mano.\n'
          'export const LUGARES = ' + json.dumps(out_lugares, ensure_ascii=False, indent=0) + ';\n'
          'export const NOVELAS = ' + json.dumps(novelas, ensure_ascii=False, indent=0) + ';\n'
          'export const IDIOMAS = ' + json.dumps(LANG, ensure_ascii=False) + ';\n')
    open(os.path.join(ROOT, 'js', 'datos.js'), 'w', encoding='utf-8').write(js)
    print(f'{len(out_lugares)} lugares, {len(novelas)} novelas')
    for o in out_lugares:
        print(f"  {o['id']:24} {sum(len(a['c']) for a in o['apar']):3} caps en {len(o['apar']):2} novelas  {'img' if o.get('img') else '---'}")


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
