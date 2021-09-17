import { Component } from '@angular/core';
import { LoggerService } from '@flight-workspace/logger-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
// import { AuthLibService } from '@flight-workspace/shared/auth-lib';

@Component({
  selector: 'flight-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private loggerService: LoggerService, private snackBar: MatSnackBar, private swUpdate: SwUpdate) {
    this.loggerService.log('log');
    this.loggerService.debug('debug');

    // this.authLibService.login('Alex', '');

    this.setupUpdates();
  }

  setupUpdates(): void {
    this.swUpdate.available.subscribe((updateAvailableEvent) => {
      this.swUpdate.activateUpdate().then(() => {
        this.snackBar.open('App updated -- please reload!', 'OK');
      });
    });

    this.swUpdate.checkForUpdate();
  }
}
