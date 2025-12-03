
export interface GenreInfo {
  readonly id: GenreId;
  readonly label: string;
  readonly color: string;
  readonly genreId: number;
}

export type GenreId =
  | `azione`
  | `avventura`
  | `commedia`
  | `dramma`
  | `fantascienza`
  | `horror`
  | `thriller`
  | `animazione`
  | `romantico`
  | `documentario`;

  export const GENRES: GenreInfo[] = [
    { id: `azione`, label: `Azione`, color: `#ef4444`,genreId: 28 },
    { id: `avventura`, label: `Avventura`, color: `#f97316`,genreId: 12 },
    { id: `commedia`, label: `Commedia`, color: `#facc15`,genreId: 35 },
    { id: `dramma`, label: `Dramma`, color: `#60a5fa`,genreId: 18 },
    { id: `fantascienza`, label: `Fantascienza`, color: `#818cf8`,genreId: 878 },
    { id: `horror`, label: `Horror`, color: `#a855f7`,genreId: 36 },
    { id: `thriller`, label: `Thriller`, color: `#f472b6`,genreId: 53 },
    { id: `animazione`, label: `Animazione`, color: `#2dd4bf`,genreId: 16 },
    { id: `romantico`, label: `Romantico`, color: `#fb7185`,genreId: 10749 },
    { id: `documentario`, label: `Documentario`, color: `#38bdf8`,genreId: 99 },
  ];