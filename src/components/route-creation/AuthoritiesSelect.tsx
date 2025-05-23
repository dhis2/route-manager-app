import i18n from '@dhis2/d2-i18n'
import { Box, Field, MultiSelect, MultiSelectOption } from '@dhis2/ui'
import * as React from 'react'
import { Authority } from '../../types/RouteInfo'

type AuthoritiesSelectProps = {
    selectedAuthorities: string[]
    authorities: Authority[]
    onSelect: React.Dispatch<React.SetStateAction<string[]>>
}

const AuthoritiesSelect: React.FC<AuthoritiesSelectProps> = ({
    selectedAuthorities,
    authorities: allAuthorities,
    onSelect,
}) => {
    const onChange = ({ selected }) => {
        onSelect(selected)
    }

    return (
        <Box width="400px">
            <Field
                label={i18n.t('Authorities')}
                helpText={i18n.t('Restrict access to certain authorities')}
                className="form-field"
                dataTest="select-authorities"
            >
                <MultiSelect
                    filterPlaceholder={i18n.t('Select authorities')}
                    clearable
                    clearText={i18n.t('Clear')}
                    filterable
                    onChange={onChange}
                    selected={selectedAuthorities}
                    noMatchText={i18n.t('No authority found')}
                >
                    {allAuthorities?.map((authority) => {
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
        </Box>
    )
}

export default AuthoritiesSelect
