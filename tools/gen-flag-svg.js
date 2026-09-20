/* 검증한 기하(flag-geom.js)에서 앱에 넣을 태극기 SVG를 뽑는다.
   verify-flag.js와 같은 수치를 쓰므로 검증본과 앱이 어긋날 수 없다.
   사용: node gen-flag-svg.js > flag.svg.txt */
const path = require("path");
const G = require(path.join(__dirname, "flag-geom.js"));
const n = v => Number(v.toFixed(3));

function bars(bits){
  let out = "";
  bits.forEach((b, i) => {
    const y = n((i - 1) * G.BARY - G.TH / 2), h = n(G.TH);
    if(b === 1){
      out += `<rect x="${n(-G.LEN/2)}" y="${y}" width="${n(G.LEN)}" height="${h}"/>`;
    }else{
      out += `<rect x="${n(-G.LEN/2)}" y="${y}" width="${n(G.SEG)}" height="${h}"/>`;
      out += `<rect x="${n(G.LEN/2 - G.SEG)}" y="${y}" width="${n(G.SEG)}" height="${h}"/>`;
    }
  });
  return out;
}

const gwae = G.GWAE.map(g =>
  `<g transform="translate(${n(g.cx)} ${n(g.cy)}) rotate(${n(g.rot)})">${bars(g.bits)}</g>`
).join("");

const h = n(G.R / 2);
const svg =
`<svg viewBox="0 0 300 200" role="img" aria-label="태극기">` +
`<rect width="300" height="200" fill="#FFFFFF"/>` +
`<g transform="translate(150 100) rotate(${n(G.DIAG)})">` +
`<circle r="${n(G.R)}" fill="#0B4DA2"/>` +
`<path d="M ${n(-G.R)},0 A ${n(G.R)},${n(G.R)} 0 0 1 ${n(G.R)},0 A ${h},${h} 0 0 1 0,0 A ${h},${h} 0 0 0 ${n(-G.R)},0 Z" fill="#CD2E3A"/>` +
`</g>` +
`<g fill="#14161B">${gwae}</g>` +
`</svg>`;

process.stdout.write(svg);
