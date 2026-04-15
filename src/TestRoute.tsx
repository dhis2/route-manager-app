import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    Button,
    InputField,
    SingleSelectField,
    TextAreaField,
    SingleSelectOption,
    Tab,
    TabBar,
    Legend,
} from '@dhis2/ui'
import React, { useState } from 'react'
import classes from './App.module.css'
import { ApiRouteData } from './types/RouteInfo'

type TestRouteProps = {
    route: ApiRouteData
    closeModal: VoidFunction
}

type Verb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'JSON-PATCH'

type MutationType = 'create' | 'delete' | 'update' | 'replace' | 'json-patch'

type BodyType = 'json' | 'text'

const typesMap: Record<string, MutationType> = {
    POST: 'create',
    DELETE: 'delete',
    PUT: 'update',
    PATCH: 'update',
    'JSON-PATCH': 'json-patch',
}

type BodyTypeInfo = {
    label: string
    contentType: string
}

const requestBodyTypesMap: { [key in BodyType]: BodyTypeInfo } = {
    json: {
        label: 'JSON',
        contentType: 'application/json',
    },
    text: {
        label: 'Text',
        contentType: 'text/plain',
    },
}

const TestRoute: React.FC<TestRouteProps> = ({
    route = {} as Partial<ApiRouteData>,
    closeModal = () => {},
}) => {
    const [verb, setVerb] = useState<Verb>('GET')
    const [body, setBody] = useState<string>()
    const [wildcard, setWildcard] = useState<string>()
    const [queryParams, setQueryParams] = useState<string>()
    const [result, setResult] = useState<unknown>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [bodyType, setBodyType] = useState<BodyType>('json')

    const engine = useDataEngine()

    const { show, hide } = useAlert(
        ({ error }) => {
            if (error) {
                return i18n.t('Failed to invoke route: {{error}}', {
                    error,
                    nsSeparator: '-:-',
                })
            }
            return i18n.t('Route invoked successfully')
        },
        ({ error }) => {
            if (error) {
                return { critical: true }
            }
            return { success: true }
        }
    )

    const handleChangeTab = (tab: BodyType) => setBodyType(tab)
    const tabProps = (tab: BodyType) =>
        tab === bodyType ? { selected: true } : {}

    const handleTestRoute = async () => {
        try {
            hide()
            setResult(undefined)
            setLoading(true)

            const queryPrefix = queryParams?.startsWith('?') ? '' : '?'

            const resource = `routes/${route.id ?? route.code}/run${
                wildcard
                    ? `/${wildcard}`
                    : queryParams
                    ? `${queryPrefix}${queryParams}`
                    : ''
            }`

            if (verb === 'GET') {
                const result = await engine.query({
                    routes: { resource },
                })

                show({ success: true })

                return setResult(result)
            }

            // other verbs: POST, PUT, PATCH, JSON-PATCH, DELETE
            const mutationOptions = {
                resource,
                type: typesMap[verb],
                data: body && bodyType === 'json' ? JSON.parse(body) : body,
            }

            if (verb === 'DELETE') {
                // a wrokaround for DELETE since it crashes with data: undefined
                delete mutationOptions.data
            }

            if (verb === 'PATCH') {
                // @ts-expect-error("another workaround to be able to have a generic set of options for all verbs")
                mutationOptions.partial = true
            }

            // @ts-expect-error("the error is because different mutations expect ID or not, but in practice, they can be used generically with id=null")
            const result = await engine.mutate(mutationOptions)

            setResult(result)

            show({ success: true })
        } catch (error) {
            console.error(error)
            show({ error })
            setTimeout(hide, 10000)
        } finally {
            setLoading(false)
        }
    }

    const hasWildCardPath = route.url?.endsWith('**')

    return (
        <Modal dataTest="modal-test-route" onClose={closeModal}>
            <ModalActions>
                <ButtonStrip end>
                    <Button
                        data-test="button-test-route-perform-test"
                        loading={loading}
                        disabled={loading}
                        primary
                        onClick={handleTestRoute}
                    >
                        {i18n.t('Test Route')}
                    </Button>{' '}
                    <Button secondary onClick={closeModal}>
                        {i18n.t('Cancel')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
            <ModalTitle>{i18n.t('Test Route')}</ModalTitle>
            <ModalContent>
                <div className={classes.formContainer}>
                    <SingleSelectField
                        dataTest="select-test-route-verb"
                        filterable={false}
                        selected={verb}
                        onChange={({ selected }) => {
                            setVerb(selected as Verb)
                        }}
                    >
                        <SingleSelectOption
                            label="GET"
                            value="GET"
                        ></SingleSelectOption>
                        <SingleSelectOption
                            label="POST"
                            value="POST"
                        ></SingleSelectOption>
                        <SingleSelectOption
                            label="PUT"
                            value="PUT"
                        ></SingleSelectOption>
                        <SingleSelectOption
                            label="DELETE"
                            value="DELETE"
                        ></SingleSelectOption>
                        <SingleSelectOption
                            label="PATCH"
                            value="PATCH"
                        ></SingleSelectOption>
                        <SingleSelectOption
                            label="JSON-PATCH"
                            value="JSON-PATCH"
                        ></SingleSelectOption>
                    </SingleSelectField>
                    <InputField
                        dataTest="input-test-route-code"
                        disabled
                        value={route?.code}
                        label={i18n.t('Route code')}
                    />
                    <InputField
                        dataTest="input-test-route-name"
                        disabled
                        value={route?.name}
                        label={i18n.t('Route Name')}
                    />
                    <InputField
                        dataTest="input-test-route-url"
                        disabled
                        value={route?.url}
                        label={i18n.t('Route URL')}
                    />

                    {hasWildCardPath && (
                        <InputField
                            dataTest="input-wildcard-path"
                            value={wildcard}
                            onChange={({ value }) => setWildcard(value)}
                            label={i18n.t('Wildcard path')}
                        />
                    )}

                    {verb === 'GET' && !hasWildCardPath && (
                        <InputField
                            dataTest="input-query-params"
                            value={queryParams}
                            placeholder={'query1=value&query2=value2...'}
                            onChange={({ value }) => setQueryParams(value)}
                            label={i18n.t('Query Params')}
                        />
                    )}

                    <div className={classes.formContainer}>
                        <Legend>{i18n.t('Body of request')}</Legend>
                        <TabBar>
                            {Object.entries(requestBodyTypesMap).map(
                                ([type, values]) => (
                                    <Tab
                                        {...tabProps(type as BodyType)}
                                        key={values.label}
                                        disabled={verb === 'GET'}
                                        className={classes.tabStyle}
                                        onClick={() =>
                                            handleChangeTab(type as BodyType)
                                        }
                                    >
                                        {values.label}
                                    </Tab>
                                )
                            )}
                        </TabBar>

                        <div style={{ marginTop: '20px' }}>
                            <TextAreaField
                                rows={5}
                                value={body}
                                autoGrow={true}
                                disabled={verb === 'GET'}
                                onChange={({ value }) => setBody(value)}
                                placeholder={i18n.t('Body to pass to route')}
                                helpText={i18n.t(
                                    'Use valid {{type}} for this field',
                                    {
                                        type: requestBodyTypesMap[bodyType]
                                            .label,
                                    }
                                )}
                            />
                        </div>
                    </div>

                    <pre>
                        {(result && JSON.stringify(result, null, 2)) as string}
                    </pre>
                </div>
            </ModalContent>
        </Modal>
    )
}

export default TestRoute
