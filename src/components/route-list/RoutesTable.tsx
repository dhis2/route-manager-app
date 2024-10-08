import i18n from '@dhis2/d2-i18n'
import {
    Button,
    DataTable,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableHead,
    DataTableColumnHeader,
} from '@dhis2/ui'
import React from 'react'
import { ApiRouteData } from '../../types/RouteInfo'

type RoutesTableProps = {
    routes: ApiRouteData[]
    showTestRouteModal: (route: ApiRouteData) => void
    showEditRouteModal: (route: ApiRouteData) => void
    deleteRoute: (routeCode: string) => Promise<void>
    showSharingDialog: (route: ApiRouteData) => void
}

const RoutesTable: React.FC<RoutesTableProps> = ({
    routes,
    showTestRouteModal,
    showEditRouteModal,
    deleteRoute,
    showSharingDialog,
}) => {
    return (
        <DataTable>
            <DataTableHead>
                <DataTableRow>
                    <DataTableColumnHeader>
                        {i18n.t('ID')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader>
                        {i18n.t('Code')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader>
                        {i18n.t('Name')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader>
                        {i18n.t('URL')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader>
                        {i18n.t('Authentication')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader>
                        {i18n.t('Authorities')}
                    </DataTableColumnHeader>
                    <DataTableColumnHeader></DataTableColumnHeader>
                </DataTableRow>
            </DataTableHead>
            {routes?.length === 0 && (
                <DataTableRow>
                    <DataTableCell colSpan="100%">
                        {i18n.t('No routes configured yet.')}
                    </DataTableCell>
                </DataTableRow>
            )}
            <DataTableBody>
                {routes?.map((route) => {
                    return (
                        <DataTableRow key={route.id}>
                            <DataTableCell>{route.id}</DataTableCell>
                            <DataTableCell>{route.code}</DataTableCell>
                            <DataTableCell>{route.name}</DataTableCell>
                            <DataTableCell>{route.url}</DataTableCell>
                            <DataTableCell>
                                {route.auth ? (
                                    <pre>{JSON.stringify(route.auth)}</pre>
                                ) : (
                                    'n/a'
                                )}
                            </DataTableCell>
                            <DataTableCell>
                                {route.authorities?.length ? (
                                    <pre>
                                        {JSON.stringify(route.authorities)}
                                    </pre>
                                ) : (
                                    'n/a'
                                )}
                            </DataTableCell>
                            <DataTableCell align="right">
                                <Button
                                    small
                                    onClick={() => showSharingDialog(route)}
                                >
                                    {i18n.t('Sharing')}
                                </Button>{' '}
                                <Button
                                    small
                                    onClick={() => showTestRouteModal(route)}
                                >
                                    {i18n.t('Test')}
                                </Button>{' '}
                                <Button
                                    small
                                    onClick={() => showEditRouteModal(route)}
                                >
                                    {i18n.t('Edit Route')}
                                </Button>{' '}
                                <Button
                                    destructive
                                    small
                                    onClick={() => deleteRoute(route.id)}
                                >
                                    {i18n.t('Delete')}
                                </Button>
                            </DataTableCell>
                        </DataTableRow>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}

export default RoutesTable
