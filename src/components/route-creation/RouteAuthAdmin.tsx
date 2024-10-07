import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption, InputField } from '@dhis2/ui'
import React from 'react'
import { AuthScheme, RouteAuthConfig } from '../../types/RouteInfo'

type RouteAuthAdminProps = {
    authConfig: Partial<RouteAuthConfig>
    updateAuthConfig: (update: Partial<RouteAuthConfig>) => void
}

const RouteAuthAdmin: React.FC<RouteAuthAdminProps> = ({
    authConfig = {},
    updateAuthConfig,
}) => {
    const { type, username, password } = authConfig
    const showAuthDetails = !!type
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
            </SingleSelectField>
            {showAuthDetails && (
                <>
                    <InputField
                        value={username}
                        onChange={({ value: username }) =>
                            updateAuthConfig({ username })
                        }
                        label={i18n.t('Username')}
                    />
                    <InputField
                        value={password}
                        onChange={({ value: password }) =>
                            updateAuthConfig({ password })
                        }
                        label={i18n.t('Password')}
                    />
                </>
            )}
        </>
    )
}

export default RouteAuthAdmin
