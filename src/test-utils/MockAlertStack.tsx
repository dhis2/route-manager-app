/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAlerts } from '@dhis2/app-runtime'
import React, { useEffect } from 'react'

const MockAlert = ({ alert }: any) => {
    useEffect(() => {
        if (alert.options?.duration) {
            setTimeout(() => alert.remove(), alert.options?.duration)
        }
    }, [alert])
    return (
        <div style={{ backgroundColor: '#CCC', padding: 8 }}>
            {alert.message}
            {alert?.options?.actions?.map((action, i) => (
                <button key={i} onClick={action.onClick}>
                    {action.label}
                </button>
            ))}
        </div>
    )
}

export const MockAlertStack = () => {
    const alerts = useAlerts()

    return (
        <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
            {alerts.map((alert) => (
                <MockAlert key={alert.id} alert={alert} />
            ))}
        </div>
    )
}
