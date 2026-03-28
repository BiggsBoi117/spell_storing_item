export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const messageArray = [
  "Pondering the orb...",
  "Searching arcane records...",
  "Translating ancient runes...",
  "Excavating old ruins...",
  "Looking over scrolls...",
];

export const randomMessage = () => messageArray[Math.floor(Math.random() * 5)];

export const BASE_API = "https://www.dnd5eapi.co/";
