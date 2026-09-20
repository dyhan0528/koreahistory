/* 앱에 넣는 태극기와 같은 기하를 픽셀로 찍어 눈으로 확인한다.
   국기는 틀리면 바로 보이므로, 수치를 바꿀 때마다 이 스크립트를 돌려 확인한다.
   사용: node tools/verify-flag.js  →  flag-check.png */
const fs = require("fs"), zlib = require("zlib"), path = require("path");
const G = require(path.join(__dirname, "flag-geom.js"));

const W = 300, H = 200, S = 3, SS = 3;
const WHITE = [255,255,255], HONG = [0xCD,0x2E,0x3A], CHEONG = [0x0B,0x4D,0xA2], HEUK = [0x14,0x16,0x1B];
const rad = d => d * Math.PI / 180;

function inBar(lx, ly, bits){
  for(let i = 0; i < 3; i++){
    if(Math.abs(ly - (i - 1) * G.BARY) > G.TH / 2) continue;
    if(bits[i] === 1) return lx >= -G.LEN/2 && lx <= G.LEN/2;
    if(lx >= -G.LEN/2 && lx <= -G.LEN/2 + G.SEG) return true;
    if(lx >= G.LEN/2 - G.SEG && lx <= G.LEN/2) return true;
  }
  return false;
}

function colorAt(fx, fy){
  for(const g of G.GWAE){
    const a = rad(-g.rot), dx = fx - g.cx, dy = fy - g.cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    if(inBar(lx, ly, g.bits)) return HEUK;
  }
  // 태극 — 분할축은 수평이다. v는 위쪽이 양수.
  const u = fx - 150, v = -(fy - 100);
  if(u*u + v*v <= G.R*G.R){
    const h = G.R / 2;
    const inL = (u + h)*(u + h) + v*v < h*h;
    const inR = (u - h)*(u - h) + v*v < h*h;
    return (inL || (v > 0 && !inR)) ? HONG : CHEONG;
  }
  return WHITE;
}

const iw = W*S, ih = H*S, rgb = Buffer.alloc(iw*ih*3);
for(let y = 0; y < ih; y++) for(let x = 0; x < iw; x++){
  let r = 0, g = 0, b = 0;
  for(let sy = 0; sy < SS; sy++) for(let sx = 0; sx < SS; sx++){
    const c = colorAt((x + (sx+0.5)/SS)/S, (y + (sy+0.5)/SS)/S);
    r += c[0]; g += c[1]; b += c[2];
  }
  const i = (y*iw + x)*3, n = SS*SS;
  rgb[i] = Math.round(r/n); rgb[i+1] = Math.round(g/n); rgb[i+2] = Math.round(b/n);
}

let TB = null;
const ct = () => { if(TB) return TB; TB = new Int32Array(256);
  for(let n = 0; n < 256; n++){ let c = n; for(let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); TB[n] = c; }
  return TB; };
const crc = b => { const t = ct(); let c = -1; for(let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length, 0);
  const td = Buffer.concat([Buffer.from(ty, "ascii"), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td), 0);
  return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(iw, 0); ihdr.writeUInt32BE(ih, 4); ihdr[8] = 8; ihdr[9] = 2;
const raw = Buffer.alloc(ih*(iw*3 + 1));
for(let y = 0; y < ih; y++) rgb.copy(raw, y*(iw*3 + 1) + 1, y*iw*3, (y+1)*iw*3);
fs.writeFileSync(path.join(process.cwd(), "flag-check.png"), Buffer.concat([
  Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
  chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, {level:9})), chunk("IEND", Buffer.alloc(0))
]));
console.log("flag-check.png", iw + "x" + ih);
console.log("괘 중심:", G.GWAE.map(g => `${g.name}(${g.cx.toFixed(1)},${g.cy.toFixed(1)}) ${g.rot.toFixed(2)}도`).join("  "));
