import { CssReset, CssVariables } from '@dhis2/ui'
import clx from 'classnames'
import React from 'react'
import './locales'
import { HashRouter, Outlet, Route, Routes, useLocation } from 'react-router'
import styles from './App.module.css'
import { UpsertRoute } from './components/route-creation'
import { RoutesList } from './components/route-list'

const Root = () => {
    const location = useLocation()
    const isForm = location?.pathname?.match('create-route')

    return (
        <>
            <CssReset />
            <CssVariables theme spacers colors elevations />

            <div
                className={clx(styles.container, {
                    [styles.containerForm]: isForm,
                })}
            >
                <Outlet />
            </div>
        </>
    )
}

const MyApp = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Root />}>
                    <Route index element={<RoutesList />} />
                    <Route
                        path="/create-route/:routeId?"
                        element={<UpsertRoute />}
                    />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default MyApp
