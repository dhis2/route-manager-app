import { useDataMutation } from '@dhis2/app-runtime'
import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import * as React from 'react'
import { useNavigate } from 'react-router'
import TestComponentWithRouter from '../../test-utils/render'
import RoutesList from './RoutesList'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useDataMutation: jest.fn(),
}))

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: jest.fn(),
}))

afterEach(() => {
    jest.resetAllMocks()
})
const mutateSpy = jest.fn()
const navigateSpy = jest.fn()

beforeEach(() => {
    const useDataMutationMock = useDataMutation as jest.Mock
    useDataMutationMock.mockReturnValue([
        mutateSpy,
        { loading: false, error: null },
    ])

    const useNavigateMock = useNavigate as jest.Mock
    useNavigateMock.mockReturnValue(navigateSpy)
})

describe('Listing routes', () => {
    it('should display the routes list', async () => {
        const { getByText, findByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{ authorities: [], routes: mockRoutes, me: {} }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-1')

        mockRoutes.routes.forEach(async (route) => {
            expect(getByText(route.name)).toBeInTheDocument()
            expect(getByText(route.code)).toBeInTheDocument()
            expect(getByText(route.id)).toBeInTheDocument()
        })
    })
    describe('user authorities', () => {
        const errorMessage =
            /The current user does not have the necessary permissions to configure routes/
        it('should display an error when the user does not have authorities', async () => {
            const { findByText, queryByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        me: { authorities: [] },
                        routes: mockRoutes,
                        authorities: [],
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )

            await findByText(errorMessage)
            expect(queryByText(errorMessage)).toBeInTheDocument()
        })

        it('should not display error if user has correct authorities', async () => {
            const { findByText, queryByText, rerender } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        me: { authorities: ['ALL'] },
                        authorities: [],
                        routes: mockRoutes,
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText('code-1')
            expect(queryByText(errorMessage)).not.toBeInTheDocument()

            rerender(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        me: { authorities: ['F_ROUTE_PUBLIC_ADD'] },
                        routes: mockRoutes,
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText('code-1')
            expect(queryByText(errorMessage)).not.toBeInTheDocument()
        })

        it('should display an error with a random authority', async () => {
            const { findByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        me: { authorities: ['RANDOM_AUTHORITY'] },
                        routes: mockRoutes,
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText(errorMessage)
            expect(await findByText(errorMessage)).toBeInTheDocument()
        })
    })

    it('should show enable/disable button properly', async () => {
        const { getAllByLabelText, findByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{ authorities: [], routes: mockRoutes, me: {} }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-1')

        const switches = getAllByLabelText('Enable Route', { exact: false })
        expect(switches.length).toEqual(2)
        expect(switches[0]).not.toBeChecked()
        expect(switches[1]).toBeChecked()
    })
    it('should allow navigating to Edit screen', async () => {
        const { getAllByLabelText, findByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{ authorities: [], routes: mockRoutes, me: {} }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-1')

        const editButtons = getAllByLabelText('Edit route')
        expect(editButtons[0]).toBeDisabled()

        await userEvent.click(editButtons[1])
        expect(navigateSpy).toHaveBeenCalledWith('/create-route/q5k2AjRHfd0')
    })

    describe('navigating to Create/Edit', () => {
        it('should allow navigating to Create screen', async () => {
            const { findByText, getByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        routes: { routes: [mockRoutes.routes[1]] },
                        me: {},
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText('code-2')

            await userEvent.click(getByText(/create new route/i))

            expect(navigateSpy).toHaveBeenCalledTimes(1)
            expect(navigateSpy).toHaveBeenCalledWith('create-route')
        })

        it('should allow navigating to Edit screen from more actions', async () => {
            const { getByTestId, findByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        routes: { routes: [mockRoutes.routes[1]] },
                        me: {},
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText('code-2')

            await userEvent.click(getByTestId('button-more-actions'))
            await userEvent.click(
                within(getByTestId('popover-more-actions')).getByLabelText(
                    'Edit'
                )
            )
            expect(navigateSpy).toHaveBeenCalledTimes(1)
            expect(navigateSpy).toHaveBeenCalledWith(
                '/create-route/q5k2AjRHfd0'
            )
        })
    })

    it('should allow opening sharing dialog', async () => {
        const { getByTestId, findByText, queryByText, getByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: { routes: [mockRoutes.routes[1]] },
                    me: {},
                    sharing: {
                        meta: {
                            allowPublicAccess: true,
                            allowExternalAccess: false,
                        },
                        object: {
                            id: 'x986uhPfIpI',
                            name: '2222',
                            displayName: '2222',
                            publicAccess: 'rw------',
                            user: {
                                id: 'GOLswS44mh8',
                                name: 'Tom Wakiki',
                            },
                            userGroupAccesses: [],
                            userAccesses: [],
                            externalAccess: false,
                        },
                    },
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')

        await userEvent.click(getByTestId('button-more-actions'))
        await userEvent.click(
            within(getByTestId('popover-more-actions')).getByLabelText(
                'Sharing'
            )
        )

        await findByText(/Sharing and access: 2222/)
        await userEvent.click(getByText('Close'))
        expect(queryByText(/Sharing and access/)).not.toBeInTheDocument()
    })

    // skipping - can't find a way to spy on mutate from Data Engine
    it.skip('should allow toggling route', async () => {
        // const mutateDataEngine = jest.fn()
        // jest.spyOn(appRuntime, 'useDataEngine').mockImplementationOnce(() => {
        //     return {
        //         mutate: mutateDataEngine,
        //     }
        // })
        const { findByText, getByRole } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: { routes: [mockRoutes.routes[1]] },
                    me: {},
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')

        await userEvent.click(getByRole('switch'))
        // expect(mutateDataEngine).toHaveBeenCalledWith({})
    })
    describe('deleting a route', () => {
        it('should allow deleting a route', async () => {
            const { getByTestId, findByText, getByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        routes: { routes: [mockRoutes.routes[1]] },
                        me: {},
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText('code-2')

            await userEvent.click(getByTestId('button-more-actions'))
            await userEvent.click(
                within(getByTestId('popover-more-actions')).getByLabelText(
                    'Delete'
                )
            )

            await findByText('Are you sure you want to delete this route?')

            await userEvent.click(getByText('Confirm'))
            expect(mutateSpy).toHaveBeenCalledWith({ id: 'q5k2AjRHfd0' })
        })

        it('should NOT delete a route if the user does not confirm', async () => {
            const { getByTestId, findByText, getByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        routes: { routes: [mockRoutes.routes[1]] },
                        me: {},
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            await findByText('code-2')

            await userEvent.click(getByTestId('button-more-actions'))
            await userEvent.click(
                within(getByTestId('popover-more-actions')).getByLabelText(
                    'Delete'
                )
            )

            await findByText('Are you sure you want to delete this route?')

            await userEvent.click(getByText('Cancel'))
            expect(mutateSpy).not.toHaveBeenCalled()
        })
    })
})

describe('testing routes', () => {
    it('should allow testing the route when clicked', async () => {
        const mockRun = jest.fn(() =>
            Promise.resolve({ test: 'test-response' })
        )
        const { findByTestId, getAllByText, findByText, getByTestId } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: mockRoutes,
                    me: {},
                    'routes/q5k2AjRHfd0/run': mockRun,
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-1')

        expect(getAllByText('Test route')[0]).toBeDisabled()

        userEvent.click(getAllByText('Test route')[1])

        await findByTestId('input-test-route-code')

        expect(
            getByTestId('input-test-route-code').querySelector('input')
        ).toHaveValue('code-2')
        expect(
            getByTestId('input-test-route-name').querySelector('input')
        ).toHaveValue('name-2')
        expect(
            getByTestId('input-test-route-url').querySelector('input')
        ).toHaveValue('https://postman-echo.com/get')

        getByTestId('button-test-route-perform-test').click()

        expect(mockRun).toHaveBeenLastCalledWith(
            'read',
            expect.objectContaining({ resource: 'routes/q5k2AjRHfd0/run' }),
            expect.anything()
        )

        await findByText(/test-response/)
    })
    it('should allow testing other verbs  with wildcard paths', async () => {
        const mockRun = jest.fn(() =>
            Promise.resolve({ test: 'test-response' })
        )
        const { findByTestId, findByText, getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: mockRouteWithWildpath,
                    me: {},
                    'routes/q5k2AjRHfd0/run/extended-url': mockRun,
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')

        userEvent.click(getByText('Test route'))

        await findByTestId('input-test-route-code')

        await userEvent.click(getByText('GET'))
        await userEvent.click(getByText('PUT'))

        await userEvent.type(
            getByTestId('input-wildcard-path').querySelector('input'),
            'extended-url'
        )

        await userEvent.click(getByTestId('button-test-route-perform-test'))

        expect(mockRun).toHaveBeenCalledTimes(1)
    })
    it('should allow testing with Query params', async () => {
        const mockRun = jest.fn(() =>
            Promise.resolve({ test: 'test-response' })
        )
        const { findByTestId, findByText, getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: { routes: [mockRoutes.routes[1]] },
                    me: {},
                    'routes/q5k2AjRHfd0/run?testQuery=value': mockRun,
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')

        userEvent.click(getByText('Test route'))

        await findByTestId('input-test-route-code')

        await userEvent.click(getByText('GET'))

        await userEvent.type(
            getByTestId('input-query-params').querySelector('input'),
            'testQuery=value'
        )

        await userEvent.click(getByTestId('button-test-route-perform-test'))

        expect(mockRun).toHaveBeenCalledTimes(1)

        await findByText(/Route invoked successfully/)
    })

    it('should show error if testing route fails', async () => {
        const mockRun = jest.fn(() =>
            Promise.reject({ test: 'fake error from test' })
        )
        const { findByTestId, findByText, getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: { routes: [mockRoutes.routes[1]] },
                    me: {},
                    'routes/q5k2AjRHfd0/run': mockRun,
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')

        await userEvent.click(getByText('Test route'))

        await findByTestId('input-test-route-code')

        await userEvent.click(getByTestId('button-test-route-perform-test'))

        expect(mockRun).toHaveBeenCalledTimes(1)

        await findByText(/Failed to invoke route:/)
    })
    it('should show allow closing the Test modal', async () => {
        const { findByText, getByText, queryByTestId } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: { routes: [mockRoutes.routes[1]] },
                    me: {},
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')
        await userEvent.click(getByText('Test route'))

        expect(queryByTestId('modal-test-route')).toBeInTheDocument()

        await userEvent.click(getByText('Cancel'))

        expect(queryByTestId('modal-test-route')).not.toBeInTheDocument()
    })

    it('should show error if testing route fails', async () => {
        const mockRun = jest.fn(() =>
            Promise.reject({ test: 'fake error from test' })
        )
        const failMutateSpy = jest.fn(() =>
            Promise.reject('fake-error from test')
        )
        mutateSpy.mockReturnValueOnce(() => {
            return [failMutateSpy]
        })
        const { findByTestId, findByText, getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: { routes: [mockRoutes.routes[1]] },
                    me: {},
                    'routes/q5k2AjRHfd0/run': mockRun,
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('code-2')

        userEvent.click(getByText('Test route'))

        await findByTestId('input-test-route-code')

        await userEvent.click(getByTestId('button-test-route-perform-test'))

        expect(mockRun).toHaveBeenCalledTimes(1)

        await findByText(/Failed to invoke route:/)
    })
})

describe('authentication display', () => {
    // Checks the display in the Datatablecell. Tests for auth variations (none, basic, api key, oauth - new authentications can be added here)
    const authTestCases = [
        {
            name: 'http-basic with username',
            auth: { type: 'http-basic', username: 'admin' },
            expectedType: 'http-basic',
            expectedDetails: ['username:', 'admin'],
        },
        {
            name: 'api-token with no additional fields',
            auth: { type: 'api-token' },
            expectedType: 'api-token',
            expectedDetails: [],
        },
        {
            name: 'oauth2-client-credentials with clientId and tokenUri',
            auth: {
                type: 'oauth2-client-credentials',
                clientId: 'my-client-id',
                tokenUri: 'https://dhis2.org/oauth/token',
            },
            expectedType: 'oauth2-client-credentials',
            expectedDetails: [
                'clientId:',
                'my-client-id',
                'tokenUri:',
                'https://dhis2.org/oauth/token',
            ],
        },
    ]
    it.each(authTestCases)(
        'should display $name correctly',
        async ({ auth, expectedType, expectedDetails }) => {
            const routeWithAuth = {
                routes: [
                    {
                        id: 'test-id',
                        code: 'test-code',
                        name: 'test-name',
                        url: 'https://example.com',
                        disabled: false,
                        auth,
                    },
                ],
            }
            const { findByText } = render(
                <TestComponentWithRouter
                    path="/"
                    customData={{
                        authorities: [],
                        routes: routeWithAuth,
                        me: {},
                    }}
                >
                    <RoutesList />
                </TestComponentWithRouter>
            )
            // Verify auth type is displayed
            expect(await findByText(expectedType)).toBeInTheDocument()
            // Verify additional details are visible (no hover needed!)
            for (const detail of expectedDetails) {
                expect(await findByText(new RegExp(detail))).toBeInTheDocument()
            }
        }
    )
    it('should display "No authentication" when no auth configured', async () => {
        const routeWithoutAuth = {
            routes: [
                {
                    id: 'test-id',
                    code: 'test-code',
                    name: 'test-name',
                    url: 'https://example.com',
                    disabled: false,
                    auth: null,
                },
            ],
        }
        const { findByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: routeWithoutAuth,
                    me: {},
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('No authentication')
    })
    it('should not show type field in details', async () => {
        const routeWithBasicAuth = {
            routes: [
                {
                    id: 'test-id',
                    code: 'test-code',
                    name: 'test-name',
                    url: 'https://example.com',
                    disabled: false,
                    auth: {
                        type: 'http-basic',
                        username: 'admin',
                    },
                },
            ],
        }
        const { findByText, queryByText } = render(
            <TestComponentWithRouter
                path="/"
                customData={{
                    authorities: [],
                    routes: routeWithBasicAuth,
                    me: {},
                }}
            >
                <RoutesList />
            </TestComponentWithRouter>
        )
        await findByText('http-basic')
        // Verify 'type:' is NOT shown in the details section
        expect(queryByText(/^type:/i)).not.toBeInTheDocument()
    })
})

const mockRoutes = {
    pager: {
        page: 1,
        total: 2,
        pageSize: 50,
        pageCount: 1,
    },
    routes: [
        {
            code: 'code-1',
            name: 'name-1',
            created: '2025-02-28T12:47:09.707',
            lastUpdated: '2025-02-28T12:47:09.707',
            translations: [],
            createdBy: {
                id: 'GOLswS44mh8',
                code: null,
                name: 'Tom Wakiki',
                displayName: 'Tom Wakiki',
                username: 'system',
            },
            favorites: [],
            lastUpdatedBy: {
                id: 'GOLswS44mh8',
                code: null,
                name: 'Tom Wakiki',
                displayName: 'Tom Wakiki',
                username: 'system',
            },
            sharing: {
                owner: 'GOLswS44mh8',
                external: false,
                users: {},
                userGroups: {},
                public: 'rw------',
            },
            disabled: true,
            url: 'https://postman-echo.com/get',
            headers: {
                x: '11111',
                y: '2',
            },
            authorities: [],
            responseTimeoutSeconds: 5,
            access: {
                manage: true,
                externalize: true,
                write: true,
                read: true,
                update: true,
                delete: true,
            },
            displayName: '2222',
            favorite: false,
            user: {
                id: 'GOLswS44mh8',
                code: null,
                name: 'Tom Wakiki',
                displayName: 'Tom Wakiki',
                username: 'system',
            },
            href: 'https://debug.dhis2.org/dev/api/42/routes/x986uhPfIpI',
            id: 'x986uhPfIpI',
            attributeValues: [],
        },
        {
            code: 'code-2',
            name: 'name-2',
            disabled: false,
            url: 'https://postman-echo.com/get',
            headers: {
                x: '1',
                y: '2',
            },
            authorities: [],
            responseTimeoutSeconds: 5,
            displayName: 'name-2',
            href: 'https://debug.dhis2.org/dev/api/42/routes/q5k2AjRHfd0',
            id: 'q5k2AjRHfd0',
            attributeValues: [],
        },
    ],
}

const mockRouteWithWildpath = {
    pager: {},
    routes: [
        {
            code: 'code-2',
            name: 'name-2',
            disabled: false,
            url: 'https://postman-echo.com/get/**',
            headers: {
                x: '1',
                y: '2',
            },
            authorities: [],
            responseTimeoutSeconds: 5,
            displayName: 'name-2',
            href: 'https://debug.dhis2.org/dev/api/42/routes/q5k2AjRHfd0',
            id: 'q5k2AjRHfd0',
            attributeValues: [],
        },
    ],
}
