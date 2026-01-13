import { useAlert, useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    ButtonStrip,
    Button,
    Card,
    ReactFinalForm,
    InputFieldFF,
    hasValue,
    composeValidators,
} from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import classes from '../../App.module.css'
import {
    ApiRouteCreationPayload,
    ApiRouteData,
    Authority,
    RouteAuthConfig,
    WrapQueryResponse,
    WrapQueryResponseSingle,
} from '../../types/RouteInfo'
import AuthoritiesSelect from './AuthoritiesSelect'
import CustomHeadersAdmin from './CustomHeadersAdmin'
import RouteAuthAdmin from './RouteAuthAdmin'
import styles from './UpsertRoute.module.css'
import { routeDestinationUrl } from './Validators'

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

const listAuthoritiesQuery = {
    authorities: {
        resource: 'authorities',
        params: {
            fields: '*',
            pageSize: -1,
        },
    },
}

const getRouteQuery = {
    route: {
        resource: 'routes',
        id: ({ id }) => id,
        params: {
            fields: 'id, name, code, url, auth, authorities, headers',
        },
    },
}

const formatError = (err) => {
    const messages = err?.details?.response?.errorReports?.map?.(
        ({ message }) => message
    )

    const friendlyMessage = messages?.join?.() ?? err?.message
    return friendlyMessage
}

const UpsertRoute = () => {
    const navigate = useNavigate()
    const params = useParams()
    const { routeId } = params
    const { data: authoritiesData } =
        useDataQuery<
            WrapQueryResponse<Authority[], 'authorities', 'systemAuthorities'>
        >(listAuthoritiesQuery)

    const { data: routeData, refetch } = useDataQuery<
        WrapQueryResponseSingle<ApiRouteData, 'route'>
    >(getRouteQuery, {
        lazy: true,
    })

    const [route, setRoute] = useState<ApiRouteData>()

    useEffect(() => {
        setRoute(routeData?.route)
    }, [routeData])

    useEffect(() => {
        if (routeId) {
            refetch({ id: routeId })
        }
    }, [routeId, refetch])

    const allAuthorities = authoritiesData?.authorities.systemAuthorities

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

    const onSave = () => {
        navigate('/')
    }

    const options = {
        onComplete: () => {
            show({ type: 'success' })
            setLoading(false)
        },
        onError: (error) => {
            show({ type: 'error', error: formatError(error) })
            setLoading(false)
        },
    }
    const [createRoute] = useDataMutation(createRouteMutation, options)

    // @ts-expect-error("we need the ID to be dynamic, which is allowed but not reflected in the type")
    const [mutateRoute] = useDataMutation(updateRouteMutation, options)

    const handleSubmit = async (route) => {
        setLoading(true)
        try {
            const data: ApiRouteCreationPayload = {
                url: route?.url,
                code: route?.code,
                name: route?.name,
                disabled: false,
            }
            if (route?.auth?.type) {
                data.auth = route.auth as RouteAuthConfig
            }

            if (route?.authorities) {
                data.authorities = route.authorities
            }

            if (route?.headers && Object.keys(route?.headers)?.length > 0) {
                data.headers = route.headers
            }

            if (routeId) {
                await mutateRoute({
                    id: routeId,
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
            show({ type: 'error', error: formatError(err) })
        } finally {
            setLoading(false)
        }
    }

    const formTitle = routeId
        ? i18n.t('Edit route: {{name}}', {
              nsSeparator: '-:-',
              name: route?.name,
          })
        : i18n.t('Create route')
    return (
        <div>
            <div className={styles.breadcrumb}>
                <span>
                    <Link className={styles.breadcrumbLink} to="/">
                        Routes list
                    </Link>
                </span>{' '}
                / {formTitle}
            </div>
            <Card>
                <ReactFinalForm.Form
                    initialValues={route ?? {}}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit, valid, form, values }) => (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formContainer}>
                                <h2 className={styles.formTitle}>
                                    {formTitle}
                                </h2>
                                <p className={styles.formDescription}>
                                    Manage the route settings. For more
                                    information, consult the{' '}
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href="https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/route.html"
                                    >
                                        Route API documentation
                                    </a>
                                    .
                                </p>
                                <div className={classes.formContainer}>
                                    <ReactFinalForm.Field
                                        component={InputFieldFF}
                                        dataTest="input-code"
                                        className="form-field"
                                        required
                                        validate={hasValue}
                                        name="code"
                                        onBlur={({ value }) => {
                                            if (!values?.name) {
                                                form.change('name', value)
                                            }
                                        }}
                                        helpText={i18n.t('A unique code for the route, which can be used as the URL segment to run the route, e.g. /api/routes/my-route/run')}
                                        placeholder={i18n.t(
                                            'e.g. my-route'
                                        )}
                                        label={i18n.t('Route code')}
                                    />

                                    <ReactFinalForm.Field
                                        component={InputFieldFF}
                                        className="form-field"
                                        required
                                        validate={hasValue}
                                        dataTest="input-name"
                                        name="name"
                                        helpText={i18n.t('A unique, human-readable name for the route')}
                                        placeholder={i18n.t(
                                            'e.g. My Route'
                                        )}
                                        label={i18n.t('Route Name')}
                                    />

                                    <ReactFinalForm.Field
                                        component={InputFieldFF}
                                        required
                                        dataTest="input-url"
                                        className="form-field"
                                        validate={composeValidators(
                                            hasValue,
                                            routeDestinationUrl
                                        )}
                                        name="url"
                                        initialValue={route?.url}
                                        placeholder={i18n.t(
                                            'e.g. https://postman-echo.com/get',
                                            {
                                                nsSeparator: '-:-',
                                            }
                                        )}
                                        label={i18n.t(
                                            'URL for route destination'
                                        )}
                                    />
                                    <ReactFinalForm.Field
                                        name="auth"
                                        render={() => {
                                            return (
                                                <RouteAuthAdmin
                                                    authConfig={values?.auth}
                                                    updateAuthConfig={(
                                                        update
                                                    ) => {
                                                        if (
                                                            update?.type &&
                                                            update.type !=
                                                                values.auth
                                                                    ?.type
                                                        ) {
                                                            // resetting when changing auth type
                                                            form.change(
                                                                'auth',
                                                                update
                                                            )
                                                        } else {
                                                            form.change(
                                                                'auth',
                                                                {
                                                                    ...values.auth,
                                                                    ...update,
                                                                }
                                                            )
                                                        }
                                                    }}
                                                />
                                            )
                                        }}
                                    ></ReactFinalForm.Field>

                                    <AuthoritiesSelect
                                        authorities={allAuthorities}
                                        selectedAuthorities={
                                            values?.authorities
                                        }
                                        onSelect={(authorities) =>
                                            form.change(
                                                'authorities',
                                                authorities
                                            )
                                        }
                                    />

                                    <CustomHeadersAdmin
                                        headers={values?.headers}
                                        setHeaders={(headers) => {
                                            form.change('headers', headers)
                                        }}
                                    />
                                </div>
                                <ButtonStrip className="form-field">
                                    <Button
                                        title="Save Route"
                                        type="submit"
                                        loading={loading}
                                        disabled={loading || !valid}
                                        primary
                                    >
                                        {i18n.t('Save Route')}
                                    </Button>
                                    <Button
                                        secondary
                                        onClick={() => navigate(-1)}
                                    >
                                        {i18n.t('Cancel')}
                                    </Button>
                                </ButtonStrip>
                            </div>
                        </form>
                    )}
                </ReactFinalForm.Form>
            </Card>
        </div>
    )
}

export default UpsertRoute
