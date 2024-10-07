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
    RouteAuthConfig,
} from '../../types/RouteInfo'
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
    route: ApiRouteData
    closeModal: VoidFunction
    onSave: VoidFunction
}

const UpsertRoute: React.FC<UpsertRouteProps> = ({
    route = {},
    closeModal = () => {},
    onSave = () => {},
}) => {
    const [code, setCode] = useState(route.code ?? '')
    const [name, setName] = useState(route.name ?? '')
    const [urlValue, setValue] = useState(route.url ?? '')
    const [authConfig, setAuthConfig] = useState<RouteAuthConfig>(route.auth)
    const [authorities, setAuthorities] = useState<string>(() =>
        route.authorities?.join(',')
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
        onComplete: () => show({ type: 'success' }),
        onError: (error) => show({ type: 'error', error: error.message }),
    }
    const [createRoute] = useDataMutation(createRouteMutation, options)

    // @ts-expect-error("we need the ID to be dynamic, which is allowed but not reflected in the type")
    const [updateRoute] = useDataMutation(updateRouteMutation, options)

    const updateAuthConfig = (update: Partial<RouteAuthConfig>) => {
        setAuthConfig((data) => {
            return {
                ...data,
                ...update,
            }
        })
    }
    const handeCreateRoute = async () => {
        setLoading(true)
        try {
            const data: ApiRouteCreationPayload = { url: urlValue, code, name }
            if (authConfig && authConfig.type) {
                data.auth = authConfig
            }

            if (authorities) {
                data.authorities = authorities?.split(/[\s,]/)
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
            console.log('>>>eee', err)
            show({ type: 'error', message: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal>
            <ModalTitle>{i18n.t('Route details')}</ModalTitle>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={closeModal}>
                        {i18n.t('Close')}
                    </Button>
                    <Button
                        loading={loading}
                        disabled={loading}
                        primary
                        onClick={handeCreateRoute}
                    >
                        {i18n.t('Save Route')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
            <ModalContent>
                <div className={classes.formContainer}>
                    <InputField
                        value={code}
                        onChange={({ value }) => setCode(value)}
                        placeholder={i18n.t('A unique code for the route')}
                        label={i18n.t('Route code')}
                    />
                    <InputField
                        value={name}
                        onChange={({ value }) => setName(value)}
                        placeholder={i18n.t('A unique name for the route')}
                        label={i18n.t('Route Name')}
                    />

                    <InputField
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
                    <InputField
                        value={authorities}
                        onChange={({ value }) => setAuthorities(value)}
                        placeholder={i18n.t(
                            'comma separated list of authorities i.e. MY_AUTHORITY_1,MY_AUTHORITY_2'
                        )}
                        label={i18n.t('Authorities')}
                        helpText={i18n.t(
                            'Restrict access to cerain authorities'
                        )}
                    />
                </div>
            </ModalContent>
        </Modal>
    )
}

export default UpsertRoute
