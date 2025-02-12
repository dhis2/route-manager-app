import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption, InputField } from '@dhis2/ui'
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

    return (
        <>
            <SingleSelectField
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
            </SingleSelectField>
            {type === 'http-basic' && (
                <>
                    <InputField
                        value={authConfig.username}
                        onChange={({ value: username }) =>
                            updateAuthConfig({ username })
                        }
                        label={i18n.t('Username')}
                    />
                    <InputField
                        type="password"
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
                        type="password"
                        value={authConfig.token}
                        onChange={({ value: token }) =>
                            updateAuthConfig({ token })
                        }
                        label={i18n.t('Token')}
                    />
                </>
            )}
        </>
    )
}

export default RouteAuthAdmin
