export function yen(man) {
  if (man >= 10000) return "¥" + (man / 10000).toFixed(man % 10000 === 0 ? 0 : 1) + "億";
  return "¥" + man.toLocaleString() + "万";
}

export function rangeYen(a, b) {
  return yen(a) + "〜" + yen(b);
}

export function sumFlagRange(flags) {
  let lo = 0;
  let hi = 0;
  flags.forEach((f) => {
    if (f.amt) {
      lo += f.amt[0];
      hi += f.amt[1];
    }
  });
  return { lo, hi };
}
