import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    SingleSelectField,
    SingleSelectOption,
    InputField,
    Divider,
} from '@dhis2/ui'
import React from 'react'
import { AuthScheme, RouteAuthConfig } from '../../types/RouteInfo'

type RouteAuthAdminProps = {
    authConfig: Partial<RouteAuthConfig>
    updateAuthConfig: (update: Partial<RouteAuthConfig>) => void
}

const RouteAuthAdmin: React.FC<RouteAuthAdminProps> = ({
    authConfig = {} as Partial<RouteAuthConfig>,
    updateAuthConfig,
}) => {
    const { type } = authConfig
    const config = useConfig()
    const oauthSupported = config.serverVersion.minor >= 42

    return (
        <>
            <SingleSelectField
                dataTest="select-authentication"
                className="form-field"
                filterable={false}
                selected={type ?? 'n/a'}
                onChange={({ selected }) => {
                    if (selected === 'n/a') {
                        updateAuthConfig({ type: undefined })
                    } else {
                        updateAuthConfig({ type: selected as AuthScheme })
                    }
                }}
                label={i18n.t('Authentication Scheme')}
                inputWidth="400px"
            >
                <SingleSelectOption
                    label="None"
                    value="n/a"
                ></SingleSelectOption>
                <SingleSelectOption
                    label="Basic"
                    value="http-basic"
                ></SingleSelectOption>
                <SingleSelectOption
                    label="API Token"
                    value="api-token"
                ></SingleSelectOption>
                {oauthSupported && (
                    <SingleSelectOption
                        label="OAuth2 Client Credentials"
                        value="oauth2-client-credentials"
                    ></SingleSelectOption>
                )}
            </SingleSelectField>
            {type === 'http-basic' && (
                <>
                    <InputField
                        dataTest="input-auth-username"
                        className="form-field"
                        value={authConfig.username}
                        onChange={({ value: username }) =>
                            updateAuthConfig({ username })
                        }
                        label={i18n.t('Username')}
                    />
                    <InputField
                        dataTest="input-auth-password"
                        className="form-field"
                        type="password"
                        autoComplete="off"
                        value={authConfig.password}
                        onChange={({ value: password }) =>
                            updateAuthConfig({ password })
                        }
                        label={i18n.t('Password')}
                    />
                </>
            )}
            {type === 'api-token' && (
                <>
                    <InputField
                        dataTest="input-auth-token"
                        type="password"
                        className="form-field"
                        value={authConfig.token}
                        onChange={({ value: token }) =>
                            updateAuthConfig({ token })
                        }
                        label={i18n.t('Token')}
                    />
                </>
            )}
            {type === 'oauth2-client-credentials' && (
                <>
                    <InputField
                        dataTest="input-auth-client-id"
                        className="form-field"
                        value={authConfig.clientId}
                        onChange={({ value: clientId }) =>
                            updateAuthConfig({ clientId })
                        }
                        label={i18n.t('Client ID')}
                    />
                    <InputField
                        dataTest="input-auth-client-secret"
                        className="form-field"
                        type="password"
                        autoComplete="off"
                        value={authConfig.clientSecret}
                        onChange={({ value: clientSecret }) =>
                            updateAuthConfig({ clientSecret })
                        }
                        label={i18n.t('Client Secret')}
                    />
                    <InputField
                        dataTest="input-auth-token-uri"
                        className="form-field"
                        value={authConfig.tokenUri}
                        onChange={({ value: tokenUri }) =>
                            updateAuthConfig({ tokenUri })
                        }
                        label={i18n.t('Token URI')}
                        placeholder={i18n.t('e.g. https://token-service/token')}
                    />
                </>
            )}
            {authConfig?.type && <Divider />}
        </>
    )
}

export default RouteAuthAdmin
