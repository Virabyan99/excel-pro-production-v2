export function addressToCoords(address: string): { row: number; col: number } {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid address: ${address}`);
  const [, colLetters, rowStr] = match;
  const row = parseInt(rowStr, 10) - 1;
  let col = 0;
  for (const char of colLetters) {
    col = col * 26 + (char.charCodeAt(0) - 64);
  }
  return { row, col: col - 1 };
}

export function coordsToAddress(row: number, col: number): string {
  let result = '';
  let c = col + 1;
  while (c > 0) {
    const mod = (c - 1) % 26;
    result = String.fromCharCode(65 + mod) + result;
    c = Math.floor((c - 1) / 26);
  }
  return `${result}${row + 1}`;
}