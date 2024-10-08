import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import React, { useState } from 'react'
import classes from '../../App.module.css'
import { UpsertRoute } from '../../components/route-creation'
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
}

const RoutesList = () => {
    // Todo: update the type for delete mutation
    // @ts-expect-error("the error is because because delete mutation expects hardcoded ID but that's not accurate (it can take a function return a string)
    const [deleteRoute] = useDataMutation(deleteRouteMutation)

    const { data: allRoutesList, refetch: refetchRoutesList } =
        useDataQuery<WrapQueryResponse<ApiRouteData[], 'routes'>>(
            listRoutesQuery
        )

    const handleDeleteRoute = async (routeCode: string) => {
        await deleteRoute({ id: routeCode })
        refetchRoutesList()
    }

    const [isCreateModalVisible, showCreateModal] = useState(false)
    const [isTestRouteModalVisible, showTestRouteModal] = useState(false)

    const [activeRoute, setActiveRoute] = useState<ApiRouteData>(undefined)

    const handleShowCreateModal = () => {
        showCreateModal(true)
    }

    const handleShowTestModal = (route: ApiRouteData) => {
        setActiveRoute(route)
        showTestRouteModal(true)
    }

    const handleEditRoute = (route: ApiRouteData) => {
        setActiveRoute(route)
        showCreateModal(true)
    }

    const onSave = () => {
        refetchRoutesList()
        showCreateModal(false)
    }

    const onCloseCreateRouteModal = () => {
        showCreateModal(false)
        setActiveRoute(undefined)
    }

    const onCloseTestModal = () => {
        showTestRouteModal(false)
        setActiveRoute(undefined)
    }

    return (
        <div className={classes.container}>
            {isCreateModalVisible && (
                <UpsertRoute
                    route={activeRoute}
                    closeModal={onCloseCreateRouteModal}
                    onSave={onSave}
                />
            )}

            {isTestRouteModalVisible && (
                <TestRoute route={activeRoute} closeModal={onCloseTestModal} />
            )}

            <div className={classes.actionsStrip}>
                <Button onClick={handleShowCreateModal}>
                    {i18n.t('Create New Route')}
                </Button>
            </div>

            <RoutesTable
                routes={allRoutesList?.routes?.routes}
                showEditRouteModal={handleEditRoute}
                showTestRouteModal={handleShowTestModal}
                deleteRoute={handleDeleteRoute}
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
