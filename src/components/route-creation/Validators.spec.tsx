import { routeDestinationUrl } from './Validators'

jest.mock('@dhis2/d2-i18n', () => ({
    __esModule: true,
    default: {
        t: jest.fn((text: string) => text),
    },
}))

const expectValid = (value?: string) => {
    expect(routeDestinationUrl(value)).toBeUndefined()
}

const expectInvalid = (value: string | undefined, message: string) => {
    expect(routeDestinationUrl(value)).toEqual(message)
}

describe('routeDestinationUrl', () => {
    const invalidUrlMessage =
        'Enter a valid URL, for example http://localhost:5000/path or https://example.com'
    const invalidProtocolMessage = 'Only http or https URLs are allowed'

    describe('valid values', () => {
        const allowedRouteUrls = [
            undefined,
            'https://example.org/api',
            'http://localhost:5000/path',
            'http://test:4000/etc',
            'http://127.0.0.1/etc',
        ]

        it.each(allowedRouteUrls)('treats %s as valid', (value) => {
            expectValid(value as string | undefined)
        })

        it('allows values with surrounding whitespace once trimmed', () => {
            expectValid('   https://example.org/api  ')
        })
    })

    describe('invalid values', () => {
        it.each(['', '   ', 'not a url', 'http://:8080/path'])
            ('rejects malformed input %s', (value) => {
                expectInvalid(value, invalidUrlMessage)
            })

        it('rejects unsupported protocols', () => {
            expectInvalid('test://localhost:4000/path', invalidProtocolMessage)
        })
    })
})
