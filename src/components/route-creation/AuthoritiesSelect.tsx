import i18n from '@dhis2/d2-i18n'
import { Field, MultiSelect, MultiSelectOption } from '@dhis2/ui'
import * as React from 'react'
import { ApiRouteData, Authority } from '../../types/RouteInfo'

type AuthoritiesSelectProps = {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    route: ApiRouteData | {}
    authorities: Authority[]
    onSelect: React.Dispatch<React.SetStateAction<string[]>>
}

const AuthoritiesSelect: React.FC<AuthoritiesSelectProps> = ({
    route,
    authorities,
    onSelect,
}) => {
    const [selectedAuthorities, setSelectedAuthorities] = React.useState<
        string[]
    >(() => route.authorities ?? [])

    const onChange = ({ selected }) => {
        setSelectedAuthorities(selected)
    }
    const onBlur = () => {
        onSelect(selectedAuthorities)
    }
    return (
        <Field
            label={i18n.t('Authorities')}
            helpText={i18n.t('Restrict access to cerain authorities')}
        >
            <MultiSelect
                filterPlaceholder={i18n.t('Select authorities')}
                clearable
                clearText={i18n.t('Clear')}
                filterable
                onChange={onChange}
                selected={selectedAuthorities}
                noMatchText={i18n.t('No authority found')}
                onBlur={onBlur}
            >
                {authorities?.map((authority) => {
                    return (
                        <MultiSelectOption
                            key={authority.id}
                            label={`${authority.id} (${authority.name})`}
                            value={authority.id}
                        ></MultiSelectOption>
                    )
                })}
            </MultiSelect>
        </Field>
    )
}

export default AuthoritiesSelect
