import {
    useAlert,
    useDataEngine,
    useDataMutation,
    useDataQuery,
} from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, SharingDialog } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import classes from '../../App.module.css'
import TestRoute from '../../TestRoute'
import { ApiRouteData, WrapQueryResponse } from '../../types/RouteInfo'
import RoutesTable from './RoutesTable'

const deleteRouteMutation = {
    resource: 'routes',
    type: 'delete' as const,
    id: ({ id }) => id,
}

const listRoutesQuery = {
    routes: {
        resource: 'routes',
        params: {
            fields: '*',
            pageSize: 50,
        },
    },
    authorities: {
        resource: 'authorities',
        params: {
            fields: '*',
            pageSize: -1,
        },
    },
    currentUser: {
        resource: 'me',
        params: {
            fields: 'authorities',
        },
    },
}

type Authority = {
    id: string
    name: string
}

const RoutesList = () => {
    const [sharingDialogId, setSharingDialogId] = useState<string>()
    const [userHasPermissions, setUserHasPermissions] = useState(true)

    const navigate = useNavigate()

    const confirmDeleteAlert = useAlert(
        i18n.t('Are you sure you want to delete this route?'),
        (options) => ({
            warning: true,
            actions: [
                {
                    label: i18n.t('Confirm'),
                    onClick: () => performDeleteRoute(options.id),
                },
                {
                    label: i18n.t('Cancel'),
                    onClick: () => confirmDeleteAlert.hide(),
                },
            ],
        })
    )

    const deleteFailAlert = useAlert(
        ({ error }) =>
            i18n.t(`Failed to delete route {{message}}`, {
                message: error?.message,
            }),
        {
            critical: true,
        }
    )

    const updateFailAlert = useAlert(
        ({ error }) =>
            i18n.t(`Failed to update route {{message}}`, {
                message: error?.message,
            }),
        {
            critical: true,
        }
    )

    // Todo: update the type for delete mutation
    // @ts-expect-error("the error is because because delete mutation expects hardcoded ID but that's not accurate (it can take a function return a string)
    const [deleteRoute] = useDataMutation(deleteRouteMutation, {
        onError: (error) => deleteFailAlert.show({ error }),
    })

    const engine = useDataEngine()

    const { data, refetch: refetchRoutesList } = useDataQuery<
        WrapQueryResponse<ApiRouteData[], 'routes'> &
            WrapQueryResponse<Authority[], 'authorities', 'systemAuthorities'> &
            WrapQueryResponse<string[], 'currentUser', 'authorities'>
    >(listRoutesQuery)

    const routes = data?.routes?.routes

    const userAuthorities = data?.currentUser?.authorities

    useEffect(() => {
        if (
            userAuthorities &&
            !userAuthorities.includes('F_ROUTE_PUBLIC_ADD')
        ) {
            setUserHasPermissions(false)
        }
    }, [userAuthorities])

    const handleDeleteRoute = async (routeCode: string) => {
        confirmDeleteAlert.show({ id: routeCode })
    }

    const performDeleteRoute = async (id: string) => {
        await deleteRoute({ id })
        refetchRoutesList()
    }

    const [isTestRouteModalVisible, showTestRouteModal] = useState(false)

    const [activeRoute, setActiveRoute] = useState<ApiRouteData>(undefined)

    const handleShowSharingDialog = (route: ApiRouteData) => {
        setSharingDialogId(route.id)
    }

    const handleShowTestModal = (route: ApiRouteData) => {
        setActiveRoute(route)
        showTestRouteModal(true)
    }

    const onCloseTestModal = () => {
        showTestRouteModal(false)
        setActiveRoute(undefined)
    }

    const onToggle = async (route: ApiRouteData, disabled: boolean) => {
        try {
            await engine.mutate({
                resource: 'routes',
                id: route.id,
                type: 'json-patch' as const,
                data: [
                    {
                        op: 'replace',
                        path: '/disabled',
                        value: disabled,
                    },
                ],
            })

            refetchRoutesList()
        } catch (error) {
            updateFailAlert.show({ error })
        }
    }

    return (
        <div>
            {isTestRouteModalVisible && (
                <TestRoute route={activeRoute} closeModal={onCloseTestModal} />
            )}

            {sharingDialogId && (
                <SharingDialog
                    id={sharingDialogId}
                    // ToDo: update the type in UI library to accept "route"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    type={'route' as any}
                    onClose={() => setSharingDialogId(undefined)}
                />
            )}

            <div className={classes.actionsStrip}>
                <Button onClick={() => navigate('create-route')}>
                    {i18n.t('Create New Route')}
                </Button>
            </div>

            <RoutesTable
                routes={routes}
                showTestRouteModal={handleShowTestModal}
                showSharingDialog={handleShowSharingDialog}
                deleteRoute={handleDeleteRoute}
                onToggle={onToggle}
                showPermissionError={!userHasPermissions}
            />

            <div className={classes.tableContainerFooter}>
                <a
                    target="_blank"
                    href="https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/route.html"
                    rel="noreferrer"
                >
                    Route API Documentation
                </a>
            </div>
        </div>
    )
}

export default RoutesList
