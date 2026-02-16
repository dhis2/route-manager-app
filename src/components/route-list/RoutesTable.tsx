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
    NoticeBox,
    IconEdit16,
} from '@dhis2/ui'
import React from 'react'
import { useNavigate } from 'react-router'
import { ApiRouteData } from '../../types/RouteInfo'
import RouteActions from './RouteActions'
import styles from './RoutesTable.module.css'

type RoutesTableProps = {
    routes: ApiRouteData[]
    showPermissionError: boolean
    showTestRouteModal: (route: ApiRouteData) => void
    deleteRoute: (routeCode: string) => Promise<void>
    showSharingDialog: (route: ApiRouteData) => void
    onToggle: (route: ApiRouteData, disabled: boolean) => Promise<void>
}

const RoutesTable: React.FC<RoutesTableProps> = ({
    routes,
    showPermissionError,
    showTestRouteModal,
    deleteRoute,
    showSharingDialog,
    onToggle,
}) => {
    const toggleRoute = async (route, disabled) => {
        await onToggle(route, disabled)
    }

    const navigate = useNavigate()
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

            {showPermissionError && (
                <DataTableRow>
                    <DataTableCell colSpan="100%">
                        <NoticeBox warning>
                            The current user does not have the necessary
                            permissions to configure routes. Please ensure that
                            the &ldquo;Route&ldquo; authority is assigned to the
                            user&apos;s role to enable route management.
                        </NoticeBox>
                    </DataTableCell>
                </DataTableRow>
            )}
            {!showPermissionError && routes?.length === 0 && (
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
                            {route.auth ? (
                                <DataTableCell>
                                    <div className={styles.authDetails}>
                                        <span className={styles.authType}>
                                            {route.auth.type}
                                        </span>
                                        {Object.entries(route.auth)
                                            .filter(([key]) => key !== 'type')
                                            .map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    className={styles.authField}
                                                >
                                                    {key}:{String(value)}
                                                </span>
                                            ))}
                                    </div>
                                </DataTableCell>
                            ) : (
                                <DataTableCell muted>
                                    {i18n.t('No authentication')}
                                </DataTableCell>
                            )}
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
                            <DataTableCell align="right">
                                <div className={styles.routeActionsCell}>
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
                                        onClick={() =>
                                            showTestRouteModal(route)
                                        }
                                    >
                                        {i18n.t('Test route')}
                                    </Button>{' '}
                                    <Button
                                        icon={<IconEdit16 />}
                                        title={i18n.t('Edit route')}
                                        aria-label={i18n.t('Edit route')}
                                        disabled={route.disabled}
                                        small
                                        onClick={() => {
                                            navigate(
                                                `/create-route/${route.id}`
                                            )
                                        }}
                                    ></Button>{' '}
                                    <RouteActions
                                        routeId={route.id}
                                        showSharingDialog={() =>
                                            showSharingDialog(route)
                                        }
                                        deleteRoute={() =>
                                            deleteRoute(route.id)
                                        }
                                    />
                                </div>
                            </DataTableCell>
                        </DataTableRow>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}

export default RoutesTable
