import { TierMaker } from './tierMaker.js';

const tierMaker = new TierMaker();

window.tierMaker = tierMaker;
window.fullViewMode = tierMaker.fullViewMode;
window.elementModal = tierMaker.elementModal;

console.log('🏆 Pick Tier application loaded successfully!');