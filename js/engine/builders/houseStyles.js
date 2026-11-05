// Styles régionaux des maisons : matériaux du rez-de-chaussée, de l'étage (colombages), des toits, teintes,
// fréquence des étages en encorbellement, cheminées, auvents, toits plats. Tous les fichiers sont des textures CC0.
export const STYLES = {
  nord: { base: [['old_stone_wall', '#b8b4ae'], ['medieval_wood', '#a08c74']], upper: [['rough_plaster_03', '#e8e0d0'], ['medieval_wood', '#8a7a64']], roof: [['thatch_roof_angled', '#c8b090'], ['grey_roof_01', '#9aa0a8']],
    beams: '#2e2216', upper2: .7, chimney: .8, awning: .25, roofH: [.62, .8], shutters: '#3a2a1c' },
  couronne: { base: [['rough_plaster_03', '#f0dcc0'], ['medieval_red_brick', '#d8a080'], ['rough_plaster_03', '#e8c8a0']], upper: [['rough_plaster_03', '#f6e6cc'], ['rough_plaster_03', '#ecd4b0']], roof: [['red_slate_roof_tiles_01', '#d88a60'], ['clay_roof_tiles', '#e0a070']],
    beams: '#5a3a22', upper2: .65, chimney: .4, awning: .45, roofH: [.4, .55], shutters: '#2f5a5a', balcony: .3 },
  bief: { base: [['rough_plaster_03', '#fbf6ec'], ['old_stone_wall', '#e8e0d0']], upper: [['rough_plaster_03', '#fffaf0']], roof: [['grey_roof_01', '#7fa0a8'], ['red_slate_roof_tiles_01', '#c08050']],
    beams: '#4a3a2a', upper2: .5, chimney: .5, awning: .35, roofH: [.5, .65], shutters: '#3f6a34', balcony: .25 },
  ouest: { base: [['medieval_blocks_02', '#e8cc98'], ['rough_plaster_03', '#f2dfc0']], upper: [['rough_plaster_03', '#f6e7cf']], roof: [['red_slate_roof_tiles_01', '#c8603a'], ['clay_roof_tiles', '#d88a60']],
    beams: '#4a2a1a', upper2: .6, chimney: .5, awning: .4, roofH: [.45, .6], shutters: '#8b0000', balcony: .3 },
  dorne: { base: [['rough_plaster_03', '#ecc898'], ['rough_plaster_03', '#e0b080'], ['rough_plaster_03', '#f4dcb8']], flat: true, upper2: .35, awning: .6, shutters: '#2f6b70', awnings: ['#d97a2a', '#b0201a', '#e0b050', '#2f6b70'] },
  fer: { base: [['old_stone_wall', '#7a7e84'], ['medieval_wood', '#6a5a4a']], upper: [['medieval_wood', '#5a4a3a']], roof: [['grey_roof_01', '#5a6068'], ['thatch_roof_angled', '#8a8070']],
    beams: '#1e1812', upper2: .3, chimney: .7, awning: .1, roofH: [.7, .9], shutters: '#2a2a2e' },
  essos: { base: [['rough_plaster_03', '#e8b48a'], ['rough_plaster_03', '#d8a0a0'], ['rough_plaster_03', '#a8c0c8'], ['rough_plaster_03', '#e0d090']], upper: [['rough_plaster_03', '#f0e0c8']], roof: [['clay_roof_tiles', '#d88a60'], ['red_slate_roof_tiles_01', '#c87050']],
    beams: '#4a3020', upper2: .55, chimney: .2, awning: .5, roofH: [.35, .5], shutters: '#2f5a6a', balcony: .45 },
  garde: { base: [['medieval_wood', '#6a5a4a'], ['old_stone_wall', '#8a8e94']], upper: [['medieval_wood', '#5a4a3a']], roof: [['grey_roof_01', '#9aa4ac']], beams: '#1e1812', upper2: .2, chimney: .9, awning: 0, roofH: [.7, .85], shutters: '#2a2a2e' }
};
