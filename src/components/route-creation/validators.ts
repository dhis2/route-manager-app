import i18n from '@dhis2/d2-i18n'

const allowedProtocols = new Set(['http:', 'https:'])

const invalidUrlMessage = () =>
    i18n.t(
        'Enter a valid URL, for example http://localhost:5000/path or https://example.com',
        { nsSeparator: '-:-' }
    )

const invalidProtocolMessage = () =>
    i18n.t('Only http or https URLs are allowed', { nsSeparator: '-:-' })

export const routeDestinationUrl = (value?: string) => {
    if (typeof value !== 'string') {
        return undefined
    }

    const trimmedValue = value.trim()

    if (!trimmedValue) {
        return invalidUrlMessage()
    }

    try {
        const parsed = new URL(trimmedValue)

        if (!allowedProtocols.has(parsed.protocol)) {
            return invalidProtocolMessage()
        }

        if (!parsed.hostname) {
            return invalidUrlMessage()
        }

        return undefined
    } catch (error) {
        return invalidUrlMessage()
    }
}
