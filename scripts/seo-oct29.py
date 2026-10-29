"""Oct 29 2026 SEO pass (Hannes): every product gets a keyword-led meta description (products.blurb, <=160 chars:
what it is, the design, the verse, the format, ships worldwide) so Google, Meta, TikTok search and AI shopping agents
read it properly. The longer story copy (description) stays as written. Placeholder products are skipped.
  python -I scripts/seo-oct29.py [--apply]"""
import json, sys, urllib.request, pathlib
sys.stdout.reconfigure(encoding='utf-8')
APPLY = '--apply' in sys.argv
env = {}
for l in open(pathlib.Path(__file__).resolve().parents[1] / '.env', encoding='utf-8'):
    l = l.strip()
    if '=' in l and not l.startswith('#'): k, v = l.split('=', 1); env[k] = v.strip().strip('"')
SB, SVC = env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']
KEY = (pathlib.Path.home() / 'burg-avatar' / 'tabor_agent_key.txt').read_text().strip()
H = {'apikey': SVC, 'Authorization': 'Bearer ' + SVC, 'Content-Type': 'application/json'}

DESIGN = {   # base sku -> (design name, what it shows)
    'for-the-king': ('For the King', 'a winged cross for the King of kings, Revelation 19:16'),
    'respawned': ('Respawned', 'born again in gamer language, John 3:3'),
    'status-son-of-the-king': ('Status: Son of the King', 'your status in Christ as a game stat screen, 1 John 3:1'),
    'the-faceless': ('The Faceless', 'a faceless knight with a war hammer under the cross'),
    'the-risen-knight': ('The Risen Knight', 'an armoured knight rising in holy light toward the cross'),
}
KIND = {   # suffix -> (search phrase, format line)
    'tee': ('Christian graphic tee', 'Black back-print tee'),
    'long-sleeve': ('Christian long sleeve shirt', 'Black back-print long sleeve'),
    'hoodie': ('Christian hoodie', 'Black pullover hoodie, back print'),
    'sweater': ('Christian crewneck sweatshirt', 'Black crewneck, back print'),
    'flag': ('Christian wall flag', 'All-over printed flag'),
    'blanket': ('Christian throw blanket', '60x80 woven throw'),
    'sticker': ('Christian sticker', '5.5 inch kiss-cut vinyl'),
}
def split(sku):
    for k in KIND:
        if k != 'tee' and sku.endswith('-' + k): return sku[: -len(k) - 1], k
    return {'the-faceless-tee': 'the-faceless'}.get(sku, sku), 'tee'

rows = json.load(urllib.request.urlopen(urllib.request.Request(f'{SB}/rest/v1/products?select=sku,status,note,blurb&order=sku', headers=H)))
for r in rows:
    if str(r.get('note') or '').startswith('ARCHIVED'): continue
    base, kind = split(r['sku'])
    if base not in DESIGN: print('skip (no design copy):', r['sku']); continue
    name, shows = DESIGN[base]; phrase, fmt = KIND[kind]
    blurb = f"{name} {phrase} by TABOR: {shows}. {fmt}, printed on demand, ships worldwide."
    if len(blurb) > 160: blurb = f"{name} {phrase} by TABOR: {shows}. {fmt}, ships worldwide."
    print(f"{len(blurb):3} {r['sku']:36} {blurb}")
    if APPLY:
        urllib.request.urlopen(urllib.request.Request(f"{SB}/rest/v1/products?sku=eq.{r['sku']}", data=json.dumps({'blurb': blurb}).encode(), method='PATCH', headers=H)).read()
        urllib.request.urlopen(urllib.request.Request('https://tabor.quest/api/agent/products', data=json.dumps({'action': 'status', 'sku': r['sku'], 'status': r['status']}).encode(), method='POST',
                               headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'User-Agent': 'BurgerBot-seo'})).read()
