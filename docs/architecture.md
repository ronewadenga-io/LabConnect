# Architecture and framework conversion

`index.html` owns the sidebar, header, and `#pages` outlet. Deferred scripts load in document order: configuration, state, utilities and services, shared components, pages, router, then startup. Keep `src/app.js` last.

Each file in `src/pages/` owns a view and its related interactions. Authentication contains both sign-in and signup; laboratories includes the group detail view. Shared UI belongs in `src/components/`; reusable operations belong in `src/services/`.

## Current boundaries

This is a framework-neutral separation of the existing implementation. Scripts still share global bindings and use inline event handlers in generated HTML. They are not ES modules, and moving files alone does not remove coupling. Local storage keys and stored record shapes remain unchanged so existing browser workspaces continue to load. The superseded demo login implementation was removed; the current account flow is the only login implementation.

The archived HTML is a standalone historical reference and is never loaded by the app. The historical browser test expects demo accounts and 80 sample devices and is retained only as reference.

## Suggested migration order

1. Move the shared HTML shell into the target framework's layout component and import the two CSS files in their existing order.
2. Turn `src/state/store.js` into the framework's store or context. Replace global reads and writes with explicit state dependencies.
3. Convert service functions into exported modules. Replace browser storage with backend API calls as needed, preserving record contracts or adding an explicit data migration.
4. Convert shared components and then each page renderer into framework templates/components. Replace `innerHTML`, inline handlers, and `window` callbacks with framework event bindings and escaped text interpolation.
5. Replace `src/router.js` with the framework router and map each view to a route. The current router changes the outlet only; it does not implement deep links or browser history.
6. Move startup/session restoration into the framework lifecycle and port the browser workflow check to the new entry point.

For a server-rendered framework, keep `window`, `document`, `localStorage`, and browser crypto access in client-side code. Real authentication, authorization, device telemetry, and shared persistence require server implementations; the existing local prototype does not provide those capabilities.

## Adding a page today

Add a renderer in `src/pages/`, include its deferred script before `src/router.js`, register its title and renderer in `navigateTo`, and add navigation in `src/components/navigation.js` where appropriate. Put shared visuals in components and local images in `assets/images/`.
