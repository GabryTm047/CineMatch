import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilmResponse } from '../shared/film.interface';

@Injectable({ providedIn: 'root' })
export class FilmService {
  page : number = 1;
  genreId : number = 12;
  private apiUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=it-IT&page=1&sort_by=popularity.desc&with_genres=12&with_original_language=it%7Cen`;
  private readonly apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZDNhY2ZkMGU5M2IxZTg1ZTRlYTc0NGY4YjY1MGE3ZiIsIm5iZiI6MTc2MTkxMDUzNC45NjYsInN1YiI6IjY5MDQ5ZjA2YWQxNDNjM2RkMGRkNzkxMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.q3MK6-kSveHovhcZbBYNGk1oHZ9x65Fs7fyUoKubqB4';

  constructor(private http: HttpClient) {}

  buildApiUrl(genreId?: number, page?: number): string {
    this.apiUrl.replace(/with_genres=\d+/, `with_genres=${genreId ?? this.genreId}`);
    this.apiUrl.replace(/page=\d+/, `page=${page ?? this.page}`);
    return this.apiUrl;
}

  getMoviesByGenre(genreId: number,page?: number): Observable<FilmResponse> {
    const url = this.buildApiUrl(genreId, page);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
      accept: 'application/json',
    });

    return this.http.get<FilmResponse>(url, { headers });
  }
}