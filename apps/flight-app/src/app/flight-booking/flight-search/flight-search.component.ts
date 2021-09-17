/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Flight, FlightService } from '@flight-workspace/flight-lib';
import { Store } from '@ngrx/store';
import { FlightBookingAppState } from '../+state/flight-booking.reducer';
import { loadFlights, updateFlight } from '../+state/flight-booking.actions';
import { take } from 'rxjs/operators';
import { selectFlightsWithProps } from '../+state/flight-booking.selectors';
import { LocalBasketService } from '../local-basket.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnInit, OnDestroy {
  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;
  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  flights$ = this.store.select(selectFlightsWithProps({ blackList: [3] }));

  locale = 'de'; // caution: for the sake of simplicity we use language as locale here
  private localeSubscription: Subscription;

  constructor(
    private flightService: FlightService,
    private localBasketService: LocalBasketService,
    private store: Store<FlightBookingAppState>,
    private translateService: TranslateService
  ) {}

  get flights(): Flight[] {
    return this.flightService.flights;
  }

  ngOnInit(): void {
    this.localeSubscription = this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.locale = langChangeEvent.lang;
    });
  }

  ngOnDestroy(): void {
    if (this.localeSubscription) {
      this.localeSubscription.unsubscribe();
    }
  }

  search(): void {
    if (!this.from || !this.to) return;

    // this.flightService.load(this.from, this.to, this.urgent);

    /*this.flightService.find(this.from, this.to, this.urgent).subscribe({
      next: (flights) => {
        this.store.dispatch(flightsLoaded({ flights }));
      },
      error: (error) => {
        console.error('error', error);
      }
    });*/

    this.store.dispatch(
      loadFlights({
        from: this.from,
        to: this.to,
        urgent: this.urgent
      })
    );
  }

  delay(): void {
    // this.flightService.delay();

    this.flights$.pipe(take(1)).subscribe((flights) => {
      const flight = flights[0];

      const oldDate = new Date(flight.date);
      const newDate = new Date(oldDate.getTime() + 15 * 60 * 1000);
      const newFlight = { ...flight, date: newDate.toISOString() };

      this.store.dispatch(updateFlight({ flight: newFlight }));
    });
  }

  saveBasket(): void {
    this.localBasketService.save(this.basket).then(
      (_) => console.debug('successfully saved basket'),
      (err) => console.error('error saving basket', err)
    );
  }

  loadBasket(): void {
    this.localBasketService.load().then(
      (basket: { [id: number]: boolean }) => {
        this.basket = basket;
      },
      (err) => console.error('error loading basket', err)
    );
  }
}
