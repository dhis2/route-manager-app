import { CustomDataProvider } from '@dhis2/app-runtime'
import { render } from '@testing-library/react'
import React from 'react'
import App from './App'

it('renders without crashing', () => {
    render(
        <CustomDataProvider data={{ routes: [], me: {}, authorities: [] }}>
            <App />
        </CustomDataProvider>
    )
})
