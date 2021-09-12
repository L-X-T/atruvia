<h1>Labs: Web Components with Angular</h1>

- [Dashboard](#dashboard)
- [Using Angular Elements](#using-angular-elements)
- [Dynamically adding a Web Component](#dynamically-adding-a-web-component)
- [Loading an external Web Component](#loading-an-external-web-component)
  - [Inspecting the external project](#inspecting-the-external-project)
  - [Build the external web component](#build-the-external-web-component)
  - [Load the external web component](#load-the-external-web-component)
- [Bonus: Working with an existing (native) web component *](#bonus-working-with-an-existing-native-web-component-)
- [Bonus: Implementing Two-Way-Bindings for existing web components **](#bonus-implementing-two-way-bindings-for-existing-web-components-)



## Dashboard

In this lab, you will mainly work within the ``dashboard`` app in your monorepo. Hence, to start your project, you have to call ``ng serve dashboard -o``.

## Using Angular Elements

1. Install @angular/elements:

    ```
    npm i / yarn add @angular/elements@11.2.14

    ```

2. Install the lib ngx-build-plus and use it to add polyfills for older browsers:

    ```
    ng add ngx-build-plus --project dashboard
    ng g ngx-build-plus:wc-polyfill -f --project dashboard
    ```

    **Note:** These polyfills are more stable than the ones that are shipped with @angular/elements when it comes to supporting IE 11.

3. Have a look to the file ``dashboard-tile.component.ts`` and the respective template ``dashboard-tile.component.html``. Find out what it does and that it is just an ordinary Angular component.

4. In the module's constructor (``app.module.ts``), wrap your component with Angular Elements and register it as a custom element.

    <details>
    <summary>Show Code</summary>
    <p>

    ```typescript
    @NgModule([...])
    export class AppModule {
        constructor(private injector: Injector) {
            const tileElm = createCustomElement(DashboardTileComponent, { injector: this.injector });
            customElements.define('dashboard-tile', tileElm);
        }
    }
    ```

    </p>
    </details>

5. To test your web component, call it within your ``home.component.html`` file:

    ```html
    <dashboard-tile a="3" b="4" c="5"></dashboard-tile>
    ```

6. Restart the Angular CLI now. This is necessary because the polyfills are registered with ``angular.json`` which is only loaded once during startup.

7. You should now get an error in your browsers's JavaScript console. To solve this one, add the ``CUSTOM_ELEMENTS_SCHEMA`` to your ``AppModule``:

    ```typescript
    @NgModule({
    [...],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    [...]
    })
    export class AppModule {
    }
    ```

    The reason for this error is that the Angular Compiler does not know web components (custom elements) hence it throws this error. This schema makes the compiler to ignore everything it is not aware of.

8. Make sure, the solution works now and displays the ``dashboard-tile`` web component.


## Dynamically adding a Web Component

1. In your ``dashboard-page.component.ts``, implement the open TODOs (see comments) to dynamically add a dashboard tile to your dashboard.

    <details>
    <summary>Show Hint</summary>
    <p>

    ```typescript
    const tile = document.createElement(elementName);

    tile.setAttribute('class', 'col-lg-4 col-md-6 col-sm-12');
    tile.setAttribute('a', '' + data[0]);
    tile.setAttribute('b', '' + data[1]);
    tile.setAttribute('c', '' + data[2]);

    content.appendChild(tile);
    ```
    </p>
    </details>


2. Test your application. Move to the Dashboard in the app and press ``Add Tile``. You should now see a dynamically added tile. We will take care about the other buttons here in the next exercises.

<!-- TODO: Add Image -->

<!-- ## Lazy Loading Web Components

1. Open the file ``lazy-dashboard-tile.component.ts`` and have a look to its component and its template. Find out that it's another ordinary Angular Component.

2. In your ``angular.json``, scroll down to the element ``projects/dashboard/architect/build/options``. Assure yourself that the following entry exists:

    ```json
    "lazyModules": [
        "[...]/dashboard/src/app/lazy-dashboard-tile/lazy-dashboard-tile.module"
    ],
    ```

    `[...]` is your path prefix (`projects` in CLI workspaces or `apps` in NX workspaces).


3. Restart the Angular CLI's development web server.

4. At the command line, you should now see that the CLI splits off a bundle for this module.

5. Open the file ``lazy-dashboard-tile.service.ts``. Its ``load`` method already contains some low level API calls to load the lazy chunk and instantiate the included ``LazyDashboardTileModule``. Have a look at it.

6. Switch back to the file ``dashboard-page.component.ts`` and find out that its ``addLazy`` method already calls the load method we've looked at before.

7. Now, let's try this out. Open your application, move to the Dashboard and click the button ``Add Lazy``.

<!-- TODO: Add Image -->

<!-- 8. To assure yourself that the module is lazy loaded, refresh the page, open Chrome's dev tools and move to the network page. Then, press ``Add Lazy`` and see that the chunk is just loaded on demand. -->



## Loading an external Web Component

### Inspecting the external project

In this part of the exercise, we are using the ``external`` project.

1. Inspect the ``external`` project in your workspace.

2. Have a look to the ``external-dashboard-tile.component.ts`` file and its template. One more time, it's just an ordinary Angular component.

3. Have a look to the ``app.module.ts`` file and find out that defines a ``ngDoBootstrap`` for wrapping and registering the web component.

    NOTE: This is needed because this application is started without an bootstrap component (see empty ``bootstrap`` array)

4. Open the ``index.html`` file and find out that the discussed polyfills for web components are referenced at the end.

5. Also, have a look to the ``index.html`` and find out that it references a polyfill and just calls the web component (and not a traditional Angular component, as usual).

6. Start the external project to test it:

    ```
    ng serve --project external -o
    ```

    <!-- TODO: Add Image -->

### Build the external web component

In this part of the exercise, we are using the ``external`` project one more time.

1. Now, let's build the ``external`` project. To make sure to get just one bundle, use the option ``--single-bundle`` provided by the community project [ngx-build-plus](https://www.npmjs.com/package/ngx-build-plus)

    ```
    ng build --prod --single-bundle --output-hashing none --project external
    ```

    HINT: Preventing ``output-hashing`` makes writing code for dynamically loading the bundles easier.

2. Copy the ``external`` project's bundle over to your ``dashboard``'s ``assets`` folder. Use the following prepared npm script:

    ```
    npm run copy:ce
    ```

### Load the external web component

In this part of the exercise, we are switching back to the ``dashboard`` project.

1. Open the file ``external-dashboard-tile.service.ts`` and implement the missing parts (see TODO comments) in the ``load`` method.

    <details>
    <summary>Show Hint</summary>
    <p>

    ```javascript
    const script = document.createElement('script');
    script.src = 'assets/external-dashboard-tile.bundle.js';
    document.body.appendChild(script);
    ```

    </p>
    </details>

2. Have a look to your ``dashboard-page.component.ts``. Assure yourself that your modified ``load`` method is called by ``addExternal``.

3. Start your application, switch to the dashboard and press ``Add External``. Your external component should now be loaded and displayed.

4. Once again, reload the app and use the network tab in Chrome's dev tools to assure yourself that the bundle is loaded just on demand.


## Bonus: Working with an existing (native) web component *

1. Open the file ``custom-checkbox.ts`` and have a look to the implementation.

2. Open the file ``home.component.html`` and remove the comments so that the ``custom-checkox`` component is called.

3. Open the file ``home.component.ts`` and add the following event handler:

    ```typescript
    changed(event) {
        console.debug('event', event);
        this.value1 = event.detail;
    }
    ```

4. Test your application again and make sure it works now.

## Bonus: Implementing Two-Way-Bindings for existing web components **

To use our ``custom-checkbox`` component with two way bindings, we need to provide a directive that exposes a ``checkedChange`` event. This is necessary, because Angular needs an event with the same name as the property in question and the suffix ``Change``.

1. Assure yourself that the directive has a selector ``custom-checkbox`` which assigns the directive to all instances of our custom element.

2. Add a ``checkedChange`` event and a host listener for the existing changed event. Let the latter one trigger ``checkedChange``.

    <details>
    <summary>Show Hint</summary>
    <p>

    ```typescript
    @Output() checkedChange = new EventEmitter<boolean>();

    @HostListener('changed', ['$event'])
    changed($event) {
        this.checkedChange.next($event.detail);
    }
    ```

    </p>
    </details>

3. Have a look to the file ``custom-checkbox.module.ts`` and make sure  that it declares and exports the directive and that it registers the web component.

4. Open the file ``home.component.html`` use two way binding for your checkbox (``... [(checked)]="value1" ...``).

5. Test your solution.
