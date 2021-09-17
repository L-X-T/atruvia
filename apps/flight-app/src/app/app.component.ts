import { Component } from '@angular/core';
import { LoggerService } from '@flight-workspace/logger-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwPush, SwUpdate } from '@angular/service-worker';
// import { AuthLibService } from '@flight-workspace/shared/auth-lib';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'flight-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private loggerService: LoggerService,
    private snackBar: MatSnackBar,
    private swUpdate: SwUpdate,
    private swPush: SwPush,
    private translateService: TranslateService
  ) {
    this.loggerService.log('log');
    this.loggerService.debug('debug');

    // this.authLibService.login('Alex', '');

    if (environment.production) {
      this.installOnDesktop();

      this.setupUpdates();

      this.setupPush();
    }

    this.translateService.addLangs(['en', 'de']);
    this.translateService.setDefaultLang('de');
    this.translateService.use('de');
  }

  installOnDesktop(): void {
    if (typeof window === 'object') {
      window.addEventListener('beforeinstallprompt', (e: any) => {
        console.debug('beforeinstallprompt');

        this.snackBar
          .open('Install on Desktop?', 'OK')
          .onAction()
          .subscribe((_) => {
            e.prompt();
          });

        e.userChoice.then((choice) => console.debug('user choice', choice));
      });
    }
  }

  setupUpdates(): void {
    this.swUpdate.available.subscribe((updateAvailableEvent) => {
      this.swUpdate.activateUpdate().then(() => {
        this.snackBar.open('App updated -- please reload!', 'OK');
      });
    });

    this.swUpdate.checkForUpdate();
  }

  setupPush(): void {
    const key = 'BBc7Bb5f5CRJp7cx19kPHz5d9S5jFSzogxEj2V1C44WuhTwd78tnXLPzOxGe0bUmKJUTAMemSKFzyQjSBN_-XyE';

    this.swPush
      .requestSubscription({
        serverPublicKey: key
      })
      .then(
        (sub) => {
          console.debug('Push Subscription', JSON.stringify(sub));
        },
        (err) => {
          console.error('error registering for push', err);
        }
      );

    this.swPush.messages.subscribe((push) => {
      console.debug('received push message', push);
    });
  }
}
