import {
    Box,
    Button,
    Field,
    IconDelete16,
    InputField,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import i18n from '../../locales'
import { CustomHeaders } from '../../types/RouteInfo'
import styles from './CustomHeadersAdmin.module.css'

type CustomHeaderAdminProps = {
    headers: CustomHeaders
    setHeaders: (CustomHeaders) => void
}
const CustomHeadersAdmin = (props: CustomHeaderAdminProps) => {
    const { headers = {}, setHeaders } = props
    const [headerNameToAdd, setHeaderNameToAdd] = useState<string>()
    const [headerValueToAdd, setHeaderValueToAdd] = useState<string>()
    const inputRef = useRef(null)

    const addHeader = () => {
        setHeaderNameToAdd('')
        setHeaderValueToAdd('')
        setHeaders({ ...headers, [headerNameToAdd]: headerValueToAdd })
    }

    const removeHeader = (headerName) => {
        const newHeaders = { ...headers }
        delete newHeaders[headerName]
        setHeaders(newHeaders)
    }
    return (
        <Box width="400px">
            <Field
                label={i18n.t('Headers')}
                helpText={i18n.t('Static headers to add to the route')}
                className="form-field"
            >
                <Table
                    dataTest="table-custom-headers"
                    className={styles.headersTable}
                >
                    {Object.keys(headers)?.length > 0 && (
                        <TableHead>
                            <TableRow>
                                <TableCellHead>
                                    {i18n.t('Header name')}
                                </TableCellHead>
                                <TableCellHead>
                                    {i18n.t('Header value')}
                                </TableCellHead>
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {Object.keys(headers).map((headerName) => {
                            return (
                                <TableRow key={headerName}>
                                    <TableCell>{headerName}</TableCell>
                                    <TableCell>{headers[headerName]}</TableCell>
                                    <TableCell>
                                        <Button
                                            title={i18n.t('Remove Header')}
                                            aria-label={i18n.t('Remove Header')}
                                            icon={<IconDelete16 />}
                                            onClick={() =>
                                                removeHeader(headerName)
                                            }
                                        ></Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                <div className={styles.addHeaderRow}>
                    <div>
                        <InputField
                            value={headerNameToAdd}
                            onChange={({ value }) => setHeaderNameToAdd(value)}
                            placeholder="Header name"
                            ref={inputRef}
                        />
                    </div>
                    <div>
                        <InputField
                            value={headerValueToAdd}
                            onChange={({ value }) => setHeaderValueToAdd(value)}
                            placeholder="Header value"
                        />
                    </div>
                    <div>
                        <Button
                            type="button"
                            large
                            disabled={!headerNameToAdd || !headerValueToAdd}
                            onClick={addHeader}
                        >
                            {i18n.t('Add')}
                        </Button>
                    </div>
                </div>
            </Field>
        </Box>
    )
}

export default CustomHeadersAdmin
