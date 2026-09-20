/* 태극기 기하 — 국기 제작법의 세로 24등분 격자를 그대로 옮긴다.
   깃면 세로 24u, 가로 36u. viewBox 300x200이므로 1u = 200/24.
     태극 지름 12u (= 세로의 1/2)
     괘 길이 8u, 괘 폭 5u
     획 두께 1u, 획 사이 간격 1u  (1+1+1+1+1 = 5u = 폭)
     음획은 3u + 2u(빈칸) + 3u = 8u = 길이
     괘 중심은 태극 중심에서 대각선으로 6u(태극 반지름) + 2u(간격) + 2.5u(폭 절반) = 10.5u
   4괘는 대각선상에 놓이고 획은 그 대각선과 직각. 건 좌상 · 감 우상 · 리 좌하 · 곤 우하.
   태극 분할축은 건-곤 대각선과 나란하고, 양(홍)의 머리가 건 쪽인 좌상으로 온다. */
const U = 200 / 24;
const R = 6 * U;              // 태극 반지름 50
const LEN = 8 * U;            // 괘 길이 66.667
const TH = 1 * U;             // 획 두께 8.333
const SEG = 3 * U;            // 음획 한 토막 25
const BARY = 2 * U;           // 획 중심 간격 16.667
const D = 10.5 * U;           // 괘 중심까지 거리 87.5
const DIAG = Math.atan2(2, 3) * 180 / Math.PI;   // 33.69 — 3:2 깃면의 대각선 각
const DX = D * Math.cos(DIAG * Math.PI / 180);
const DY = D * Math.sin(DIAG * Math.PI / 180);

const PERP = DIAG - 90;   // 획은 대각선과 직각 → -56.31도
const GWAE = [
  {cx: 150 - DX, cy: 100 - DY, rot: PERP,  bits: [1,1,1], name: "건"},
  {cx: 150 + DX, cy: 100 - DY, rot: -PERP, bits: [0,1,0], name: "감"},
  {cx: 150 - DX, cy: 100 + DY, rot: -PERP, bits: [1,0,1], name: "리"},
  {cx: 150 + DX, cy: 100 + DY, rot: PERP,  bits: [0,0,0], name: "곤"}
];

module.exports = {U, R, LEN, TH, SEG, BARY, D, DIAG, GWAE};
