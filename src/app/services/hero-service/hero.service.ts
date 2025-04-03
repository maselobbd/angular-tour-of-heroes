import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { Hero } from '../../models/hero';
import { MessageService } from '../messages/message.service';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroesUrl = 'api/heroes'; 
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, 
    private messageService: MessageService) { }

  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions)
            .pipe(
              tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
              catchError(this.handleError<Hero>('Add hero'))
            );
  }

  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), 
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`get hero id=${id}`))
      );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    const hero = this.http.get<Hero>(url)
                    .pipe(
                      tap(_ => this.log(`fetched hero id=${id}`)),
                      catchError(this.handleError<Hero>(`get hero id=${id}`))
                    );
    return hero;
  }

  getHeroes(): Observable<Hero[]> {
    const heroes = this.http.get<Hero[]>(this.heroesUrl)
                    .pipe(
                      tap(_ => this.log('fetched heroes')),
                      catchError(this.handleError<Hero[]>('get heroes', []))
                    );
    return heroes;
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions)
              .pipe(
                tap(_ => this.log(`updated hero id=${hero.id}`)),
                catchError(this.handleError<any>('updateHero'))
              );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
              .pipe(
                tap(x => x.length ?
                  this.log(`found heroes matching "${term}"`) :
                  this.log(`no heroes matching "${term}"`)),
                catchError(this.handleError<Hero[]>('search heroes', []))
              );
  }

  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions)
              .pipe(
                tap(_ => this.log(`deleted hero id=${id}`)),
                catchError(this.handleError<Hero>('delete hero'))
              );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      console.error(error); 
      
      this.log(`Failed to ${operation}: ${error.message}`);
  
      return of(result as T);
    };
  }
  
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
