"""Oct 29 2026 pricing pass (Hannes approved): one price per product for every size, blankets 60x80 only, stickers
5.5in only, crewnecks pulled to draft (their blank, United Athle 5044-01, ships to East Asia only).
Prices are USD base_price; every other currency follows priceFor (FX x 1.03, rounded).
  python -I scripts/pricing-oct29.py          dry run
  python -I scripts/pricing-oct29.py --apply  write + revalidate through the agent door"""
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
def rest(p, body=None, method='GET'):
    req = urllib.request.Request(f'{SB}/rest/v1/{p}', data=json.dumps(body).encode() if body is not None else None, method=method, headers=H)
    with urllib.request.urlopen(req) as r: return json.loads(r.read() or b'null')
def door(body):
    req = urllib.request.Request('https://tabor.quest/api/agent/products', data=json.dumps(body).encode(), method='POST',
                                 headers={'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'User-Agent': 'BurgerBot-pricing'})
    try:
        with urllib.request.urlopen(req) as r: return json.loads(r.read())
    except urllib.error.HTTPError as e: return {'error': e.read().decode()[:200]}

PRICE = {'blanket': 99, 'flag': 40, 'hoodie': 55, 'long-sleeve': 42, 'sticker': 6.99, 'sweater': 49, 'tee': 35}
def kind(sku):
    for k in ('blanket', 'flag', 'hoodie', 'long-sleeve', 'sticker', 'sweater'):
        if sku.endswith('-' + k): return k
    return 'tee'
keep = {'blanket': lambda s: str(s).replace(' ', '').startswith('60'), 'sticker': lambda s: '5.5' in str(s)}

rows = rest('products?select=sku,name,status,base_price,sizes,printful_variants,note&order=sku')
for r in rows:
    if str(r.get('note') or '').startswith('ARCHIVED'): continue
    k = kind(r['sku']); price = PRICE[k]
    vs = r['printful_variants'] or []
    if isinstance(vs, str): vs = json.loads(vs)
    if k in keep:
        kept = [v for v in vs if keep[k](v.get('size'))]
        if not kept: print('!! no matching size, skipped', r['sku']); continue
        vs = kept
    vs = [dict(v, price=price) for v in vs]
    sizes = [v['size'] for v in vs if v.get('size')] if k in keep else r['sizes']
    status = 'draft' if k == 'sweater' else r['status']
    print(f"{r['sku']:40} {r['status']:5} -> {status:5}  ${r['base_price']} -> ${price}  sizes {sizes if k in keep else len(sizes or [])}")
    if APPLY:
        rest(f"products?sku=eq.{r['sku']}", {'base_price': price, 'printful_variants': vs, 'sizes': sizes}, 'PATCH')
        res = door({'action': 'status', 'sku': r['sku'], 'status': status})   # also revalidates the shop + product pages
        if res.get('error'): print('   door:', res['error'])
