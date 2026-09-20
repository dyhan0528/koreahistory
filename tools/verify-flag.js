/* part-c.js의 태극기와 같은 기하를 픽셀로 찍어 눈으로 확인한다 */
const fs = require("fs"), zlib = require("zlib");
const W = 300, H = 200, S = 2, SS = 2;
const WHITE=[255,255,255], HONG=[0xCD,0x2E,0x3A], CHEONG=[0x0B,0x4D,0xA2], HEUK=[0x14,0x16,0x1B];
const T = 200/30, LEN = 50, SEG = 50/3;
const rad = d => d * Math.PI / 180;
const GW = [
  [56.81, 37.87, -56.31, [1,1,1]],
  [243.19, 37.87, 56.31, [0,1,0]],
  [56.81, 162.13, 56.31, [1,0,1]],
  [243.19, 162.13, -56.31, [0,0,0]]
];
function inBar(lx, ly, bits){
  for(let i = 0; i < 3; i++){
    const yc = (i - 1) * T * 2;
    if(Math.abs(ly - yc) > T/2) continue;
    if(bits[i] === 1) return lx >= -LEN/2 && lx <= LEN/2;
    if(lx >= -LEN/2 && lx <= -LEN/2 + SEG) return true;
    if(lx >= SEG/2 && lx <= SEG/2 + SEG) return true;
  }
  return false;
}
function px(fx, fy){
  for(const [cx, cy, rot, bits] of GW){
    const a = rad(-rot), dx = fx - cx, dy = fy - cy;
    if(inBar(dx*Math.cos(a) - dy*Math.sin(a), dx*Math.sin(a) + dy*Math.cos(a), bits)) return HEUK;
  }
  const a = rad(-33.69), dx = fx - 150, dy = fy - 100;
  const u = dx*Math.cos(a) - dy*Math.sin(a), v = -(dx*Math.sin(a) + dy*Math.cos(a));
  if(u*u + v*v <= 2500){
    const inL = (u+25)*(u+25) + v*v < 625, inR = (u-25)*(u-25) + v*v < 625;
    return (inL || (v > 0 && !inR)) ? HONG : CHEONG;
  }
  return WHITE;
}
const rgb = Buffer.alloc(W*S*H*S*3);
for(let y = 0; y < H*S; y++) for(let x = 0; x < W*S; x++){
  let r=0,g=0,b=0;
  for(let sy=0; sy<SS; sy++) for(let sx=0; sx<SS; sx++){
    const c = px((x + (sx+0.5)/SS)/S, (y + (sy+0.5)/SS)/S);
    r+=c[0]; g+=c[1]; b+=c[2];
  }
  const i=(y*W*S+x)*3, n=SS*SS;
  rgb[i]=Math.round(r/n); rgb[i+1]=Math.round(g/n); rgb[i+2]=Math.round(b/n);
}
let TB=null; const ct=()=>{ if(TB) return TB; TB=new Int32Array(256);
  for(let n=0;n<256;n++){let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); TB[n]=c;} return TB; };
const crc=b=>{const t=ct(); let c=-1; for(let i=0;i<b.length;i++) c=t[(c^b[i])&0xFF]^(c>>>8); return (c^-1)>>>0;};
const chunk=(ty,d)=>{const l=Buffer.alloc(4); l.writeUInt32BE(d.length,0);
  const td=Buffer.concat([Buffer.from(ty,"ascii"),d]); const c=Buffer.alloc(4); c.writeUInt32BE(crc(td),0);
  return Buffer.concat([l,td,c]);};
const iw=W*S, ih=H*S, ihdr=Buffer.alloc(13);
ihdr.writeUInt32BE(iw,0); ihdr.writeUInt32BE(ih,4); ihdr[8]=8; ihdr[9]=2;
const raw=Buffer.alloc(ih*(iw*3+1));
for(let y=0;y<ih;y++) rgb.copy(raw, y*(iw*3+1)+1, y*iw*3, (y+1)*iw*3);
fs.writeFileSync("flag-check.png", Buffer.concat([
  Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
  chunk("IHDR",ihdr), chunk("IDAT", zlib.deflateSync(raw,{level:9})), chunk("IEND",Buffer.alloc(0))
]));
console.log("flag-check.png", iw+"x"+ih);
