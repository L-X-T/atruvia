import { Component, OnInit } from '@angular/core';
import { AirportService } from '@flight-workspace/flight-lib';
import { Observable } from 'rxjs';

@Component({
  selector: 'flight-workspace-airport',
  templateUrl: './airport.component.html',
  styleUrls: ['./airport.component.css']
})
export class AirportComponent implements OnInit {
  airports$: Observable<string[]>;

  constructor(private airportService: AirportService) {}

  ngOnInit(): void {
    this.airports$ = this.airportService.findAll();
  }
}
