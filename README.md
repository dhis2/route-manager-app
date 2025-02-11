![React 18](https://img.shields.io/badge/react-18-blue)

# Route Manager App

This app supports managing routes using [DHIS2 Routes API](https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/route.html).

It currently supports:

1. Creating new routes (for all `GET`, `POST`, `DELETE`, `PUT`, `PATCH` and `JSON-PATCH`).
1. Editing and deleting existing routes
1. Testing routes by invoking the upstream endpoint and displaying the result.
1. Configuring authentication parameters
1. Setting authorities required to run the route
1. Configuring the route metadata sharing

Please note that, in order, to be able to perform these operations, the logged-in user's role should have the `Route` authority enabled (under User App -> Roles (select the role) -> Metadata authorities (search for `Route`))

**The app is still not published on AppHub - please refer to this [ticket](https://dhis2.atlassian.net/browse/DHIS2-18198) for updates on when it will be published **

These should come as improvements in the near future.

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

# Deploying the app

The app is not yet deployed on App Hub. In order to install it, you can download the release build from https://github.com/dhis2/route-manager-app/releases and upload the zip file using the `App Management` app in DHIS2.
