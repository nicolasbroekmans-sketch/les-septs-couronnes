// Relief de Port-Réal (partagé par la scène, ses détails et les données de région).
export const hill = (x, z, cx, cz, r, h) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));
export const height = (x, z) => {
  const slope = 1.2 + Math.max(0, 60 - z) * .15;
  // collines d'Aegon (Donjon Rouge, sud-est au-dessus de la baie), de Visenya (Septuaire, ouest), de Rhaenys (Fosse aux Dragons, nord-est)
  let land = slope + hill(x, z, 125, 10, 34, 18) + hill(x, z, -70, -62, 30, 11) + hill(x, z, 95, -118, 28, 9) + Math.sin(x * .05) * Math.cos(z * .04) * 1.2;
  if (x < -172) land -= 9 * Math.min(1, Math.max(0, (z - 22) / 14)); // la Néra contourne la ville au sud-ouest
  const t = Math.min(1, Math.max(0, (z - 60) / 10));
  return land * (1 - t) - 5 * t;
};

