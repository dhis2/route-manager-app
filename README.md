![React 18](https://img.shields.io/badge/react-18-blue) [![codecov](https://codecov.io/gh/dhis2/route-manager-app/graph/badge.svg?token=HLFHRQVZL7)](https://codecov.io/gh/dhis2/route-manager-app)

# Route Manager App

This app supports managing routes using [DHIS2 Routes API](https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/route.html).

It supports:

1. Creating new routes (for all `GET`, `POST`, `DELETE`, `PUT`, `PATCH` and `JSON-PATCH`).
1. Editing and deleting existing routes
1. Testing routes by invoking the upstream endpoint and displaying the result.
1. Configuring authentication parameters
1. Setting authorities required to run the route
1. Configuring the route metadata sharing

Please note that, in order, to be able to perform these operations, the logged-in user's role should have the `Route` authority enabled (under User App -> Roles (select the role) -> Metadata authorities (search for `Route`))

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).
