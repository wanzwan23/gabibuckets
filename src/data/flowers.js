export const flowers = [
  { id: 'anemone', name: 'Anemone', image: '/color/flowers/anemone.png', monoImage: '/mono/flowers/anemone.png', meaning: 'Anticipation and excitement' },
  { id: 'carnation', name: 'Carnation', image: '/color/flowers/carnation.png', monoImage: '/mono/flowers/carnation.png', meaning: 'Fascination and love' },
  { id: 'dahlia', name: 'Dahlia', image: '/color/flowers/dahlia.png', monoImage: '/mono/flowers/dahlia.png', meaning: 'Elegance and inner strength' },
  { id: 'daisy', name: 'Daisy', image: '/color/flowers/daisy.png', monoImage: '/mono/flowers/daisy.png', meaning: 'Innocence and purity' },
  { id: 'lily', name: 'Lily', image: '/color/flowers/lily.png', monoImage: '/mono/flowers/lily.png', meaning: 'Pure love and devotion' },
  { id: 'orchid', name: 'Orchid', image: '/color/flowers/orchid.png', monoImage: '/mono/flowers/orchid.png', meaning: 'Refinement and rare beauty' },
  { id: 'peony', name: 'Peony', image: '/color/flowers/peony.png', monoImage: '/mono/flowers/peony.png', meaning: 'Romance and prosperity' },
  { id: 'ranunculus', name: 'Ranunculus', image: '/color/flowers/ranunculus.png', monoImage: '/mono/flowers/ranunculus.png', meaning: 'Charm and attractiveness' },
  { id: 'rose', name: 'Rose', image: '/color/flowers/rose.png', monoImage: '/mono/flowers/rose.png', meaning: 'Passion and true love' },
  { id: 'sunflower', name: 'Sunflower', image: '/color/flowers/sunflower.png', monoImage: '/mono/flowers/sunflower.png', meaning: 'Adoration and loyalty' },
  { id: 'tulip', name: 'Tulip', image: '/color/flowers/tulip.png', monoImage: '/mono/flowers/tulip.png', meaning: 'Perfect deep love' },
  { id: 'zinnia', name: 'Zinnia', image: '/color/flowers/zinnia.png', monoImage: '/mono/flowers/zinnia.png', meaning: 'Endurance and lasting affection' },
];

export const bushImages = {
  color: [
    { base: '/color/bush/bush-1.png', top: '/color/bush/bush-1-top.png' },
    { base: '/color/bush/bush-2.png', top: '/color/bush/bush-2-top.png' },
    { base: '/color/bush/bush-3.png', top: '/color/bush/bush-3-top.png' },
  ],
  mono: [
    { base: '/mono/bush/bush-2.png', top: '/mono/bush/bush-2-top.png' },
  ],
};

// Legacy export for backward compatibility
export const greeneryImages = [
  '/color/bush/bush-1.png',
  '/color/bush/bush-2.png',
  '/color/bush/bush-3.png',
];

export const greeneryTopImages = [
  '/color/bush/bush-1-top.png',
  '/color/bush/bush-2-top.png',
  '/color/bush/bush-3-top.png',
];

export const monoGreeneryImages = [
  '/mono/bush/bush-2.png',
];

export const monoGreeneryTopImages = [
  '/mono/bush/bush-2-top.png',
];

// Pre-made bouquets for the garden
export const gardenBouquets = [
  {
    id: 1,
    flowers: ['rose', 'rose', 'carnation', 'daisy', 'lily', 'zinnia', 'orchid', 'peony'],
    greeneryIndex: 0,
    seed: 12345,
    creator: 'Flora',
  },
  {
    id: 2,
    flowers: ['sunflower', 'rose', 'dahlia', 'orchid', 'daisy', 'ranunculus', 'anemone', 'carnation'],
    greeneryIndex: 1,
    seed: 67890,
    creator: 'Ivy',
  },
  {
    id: 3,
    flowers: ['tulip', 'tulip', 'peony', 'rose', 'lily', 'orchid', 'daisy', 'carnation'],
    greeneryIndex: 2,
    seed: 11223,
    creator: 'Rosemary',
  },
  {
    id: 4,
    flowers: ['zinnia', 'sunflower', 'dahlia', 'ranunculus', 'anemone', 'carnation', 'rose', 'lily'],
    greeneryIndex: 0,
    seed: 44556,
    creator: 'Dahlia',
  },
  {
    id: 5,
    flowers: ['rose', 'peony', 'ranunculus', 'dahlia', 'carnation', 'orchid', 'tulip', 'daisy'],
    greeneryIndex: 1,
    seed: 77889,
    creator: 'Sage',
  },
  {
    id: 6,
    flowers: ['lily', 'anemone', 'sunflower', 'zinnia', 'rose', 'daisy', 'dahlia', 'carnation'],
    greeneryIndex: 2,
    seed: 99001,
    creator: 'Violet',
  },
  {
    id: 7,
    flowers: ['orchid', 'orchid', 'ranunculus', 'peony', 'rose', 'tulip', 'dahlia'],
    greeneryIndex: 0,
    seed: 33221,
    creator: 'Lily',
  },
  {
    id: 8,
    flowers: ['sunflower', 'sunflower', 'daisy', 'daisy', 'zinnia', 'anemone', 'carnation', 'lily'],
    greeneryIndex: 1,
    seed: 55443,
    creator: 'Poppy',
  },
  {
    id: 9,
    flowers: ['rose', 'rose', 'rose', 'peony', 'peony', 'ranunculus', 'tulip'],
    greeneryIndex: 2,
    seed: 66778,
    creator: 'Jasmine',
  },
  {
    id: 10,
    flowers: ['lily', 'lily', 'orchid', 'carnation', 'daisy', 'anemone', 'zinnia', 'dahlia'],
    greeneryIndex: 0,
    seed: 88990,
    creator: 'Heather',
  },
  {
    id: 11,
    flowers: ['tulip', 'tulip', 'tulip', 'sunflower', 'dahlia', 'ranunculus', 'peony'],
    greeneryIndex: 1,
    seed: 11334,
    creator: 'Iris',
  },
  {
    id: 12,
    flowers: ['anemone', 'orchid', 'rose', 'zinnia', 'carnation', 'lily', 'sunflower', 'daisy', 'peony'],
    greeneryIndex: 2,
    seed: 22556,
    creator: 'Fern',
  },
];

export function getFlowerById(id) {
  return flowers.find(f => f.id === id);
}
