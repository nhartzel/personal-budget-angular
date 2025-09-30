import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private myBudget: any;

  constructor(private http: HttpClient) { }

  getBudgetData(): Observable<any> {
    if (this.myBudget) {
      return of(this.myBudget);
    } else {
      return this.http.get('http://localhost:3000/budget').pipe(
        tap(res => {
          this.myBudget = res;
        })
      );
    }
  }
}