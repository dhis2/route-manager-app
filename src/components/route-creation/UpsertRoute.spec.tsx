import { useConfig, useDataMutation } from '@dhis2/app-runtime'
import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import TestComponentWithRouter from '../../test-utils/render'
import UpsertRoute from './UpsertRoute'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useDataMutation: jest.fn(),
    useConfig: jest.fn(),
}))

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: jest.fn(() => ({})),
    useNavigate: jest.fn(),
}))

afterEach(() => {
    jest.clearAllMocks()
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

    const useParamsMock = useParams as jest.Mock
    useParamsMock.mockReturnValue({})

    jest.mocked(useConfig).mockReturnValue({
        baseUrl: 'http://localhost:8080',
        apiVersion: 41,
        serverVersion: {
            major: 2,
            minor: 41,
            full: '2.41.0',
        },
    } as ReturnType<typeof useConfig>)
})

describe('Creating a route', () => {
    it('should send the correct data', async () => {
        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [], routes: jest.fn() }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            within(getByTestId('input-code')).getByRole('textbox'),
            'code-1'
        )
        await user.type(
            within(getByTestId('input-name')).getByRole('textbox'),
            'name-1'
        )
        await user.type(
            within(getByTestId('input-url')).getByRole('textbox'),
            'https://postman-echo.com/get'
        )
        await user.click(getByText('Save Route'))

        expect(navigateSpy).toHaveBeenCalledWith('/')
        expect(mutateSpy).toHaveBeenCalledWith({
            data: {
                code: 'code-1',
                disabled: false,
                name: 'code-1name-1',
                url: 'https://postman-echo.com/get',
            },
        })
    })

    it.each([
        'http://localhost:5000/path',
        'http://test:4000/etc',
        'http://127.0.0.1/etc',
    ])('should allow saving routes with %s', async (testUrl) => {
        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [], routes: jest.fn() }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            within(getByTestId('input-code')).getByRole('textbox'),
            'code-1'
        )
        await user.type(
            within(getByTestId('input-name')).getByRole('textbox'),
            'name-1'
        )
        await user.type(
            within(getByTestId('input-url')).getByRole('textbox'),
            testUrl
        )
        await user.click(getByText('Save Route'))

        expect(navigateSpy).toHaveBeenCalledWith('/')
        expect(mutateSpy).toHaveBeenCalledWith({
            data: {
                code: 'code-1',
                disabled: false,
                name: 'code-1name-1',
                url: testUrl,
            },
        })
    })

    it('should send the correct data (basic authentication)', async () => {
        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [] }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            getByTestId('input-code').querySelector('input'),
            'code-1'
        )
        await user.type(
            getByTestId('input-name').querySelector('input'),
            'name-1'
        )
        await user.type(
            getByTestId('input-url').querySelector('input'),
            'https://postman-echo.com/get'
        )

        await user.click(
            within(getByTestId('select-authentication')).getByText('None')
        )
        await user.click(getByText('Basic'))

        await user.type(
            within(getByTestId('input-auth-username')).getByRole('textbox'),
            'admin'
        )
        await user.type(
            getByTestId('input-auth-password').querySelector(
                '[type="password"]'
            ),
            'district'
        )

        await user.click(getByText('Save Route'))

        expect(mutateSpy).toHaveBeenCalledTimes(1)
        expect(mutateSpy.mock.calls[0][0].data.auth).toEqual({
            password: 'district',
            type: 'http-basic',
            username: 'admin',
        })
    })

    it('should send the correct data (token authentication)', async () => {
        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [] }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            getByTestId('input-code').querySelector('input'),
            'code-1'
        )
        await user.type(
            getByTestId('input-name').querySelector('input'),
            'name-1'
        )
        await user.type(
            getByTestId('input-url').querySelector('input'),
            'https://postman-echo.com/get'
        )

        await user.click(
            within(getByTestId('select-authentication')).getByText('None')
        )
        await user.click(getByText('API Token'))

        await user.type(
            getByTestId('input-auth-token').querySelector('[type="password"]'),
            'TOKEN-X'
        )

        await user.click(getByText('Save Route'))

        expect(mutateSpy).toHaveBeenCalledTimes(1)
        expect(mutateSpy.mock.calls[0][0].data.auth).toEqual({
            type: 'api-token',
            token: 'TOKEN-X',
        })
    })

    it('should NOT show OAuth2 client credentials option on DHIS2 versions < 2.42', async () => {
        jest.mocked(useConfig).mockReturnValue({
            baseUrl: 'http://localhost:8080',
            apiVersion: 41,
            serverVersion: {
                major: 2,
                minor: 41,
                full: '2.41.0',
            },
        } as ReturnType<typeof useConfig>)

        const { getByTestId, queryByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [] }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            getByTestId('input-code').querySelector('input')!,
            'code-old'
        )
        await user.type(
            getByTestId('input-name').querySelector('input')!,
            'Old DHIS2 Route'
        )
        await user.type(
            getByTestId('input-url').querySelector('input')!,
            'https://example.com'
        )

        const authSelect = getByTestId('select-authentication')
        await user.click(
            within(authSelect).getByTestId('dhis2-uicore-select-input')
        )

        expect(queryByText('OAuth2 Client Credentials')).not.toBeInTheDocument()
    })

    it('should send the correct data (oauth2 client credentials authentication) on DHIS2 2.42+', async () => {
        jest.mocked(useConfig).mockReturnValue({
            serverVersion: { major: 2, minor: 42, full: '2.42.0' },
            apiVersion: 42,
            baseUrl: 'http://localhost:8080',
        })

        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [] }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            getByTestId('input-code').querySelector('input'),
            'code-1'
        )
        await user.type(
            getByTestId('input-name').querySelector('input'),
            'name-1'
        )
        await user.type(
            getByTestId('input-url').querySelector('input'),
            'https://postman-echo.com/get'
        )

        await user.click(
            within(getByTestId('select-authentication')).getByText('None')
        )
        await user.click(getByText('OAuth2 Client Credentials'))

        await user.type(
            within(getByTestId('input-auth-client-id')).getByRole('textbox'),
            'alice'
        )
        await user.type(
            getByTestId('input-auth-client-secret').querySelector(
                '[type="password"]'
            ),
            'passw0rd'
        )
        await user.type(
            within(getByTestId('input-auth-token-uri')).getByRole('textbox'),
            'https://token-service/token'
        )

        await user.click(getByText('Save Route'))

        expect(mutateSpy).toHaveBeenCalledTimes(1)
        expect(mutateSpy.mock.calls[0][0].data.auth).toEqual({
            type: 'oauth2-client-credentials',
            clientId: 'alice',
            clientSecret: 'passw0rd',
            tokenUri: 'https://token-service/token',
        })
    })

    it('should send the correct data (authorities)', async () => {
        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{
                    authorities: {
                        systemAuthorities: [
                            {
                                id: 'F_ACCEPT_DATA_LOWER_LEVELS',
                                name: 'Accept data at lower levels',
                            },
                            {
                                id: 'F_MINMAX_DATAELEMENT_ADD',
                                name: 'Add/Update Min-Max Data Element',
                            },
                        ],
                    },
                }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            getByTestId('input-code').querySelector('input'),
            'code-1'
        )
        await user.type(
            getByTestId('input-name').querySelector('input'),
            'name-1'
        )
        await user.type(
            getByTestId('input-url').querySelector('input'),
            'https://postman-echo.com/get'
        )

        await user.click(
            getByTestId('select-authorities').querySelector(
                '[data-test="dhis2-uicore-select-input"]'
            )
        )
        await user.click(getByText(/F_ACCEPT_DATA_LOWER_LEVELS/))

        await user.click(getByText('Save Route'))

        expect(mutateSpy).toHaveBeenCalledTimes(1)
        expect(mutateSpy.mock.calls[0][0].data.authorities).toEqual([
            'F_ACCEPT_DATA_LOWER_LEVELS',
        ])
    })

    it('should send the correct data (customm headers)', async () => {
        const { getByTestId, getByText, getByPlaceholderText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{
                    authorities: {
                        systemAuthorities: [
                            {
                                id: 'F_ACCEPT_DATA_LOWER_LEVELS',
                                name: 'Accept data at lower levels',
                            },
                            {
                                id: 'F_MINMAX_DATAELEMENT_ADD',
                                name: 'Add/Update Min-Max Data Element',
                            },
                        ],
                    },
                }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            getByTestId('input-code').querySelector('input'),
            'code-1'
        )
        await user.type(
            getByTestId('input-name').querySelector('input'),
            'name-1'
        )
        await user.type(
            getByTestId('input-url').querySelector('input'),
            'https://postman-echo.com/get'
        )

        const headerNameInput = getByPlaceholderText('Header name')
        const headerValueInput = getByPlaceholderText('Header value')
        const addButton = getByText('Add')

        await user.type(headerNameInput, 'X-HEADER-1')
        await user.type(headerValueInput, 'value-1')
        await user.click(addButton)

        await user.type(headerNameInput, 'X-HEADER-2')
        await user.type(headerValueInput, 'value-2')
        await user.click(addButton)

        // updating first header again
        await user.type(headerNameInput, 'X-HEADER-1')
        await user.type(headerValueInput, 'value-1-updated')
        await user.click(addButton)

        await user.click(getByText('Save Route'))

        expect(mutateSpy).toHaveBeenCalledTimes(1)
        expect(mutateSpy.mock.calls[0][0].data.headers).toEqual({
            'X-HEADER-1': 'value-1-updated',
            'X-HEADER-2': 'value-2',
        })
    })

    it('should show a user-friendly error from the backend if one exists', async () => {
        const { getByTestId, getByText } = render(
            <TestComponentWithRouter
                path="/create-route"
                customData={{ authorities: [], routes: jest.fn() }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        const user = userEvent.setup()

        await user.type(
            within(getByTestId('input-code')).getByRole('textbox'),
            'code-1'
        )
        await user.type(
            within(getByTestId('input-name')).getByRole('textbox'),
            'name-1'
        )
        await user.type(
            within(getByTestId('input-url')).getByRole('textbox'),
            'https://postman-echo.com/get'
        )

        mutateSpy.mockImplementationOnce(() => {
            return Promise.reject({
                details: {
                    httpStatus: 'Conflict',
                    httpStatusCode: 409,
                    status: 'ERROR',
                    message:
                        'One or more errors occurred, please see full details in import report.',
                    response: {
                        klass: 'org.hisp.dhis.route.Route',
                        uid: 'okyn6lJAm4S',
                        errorReports: [
                            {
                                message:
                                    'Property `name` with value `x1x` on object x1x [okyn6lJAm4S] (Route) already exists on object q5k2AjRHfd0',
                            },
                        ],
                        responseType: 'ObjectReportWebMessageResponse',
                    },
                },
            })
        })

        await user.click(getByText('Save Route'))

        expect(
            getByText(
                'Failed to save route: Property `name` with value `x1x` on object x1x [okyn6lJAm4S] (Route) already exists on object q5k2AjRHfd0'
            )
        ).toBeInTheDocument()
    })
})

describe('Editing a route', () => {
    it('should send the correct data', async () => {
        const routesMock = jest.fn(() => {
            return {
                code: 'code-x',
                name: 'route-x',
                url: 'https://postman-echo.com/get',
                headers: {
                    'x-header': '1',
                    'y-header': '2',
                },
                authorities: [],
                id: 'q5k2AjRHfd0',
            }
        })
        const useParamsMock = useParams as jest.Mock
        useParamsMock.mockReturnValue({ routeId: 'q5k2AjRHfd0' })

        const { getByTestId, findByText, getByText } = render(
            <TestComponentWithRouter
                path="/create-route/q5k2AjRHfd0"
                customData={{ authorities: [], routes: routesMock }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        await findByText('Edit route: route-x')

        expect(
            within(getByTestId('input-code')).getByRole('textbox')
        ).toHaveValue('code-x')

        expect(
            within(getByTestId('input-name')).getByRole('textbox')
        ).toHaveValue('route-x')

        const inputUrl = within(getByTestId('input-url')).getByRole('textbox')

        expect(inputUrl).toHaveValue('https://postman-echo.com/get')

        const user = userEvent.setup()

        await user.clear(inputUrl)
        await user.type(inputUrl, 'https://postman-echo.com/post-not-get')
        await user.click(getByText('Save Route'))

        expect(navigateSpy).toHaveBeenCalledWith('/')
        expect(mutateSpy).toHaveBeenCalledWith({
            id: 'q5k2AjRHfd0',
            data: {
                url: 'https://postman-echo.com/post-not-get',
                code: 'code-x',
                name: 'route-x',
                disabled: false,
                authorities: [],
                headers: { 'x-header': '1', 'y-header': '2' },
            },
        })
    })
    it('should should return to previous page on cancel', async () => {
        const routesMock = jest.fn(() => ({
            name: 'route-x',
        }))
        const useParamsMock = useParams as jest.Mock
        useParamsMock.mockReturnValue({ routeId: 'q5k2AjRHfd0' })

        const { findByText, getByText } = render(
            <TestComponentWithRouter
                path="/create-route/q5k2AjRHfd0"
                customData={{ authorities: [], routes: routesMock }}
            >
                <UpsertRoute />
            </TestComponentWithRouter>
        )

        await findByText('Edit route: route-x')

        const user = userEvent.setup()

        await user.click(getByText('Cancel'))

        expect(navigateSpy).toHaveBeenCalledWith(-1)
    })
})
