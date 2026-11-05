// Relief de Port-Réal (partagé par la scène, ses détails et les données de région).
export const hill = (x, z, cx, cz, r, h) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));
export const height = (x, z) => {
  const slope = 1.2 + Math.max(0, 60 - z) * .15;
  const land = slope + hill(x, z, 55, -115, 32, 13) + hill(x, z, -70, -62, 30, 7) + Math.sin(x * .05) * Math.cos(z * .04) * 1.2;
  const t = Math.min(1, Math.max(0, (z - 60) / 10));
  return land * (1 - t) - 5 * t;
};

