"""Generate src/components/landing/brand-logos.tsx from fetched logo data."""
import json
import re

logos = json.load(open("/tmp/logos.json"))

attio_svg = open("/tmp/attio.svg").read()
attio_paths = re.findall(r'<path[^>]*d="([^"]+)"', attio_svg)
logos["attio"] = {
    "d": attio_paths,          # list = multi path
    "color": "#e8825f",        # warm coral, attio brand feel
    "viewBox": "0 0 18 18",
}

lines = []
lines.append('/* Real platform logos as inline SVG paths.')
lines.append('   Sources: simple-icons (postgresql, snowflake, databricks, metabase,')
lines.append('   langchain, crewai, notion) and attio.com brand asset (attio). */')
lines.append('')
lines.append('export type Brand = {')
lines.append('  name: string;')
lines.append('  color: string;')
lines.append('  viewBox: string;')
lines.append('  paths: string[];')
lines.append('};')
lines.append('')
lines.append('export const BRANDS = {')
for slug, data in logos.items():
    paths = data["d"] if isinstance(data["d"], list) else [data["d"]]
    vb = data.get("viewBox", "0 0 24 24")
    lines.append(f'  {slug}: {{')
    lines.append(f'    name: "{slug}",')
    lines.append(f'    color: "{data["color"]}",')
    lines.append(f'    viewBox: "{vb}",')
    lines.append('    paths: [')
    for p in paths:
        lines.append(f'      {json.dumps(p)},')
    lines.append('    ],')
    lines.append('  },')
lines.append('} satisfies Record<string, Brand>;')
lines.append('')
lines.append('/* A brand mark positioned inside a larger SVG diagram.')
lines.append('   (x, y) is the top left corner; size is the square side. */')
lines.append('export function BrandMark({')
lines.append('  brand,')
lines.append('  x,')
lines.append('  y,')
lines.append('  size,')
lines.append('}: {')
lines.append('  brand: Brand;')
lines.append('  x: number;')
lines.append('  y: number;')
lines.append('  size: number;')
lines.append('}) {')
lines.append('  const [ , , vw, vh ] = brand.viewBox.split(" ").map(Number);')
lines.append('  const s = size / Math.max(vw, vh);')
lines.append('  const tx = x + (size - vw * s) / 2;')
lines.append('  const ty = y + (size - vh * s) / 2;')
lines.append('  return (')
lines.append('    <g transform={`translate(${tx} ${ty}) scale(${s})`}>')
lines.append('      {brand.paths.map((d, i) => (')
lines.append('        <path key={i} d={d} fill={brand.color} />')
lines.append('      ))}')
lines.append('    </g>')
lines.append('  );')
lines.append('}')
lines.append('')

out = "\n".join(lines)
path = "/home/z/my-project/src/components/landing/brand-logos.tsx"
open(path, "w").write(out)
print(f"wrote {path}, {len(out)} bytes, {len(logos)} brands")
