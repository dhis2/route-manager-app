import { CustomDataProvider, Provider } from '@dhis2/app-runtime'
import React from 'react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { MockAlertStack } from './MockAlertStack'

export type CustomData = {
    [resourceName: string]: CustomResource
}

type CustomResource =
    | unknown
    | ((
          resource: string,
          options: { params: { filter: string[] } }
      ) => Promise<unknown>)

type AppTestWrapperProps = React.PropsWithChildren<{
    dataForCustomProvider: CustomData
}>

export const ComponentWithProvider = ({
    dataForCustomProvider,
    children,
}: AppTestWrapperProps) => {
    return (
        <Provider
            config={{
                baseUrl: 'http://dhis2-imaginary-test-server',
                apiVersion: 41,
            }}
            plugin={false}
            parentAlertsAdd={() => undefined}
            showAlertsInPlugin={true}
        >
            <CustomDataProvider
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data={dataForCustomProvider as any}
                options={{ failOnMiss: true }}
            >
                {children}
                <MockAlertStack />
            </CustomDataProvider>
        </Provider>
    )
}

type TestComponentWithRouterProps = React.PropsWithChildren<{
    path: string
    customData: CustomData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routeOptions?: any
}>

const TestComponentWithRouter = ({
    path,
    customData,
    routeOptions,
    children,
}: TestComponentWithRouterProps) => {
    const routes = [
        {
            path,
            element: (
                <ComponentWithProvider dataForCustomProvider={customData}>
                    {children}
                </ComponentWithProvider>
            ),
            ...routeOptions,
        },
    ]

    if (path !== '/') {
        routes.push({})
    }

    const router = createMemoryRouter(routes, {
        initialEntries: [path],
        initialIndex: 0,
    })

    return <RouterProvider router={router} />
}

export default TestComponentWithRouter
