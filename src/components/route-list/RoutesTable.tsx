import i18n from '@dhis2/d2-i18n'
import {
    Button,
    DataTable,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableHead,
    DataTableColumnHeader,
    IconLaunch16,
    Switch,
} from '@dhis2/ui'
import React from 'react'
import { ApiRouteData } from '../../types/RouteInfo'
import RouteActions from './RouteActions'

type RoutesTableProps = {
    routes: ApiRouteData[]
    showTestRouteModal: (route: ApiRouteData) => void
    showEditRouteModal: (route: ApiRouteData) => void
    deleteRoute: (routeCode: string) => Promise<void>
    showSharingDialog: (route: ApiRouteData) => void
    onToggle: (route: ApiRouteData, disabled: boolean) => Promise<void>
}

const RoutesTable: React.FC<RoutesTableProps> = ({
    routes,
    showTestRouteModal,
    showEditRouteModal,
    deleteRoute,
    showSharingDialog,
    onToggle,
}) => {
    const toggleRoute = async (route, disabled) => {
        await onToggle(route, disabled)
    }
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
                                <ul
                                    style={{
                                        padding: 0,
                                        listStyle: 'none',
                                    }}
                                >
                                    {route.authorities?.map((auth) => {
                                        return <li key={auth}>{auth}</li>
                                    })}
                                </ul>
                            </DataTableCell>
                            <DataTableCell
                                align="right"
                                style={{ display: 'flex', gap: 10 }}
                            >
                                <Switch
                                    onChange={({ checked: enabled }) =>
                                        toggleRoute(route, !enabled)
                                    }
                                    checked={!route.disabled}
                                    label={i18n.t('Enable route')}
                                />
                                <Button
                                    icon={<IconLaunch16 />}
                                    disabled={route.disabled}
                                    small
                                    onClick={() => showTestRouteModal(route)}
                                >
                                    {i18n.t('Test route')}
                                </Button>{' '}
                                <RouteActions
                                    showSharingDialog={() =>
                                        showSharingDialog(route)
                                    }
                                    showEditRouteModal={() =>
                                        showEditRouteModal(route)
                                    }
                                    deleteRoute={() => deleteRoute(route.id)}
                                />
                            </DataTableCell>
                        </DataTableRow>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}

export default RoutesTable
