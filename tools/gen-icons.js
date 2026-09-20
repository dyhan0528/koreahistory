/* 태극 아이콘 PNG 생성 — 의존성 없음 (node 내장 zlib만 사용) */
const fs = require("fs"), zlib = require("zlib"), path = require("path");
const OUT = process.argv[2];

const WHITE = [255, 255, 255];
const HONG  = [0xCD, 0x2E, 0x3A];
const CHEONG= [0x0B, 0x4D, 0xA2];

/* u,v: 원 중심 기준 [-1,1], v는 위쪽이 양수.
   태극기와 같은 구조 — 분할축은 수평, 홍(양)이 위, 청(음)이 아래.
   홍의 머리는 왼쪽에서 아래로, 청의 머리는 오른쪽에서 위로 파고든다. */
function lobe(u, v){
  if(u*u + v*v > 1) return null;
  const h = 0.5;
  const inLeft  = (u + h)*(u + h) + v*v < h*h;   // 홍이 아래로 파고드는 왼쪽 반원
  const inRight = (u - h)*(u - h) + v*v < h*h;   // 청이 위로 파고드는 오른쪽 반원
  return (inLeft || (v > 0 && !inRight)) ? HONG : CHEONG;
}

function render(size, discRatio){
  const px = Buffer.alloc(size * size * 3);
  const R = size * discRatio / 2, cx = size / 2, cy = size / 2;
  const SS = 3, inv = 1 / (SS * SS);
  for(let y = 0; y < size; y++){
    for(let x = 0; x < size; x++){
      let r = 0, g = 0, b = 0;
      for(let sy = 0; sy < SS; sy++){
        for(let sx = 0; sx < SS; sx++){
          const fx = x + (sx + 0.5) / SS, fy = y + (sy + 0.5) / SS;
          const c = lobe((fx - cx) / R, (cy - fy) / R) || WHITE;
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const i = (y * size + x) * 3;
      px[i] = Math.round(r * inv); px[i+1] = Math.round(g * inv); px[i+2] = Math.round(b * inv);
    }
  }
  return px;
}

/* ---- 최소 PNG 인코더 ---- */
let CRC = null;
function crcTable(){
  if(CRC) return CRC;
  CRC = new Int32Array(256);
  for(let n = 0; n < 256; n++){
    let c = n;
    for(let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC[n] = c;
  }
  return CRC;
}
function crc32(buf){
  const t = crcTable(); let c = -1;
  for(let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function png(size, rgb){
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for(let y = 0; y < size; y++){
    raw[y * (size * 3 + 1)] = 0;
    rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  return Buffer.concat([sig, chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, {level:9})), chunk("IEND", Buffer.alloc(0))]);
}

fs.mkdirSync(OUT, {recursive:true});
[[192, 0.62, "icon-192.png"], [512, 0.62, "icon-512.png"],
 [180, 0.66, "apple-touch-icon.png"], [32, 0.84, "favicon-32.png"]]
.forEach(([s, ratio, name]) => {
  fs.writeFileSync(path.join(OUT, name), png(s, render(s, ratio)));
  console.log(name, s + "px");
});
