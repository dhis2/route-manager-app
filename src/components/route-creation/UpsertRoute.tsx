import { useAlert, useDataMutation } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalContent,
    ModalTitle,
    ModalActions,
    ButtonStrip,
    Button,
    InputField,
} from '@dhis2/ui'
import React, { useState } from 'react'
import classes from '../../App.module.css'
import {
    ApiRouteCreationPayload,
    ApiRouteData,
    Authority,
    RouteAuthConfig,
} from '../../types/RouteInfo'
import AuthoritiesSelect from './AuthoritiesSelect'
import RouteAuthAdmin from './RouteAuthAdmin'

const createRouteMutation = {
    resource: 'routes',
    type: 'create' as const,
    data: ({ data }) => ({
        ...data,
        disabled: false,
    }),
}

const updateRouteMutation = {
    resource: 'routes',
    type: 'update' as const,
    id: ({ id }) => id,
    data: ({ data }) => ({
        ...data,
        disabled: false,
    }),
}

type UpsertRouteProps = {
    authorities: Authority[]
    route: ApiRouteData
    closeModal: VoidFunction
    onSave: VoidFunction
}

const UpsertRoute: React.FC<UpsertRouteProps> = ({
    authorities: allAuthorities = [],
    route = {} as Partial<ApiRouteData>,
    closeModal = () => {},
    onSave = () => {},
}) => {
    const [code, setCode] = useState(route.code ?? '')
    const [name, setName] = useState(route.name ?? '')
    const [urlValue, setValue] = useState(route.url ?? '')
    const [authConfig, setAuthConfig] = useState<Partial<RouteAuthConfig>>(
        route.auth
    )
    const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>(
        () => route.authorities ?? []
    )
    const [loading, setLoading] = useState(false)

    const { show } = useAlert(
        ({ type, error }) => {
            if (type === 'success') {
                return i18n.t('Route saved successfully')
            }
            if (type === 'error') {
                return i18n.t('Failed to save route: {{error}}', {
                    error,
                    nsSeparator: '-:-',
                })
            }
        },
        ({ type }) => {
            if (type === 'success') {
                return { success: true }
            }
            if (type === 'error') {
                return { critical: true }
            }
        }
    )

    const options = {
        onComplete: () => {
            show({ type: 'success' })
            setLoading(false)
        },
        onError: (error) => {
            show({ type: 'error', error: error.message })
            setLoading(false)
        },
    }
    const [createRoute] = useDataMutation(createRouteMutation, options)

    // @ts-expect-error("we need the ID to be dynamic, which is allowed but not reflected in the type")
    const [updateRoute] = useDataMutation(updateRouteMutation, options)

    const updateAuthConfig = (update: Partial<RouteAuthConfig> = {}) => {
        setAuthConfig((data) => {
            // reset properties if changing auth type
            if (update.type && data?.type && update.type !== data.type) {
                return update
            }

            return {
                ...data,
                ...update,
            }
        })
    }
    const handeCreateRoute = async () => {
        setLoading(true)
        try {
            const data: ApiRouteCreationPayload = {
                url: urlValue,
                code,
                name,
                disabled: false,
            }
            if (authConfig && authConfig.type) {
                data.auth = authConfig as RouteAuthConfig
            }

            if (selectedAuthorities) {
                data.authorities = selectedAuthorities
            }

            if (route?.id) {
                await updateRoute({
                    id: route.id,
                    data,
                })

                onSave()
            } else {
                await createRoute({
                    data,
                })

                onSave()
            }
        } catch (err) {
            show({ type: 'error', message: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal onClose={closeModal}>
            <ModalTitle>{i18n.t('Route details')}</ModalTitle>
            <ModalActions>
                <ButtonStrip end>
                    <Button
                        loading={loading}
                        disabled={loading}
                        primary
                        onClick={handeCreateRoute}
                    >
                        {i18n.t('Save Route')}
                    </Button>
                    <Button secondary onClick={closeModal}>
                        {i18n.t('Cancel')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
            <ModalContent>
                <div className={classes.formContainer}>
                    <InputField
                        required
                        value={code}
                        onChange={({ value }) => setCode(value)}
                        onBlur={({ value }) => {
                            if (!name) {
                                setName(value)
                            }
                        }}
                        placeholder={i18n.t('A unique code for the route')}
                        label={i18n.t('Route code')}
                    />
                    <InputField
                        required
                        value={name}
                        onChange={({ value }) => setName(value)}
                        placeholder={i18n.t(
                            'A unique user-friendly name for the route'
                        )}
                        label={i18n.t('Route Name')}
                    />

                    <InputField
                        required
                        value={urlValue}
                        onChange={({ value }) => setValue(value)}
                        placeholder={i18n.t(
                            'e.g. https://postman-echo.com/get',
                            {
                                nsSeparator: '-:-',
                            }
                        )}
                        label={i18n.t('URL for route destination')}
                    />

                    <RouteAuthAdmin
                        authConfig={authConfig}
                        updateAuthConfig={updateAuthConfig}
                    />
                    <AuthoritiesSelect
                        authorities={allAuthorities}
                        route={route}
                        onSelect={setSelectedAuthorities}
                    />
                </div>
            </ModalContent>
        </Modal>
    )
}

export default UpsertRoute
