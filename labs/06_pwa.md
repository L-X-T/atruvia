# Lab: Angular and Progressive Web Apps

- [Lab: Angular and Progressive Web Apps](#lab-angular-and-progressive-web-apps)
  - [Prerequisites](#prerequisites)
  - [Using @angular/pwa](#using-angularpwa)
  - [Using the Update Service](#using-the-update-service)
  - [Caching API calls](#caching-api-calls)
  - [Installing the PWA on your Desktop](#installing-the-pwa-on-your-desktop)
  - [Using push notifications](#using-push-notifications)
    - [Subscribing the Angular Application for Push](#subscribing-the-angular-application-for-push)
    - [Creating a Script for Sending Push Notifications](#creating-a-script-for-sending-push-notifications)
  - [Saving data for offline usage](#saving-data-for-offline-usage)
  - [Bonus: Offline-Editing **](#bonus-offline-editing-)

## Prerequisites

Make sure you have the Angular CLI installed globally by running ``ng version``. **If** it is **not** installed, you can install it using ``npm i -g @angular/cli``.

## Using @angular/pwa

In this lab, you will upgrade your case study to a progressive web app. For this, you will install the meta package ``@angular/pwa`` which creates a webapp manifest and installs the ``@angular/service-worker``.

1. If installed, uninstall the community extension ``ngx-build-plus``. This is needed because the Angular CLI assumes we have default settings when enabling an application as an PWA. For this, open your ``angular.json`` and replace **every occurrence** of

    ``ngx-build-plus``

    with

    ``@angular-devkit/build-angular``

    If ngx-build-plus is not installed in your setup, this step will not replace anything.

1. Install the package ``@angular/pwa``:

    ```
    ng add @angular/pwa
    ```

    **IMPORTANT**: If this step DOES NOT update your ``index.html`` call your trainer.

2. Open your ``app.module.ts`` and find out that the ``ServiceWorkerModule`` has been imported.

3. Open the generated file ``ngsw-config.json`` and find out that it makes the ``@angular/service-worker`` to cache all the bundles and assets.

4. Open the ``manifest.webmanifest`` and have a look at the entries. This file contains the web app manifest.

5. Create a production build as ``@angular/service-worker`` only uses the cache in production mode.

    ```
    ng build --prod --project flight-app
    ```

6. Install ``serve``, a simple command line based web server for testing:

    ```
    npm i -g serve
    ```
7. Switch into your workspace root and start the serve:

    ```
    serve dist/apps/flight-app -s
    ```

8. Open your browser and navigate to the address serve is using (http://localhost:5000 by default)

    If you get another application here, uninstall the service worker in the dev tools (``Application | Service Worker``) and refresh your page.

9.  Open the developer tools and switch to ``Application | Service Worker``. Assure yourself that your service worker runs. You should see its name (``ngsw-worker.js``) and its ``id``.

10. In the developer tools,  switch to the ``Network`` tab. Reload the application and note the shown measure for ``DOMContentLoaded``.

11. Simulate ``Slow 3G`` and reload the application. Find out, that the time for ``DOMContentLoaded`` is similar as before.

12. Close the web server (``CTRL+C``) and reload the application. Find out, that it still works.

13. In the developer tools, switch back to ``Application | Service Worker`` and remove the service worker by clicking at ``Unregister`` (!).

    After this, immediately close the browser to prevent that it gets reinstalled.

    This is **important** because it does currently not support updates. The next section shows, how to prepare your application for updates.

## Using the Update Service

In this part of the lab, you will leverage the update service (``SwUpdate``) for downloading new versions of the app from the server. To show status messages, you will also install ``@angular/material`` and use its ``SnackBar`` control.

1. Install ``@angular/material``:

    ```
    ng add @angular/material --project flight-app
    ```

2. Open your file ``app.module.ts`` and import the ``MatSnackBarModule`` from ``@angular/material``.

    ```typescript
    [...]

    import { MatSnackBarModule } from '@angular/material';

    [...]

    @NgModule({
        imports: [
            [...]
            MatSnackBarModule
        ],
        [...]
    })
    export class AppModule {
    }
    ```

3. Open the ``app.component.ts`` file and inject the Angular Material's ``SnackBar`` and the ``SwUpdate`` service into the constructor.

    ```TypeScript
    [...]
    export class AppComponent {

        constructor(
            private snackBar: MatSnackBar,
            private swUpdate: SwUpdate,
            [...]
            ) {
                [...]
            }
    }
    ```

4. Add a method ``setupUpdates`` to the ``AppComponent``. It shall setup all events needed to activate a new application version and check for updates.

    ```TypeScript
    setupUpdates() {
        this.swUpdate.available.subscribe(u => {
            this.swUpdate.activateUpdate().then(e => {
                this.snackBar.open("App updated -- please reload!", "OK");
            });
        });

        this.swUpdate.checkForUpdate();

    }
    ```

5. Call the new ``setupUpdates`` method in the constructor:

    ```TypeScript
    export class AppComponent {

    constructor(
        private snackBar: MatSnackBar,
        private swUpdate: SwUpdate,
        [...]) {

        [...]
        this.setupUpdates();
    }

    [...]
    }  
    ```

6. Create a production build (``ng build --prod --project flight-app``), switch to the workspace root and run ``serve dist/apps/flight-app -s``.

7. Force Chrome to update your cache. Hence, restart Chrome and open the dev tools. Switch to ``Application | Service Worker`` and click ``Update``.

8. You should now see the application which got a new service worker instance. Make sure it still works offline.

9. Close the ``serve`` (``CTRL+C``).

10. Modify the application, e. g. by changing the order of the declared components or imported modules in the ``app.component.ts`` file.

11. Create one more production build (``ng build --prod --project flight-app``).

12. Start the ``serve`` again (``serve dist/apps/flight-app -s``).

13. The application should now download the new production build and inform you about this.

## Caching API calls

1. Open your ``ngsw-config.json`` and add the following dataGroups section to cache API calls:

    ```json
    [...]
    "dataGroups": [
        {
        "name": "api",
        "cacheConfig": {
            "maxAge": "12h",
            "maxSize": 200,
            "strategy": "freshness"
        },
        "urls": [
            "http://www.angular.at/api/**"
        ]
        }
    ],
    "assetGroups": [ ... ],
    [...]
    ```

2. Rebuild your application (``ng build --prod``) and run serve in your project's root (``serve dist/apps/flight-app -s``).

3. Fetch flights using several different search criteria.

4. Disconnect your machine from the network.

5. Search using the same criteria. You should get the cached serche results now.

6. Search for different criteria. You should get no results.

## Installing the PWA on your Desktop

You can make Desktop Chrome to prompt the user to install the app on their desktop.

1. Add the following code to your AppComponent's constructor:

    ```typescript

    if (typeof window === 'object') {

        window.addEventListener('beforeinstallprompt', (e: any) => {
            console.debug('beforeinstallprompt')

            this.snackBar.open('Install on Desktop?', 'OK')
                .onAction().subscribe(_ => {
                    e.prompt();
                });

            e.userChoice.then(choice => console.debug('user choice', choice));
        });

    }
    ```

2. Create another production build: ``ng build --prod``.

3. Start your application with serve: ``serve dist/apps/flight-app -s``.

4. Open the application in your browser.

5. After some seconds the browser should ask you to install the app on desktop. **If not**, select the option ``Install to Desktop`` in the browser's menu.

## Using push notifications

In this lab you will use the ``SwPush`` service to subscribe to your browser's push service in the cloud and to receive push notifications. You will also create a script that sends push notifications to the browser.

### Subscribing the Angular Application for Push

1. Open the ``app.component.ts`` file and inject the ``SwPush`` service.

    ```TypeScript
    export class AppComponent {

    constructor(
        private snackBar: MatSnackBar,
        private swUpdate: SwUpdate,
        private swPush: SwPush,
        [...]) {

            [...]

        }

        [...]
    }  
    ```

2. In the ``AppComponent``, create a method ``setupPush`` that subscribes for push messages.

    You can use the following public key for it:

    ``BBc7Bb5f5CRJp7cx19kPHz5d9S5jFSzogxEj2V1C44WuhTwd78tnXLPzOxGe0bUmKJUTAMemSKFzyQjSBN_-XyE``

    This key is used by the Browser's push service to verify that the push message was sent by your back end.

    ```TypeScript
    setupPush() {

        const key = 'BBc7Bb5f5CRJp7cx19kPHz5d9S5jFSzogxEj2V1C44WuhTwd78tnXLPzOxGe0bUmKJUTAMemSKFzyQjSBN_-XyE';

        this.swPush.requestSubscription({
            serverPublicKey: key
        })
        .then(sub => {
            console.debug('Push Subscription', JSON.stringify(sub) );
        },
        err => {
            console.error('error registering for push', err);
        });

        this.swPush.messages.subscribe(push => {
            console.debug('received push message', push);
        });
    }
    ```

3. In the ``AppComponent``'s constructor, call the new ``setupPush`` method.

    ```TypeScript
    export class AppComponent {

    constructor(
        private snackBar: MatSnackBar,
        private swUpdate: SwUpdate,
        private swPush: SwPush,
        [...]) {
            [...]

            this.setupPush();
        }

        [...]
    }  
    ```

4. Create another production build (``ng build --prod --project flight-app``).

5. Run ``serve``: ``serve dist/apps/flight-app -s``.

6. After the application has been loaded, look into the JavaScript console and assure yourself that the application got a subscription for the browser's push service in the cloud.

7. Close the ``serve`` (``CTRL+C``).

### Creating a Script for Sending Push Notifications

Now let's create a node script that simulates a back end service sending a push notifications.

1. Install the package ``web-push``.

    ```
    npm install web-push --save-dev | yarn add web-push --dev
    ```

1. In your workspace root, create a file ``send-push.js`` with the following content:

    ```typescript
    const webpush = require('web-push');

    const options = {
        vapidDetails: {
            subject: 'http://127.0.0.1:8080',
            publicKey: 'BBc7Bb5f5CRJp7cx19kPHz5d9S5jFSzogxEj2V1C44WuhTwd78tnXLPzOxGe0bUmKJUTAMemSKFzyQjSBN_-XyE',
            privateKey: 'tBoppvhj9A9NO0ZrFsPiH_CoAZ84TagjxiKyGjR4V8w'
        },
        TTL: 5000
    }

    const pushSubscription = null;

    const payload = JSON.stringify({
        notification: {
            title: 'Your Gate Changed',
            body: 'Your Gate is now G62',
            icon: './assets/bed.png',
            data: 'additional data'
        }
    });

    webpush.sendNotification(
        pushSubscription,
        payload,
        options
    );

    ```

    Please note, that the ``pushSubscription`` variable points to ``null``. You will replace it later with your Browser's subscription object.

1. Start ``serve`` again: ``serve dist/apps/flight-app -s``.

1. Open the JavaScript console and copy out the subscription object.

    **Note:** Normally, the Angular application would send it to its back end. For the sake of simplicity, we copy it directly to the script sending the push notifications.

2. In the ``send-push.js`` file, use the copied subscription object as the value of the variable ``pushSubscription``:

    ```javascript
    const pushSubscription = { "endpoint":"[...]", [...] }
    ```

1. Run the node script:

    ```
    node send-push.js
    ```

2. You should now see the push notification.

1. Close the application in the browser but make sure your browser keeps running.

1. Execute the ``send-push.js`` script once again.

1. Even now, the push notification should show up. This is because the service worker keeps running in the browser.

## Saving data for offline usage

In this lab, you'll save your shopping basket into an ``indexeddb`` for offline usage. For this, you'll use the abstraction ``Dexie.js``.

1. Install dexie.js:

    ```
    npm i dexie --save | yarn add dexie
    ```
2. In the ``flight-booking`` folder, create a ``db.ts`` file that creates the dexie db for saving baskets.

    ```typescript
    import Dexie from 'dexie';

    export const basketTableName = 'basket';

    const schema: { [key: string]: string} = {}
    schema[basketTableName] = 'id,date';
               // Just the indexed colums

    export const db = new Dexie('flightdb');
    db.version(1).stores(schema);
    ```

1. Also in the ``flight-booking`` folder, create a file ``local-basket.service.ts`` with a service loading and saving baskets.

    ```TypeScript
    import { db, basketTableName } from './db';
    import { Injectable } from '@angular/core';

    @Injectable({
    providedIn: 'root'
    })
    export class LocalBasketService {

        save(basket: object): Promise<any> {

            const entry = {
            id: 1,
            date: new Date(),
            basket
            }

            return db.table(basketTableName).put(entry);
        }

        load(): Promise<object> {
            return db.table(basketTableName).get(1).then(entry => entry.basket);
        }

    }
    ```

1. Open the file ``flight-search.component.ts`` and inject the new ``LocalBasketService``.

    ```TypeScript
    [...]
    export class FlightSearchComponent implements OnInit {
        [...]
        constructor(
            private localBasketService: LocalBasketService,
            [...]) {
            [...]
        }
        [...]
    }
    ```

1. Create a method ``saveBasket`` for saving the whole basket into the db and a method ``loadBasket`` for reloading it.

    ```TypeScript
    saveBasket(): void {
        this.localBasketService.save(this.basket).then(
            _ => console.debug('successfully saved basket"'),
            err => console.error('error saving basket', err)
        )
    }

    loadBasket(): void {
        this.localBasketService.load().then(
            basket => { this.basket = basket; },
            err => console.error('error loading basket', err)
        );
    }
    ```

1. Open the ``flight-search.component.html`` file and create buttons for the two new methods:

    ```html
    <div class="card">
    <div class="content">
        <pre>{{ basket | json }}</pre>

        <!-- New Buttons: -->
        <button class="btn btn-primary" (click)="saveBasket()">Save</button>
        <button class="btn btn-primary" (click)="loadBasket()">Load</button>
    </div>
    </div>
    ```

1. Start the application and try out the new buttons: Search for flights, select some of them and save the current basket. Then reload the page and load the basket.

1. Open the dev tools and switch to ``Application | IndxedDB``. Explore this section and lookup your saved entry.

## Bonus: Offline-Editing **

Extend your application so that the selected flight is cached in the IndexedDb. Provide another route, which allows to edit this flight within the Indexeddb as well as to send the record back to the backend. You can use the following HTTP calls:

- Load Flight: GET http://www.angular.at/api/flight/17
- Update Flight: POST http://www.angular.at/api/flight (+ flight as JSON in payload)
