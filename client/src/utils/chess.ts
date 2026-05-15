import { PiecePosition, FILES, RANKS } from "@/types";

export function fenToPieces(fen: string): PiecePosition[] {
  const pieces: PiecePosition[] = [];
  const [boardPart] = fen.split(" ");

  const rows = boardPart.split("/");
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    let colIdx = 0;
    for (const char of rows[rowIdx]) {
      if (isNaN(Number(char))) {
        const square = `${FILES[colIdx]}${RANKS[rowIdx]}`;
        const color = char === char.toUpperCase() ? "w" : "b";
        pieces.push({
          square,
          type: char.toUpperCase(),
          color,
          row: rowIdx,
          col: colIdx,
        });
        colIdx++;
      } else {
        colIdx += parseInt(char, 10);
      }
    }
  }

  return pieces;
}

export function squareToPosition(square: string): { x: number; z: number } {
  const file = square[0];
  const rank = square[1];
  const col = FILES.indexOf(file);
  const row = RANKS.indexOf(rank);
  return {
    x: col - 3.5,
    z: row - 3.5,
  };
}

export function positionToSquare(x: number, z: number): string {
  const col = Math.round(x + 3.5);
  const row = Math.round(z + 3.5);
  if (col < 0 || col > 7 || row < 0 || row > 7) return "";
  return `${FILES[col]}${RANKS[row]}`;
}

export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

export function isValidSquare(square: string): boolean {
  if (square.length < 2) return false;
  const file = square[0];
  const rank = square[1];
  return FILES.includes(file as any) && RANKS.includes(rank as any);
}
