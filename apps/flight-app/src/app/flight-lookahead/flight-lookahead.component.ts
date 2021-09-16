import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { combineLatest, interval, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, filter, map, pairwise, retry, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css']
})
export class FlightLookaheadComponent implements OnInit {
  fromControl: FormControl;
  toControl: FormControl;

  flights$: Observable<Flight[]>;
  diff$: Observable<number>;
  loading: boolean;

  online = false;
  online$: Observable<boolean>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    /*this.control = new FormControl();
    const input$ = this.control.valueChanges.pipe(debounceTime(300));*/

    this.fromControl = new FormControl();
    const fromInput$ = this.fromControl.valueChanges.pipe(
      debounceTime(300),
      // filter((input) => input.length > 2),
      distinctUntilChanged()
    );

    this.toControl = new FormControl();
    const toInput$ = this.toControl.valueChanges.pipe(
      // filter((input) => input.length > 2),
      distinctUntilChanged()
    );

    /*this.flights$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter((input) => input.length > 2),
      distinctUntilChanged(),
      tap((input) => (this.loading = true)),
      switchMap((input) => this.load(input)),
      tap((v) => (this.loading = false))
    );*/

    this.online$ = interval(2000).pipe(
      startWith(0),
      map((_) => true),
      distinctUntilChanged(),
      tap((value) => (this.online = value))
    );

    this.flights$ = combineLatest([fromInput$, toInput$, this.online$]).pipe(
      filter(([f, t, online]) => (f || t) && online),
      map(([from, to, _]) => [from, to]),
      tap(([from, to]) => (this.loading = true)),
      switchMap(([from, to]) => this.load(from, to)),
      retry(3), // you retry 3 times
      catchError((err) => of([])), // if all fail catch error
      tap((a) => (this.loading = false))
    );

    this.diff$ = this.flights$.pipe(
      pairwise(),
      map(([a, b]) => b.length - a.length)
    );
  }

  load(from: string, to: string = ''): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('from', from).set('to', to);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers });
  }
}
