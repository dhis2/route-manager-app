import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Popover,
    FlyoutMenu,
    MenuItem,
    IconMore24,
    IconEdit16,
    IconDelete16,
    IconShare16,
} from '@dhis2/ui'
import React, { useState } from 'react'

type RouteActionsProps = {
    showSharingDialog: VoidFunction
    showEditRouteModal: VoidFunction
    deleteRoute: VoidFunction
}

const RouteActions: React.FC<RouteActionsProps> = ({
    showSharingDialog,
    showEditRouteModal,
    deleteRoute,
}) => {
    const [open, setOpen] = useState(false)
    const ref = React.useRef(null)

    return (
        <div ref={ref}>
            <Button
                small
                secondary
                onClick={() => setOpen(!open)}
                icon={<IconMore24 />}
            />
            {open && (
                <Popover
                    arrow={false}
                    placement="bottom-end"
                    reference={ref}
                    onClickOutside={() => setOpen(false)}
                >
                    <FlyoutMenu>
                        <MenuItem
                            dense
                            label={i18n.t('Edit')}
                            icon={<IconEdit16 />}
                            onClick={() => {
                                showEditRouteModal()
                                setOpen(false)
                            }}
                        />
                        <MenuItem
                            dense
                            label={i18n.t('Sharing')}
                            icon={<IconShare16 />}
                            onClick={() => {
                                showSharingDialog()
                                setOpen(false)
                            }}
                        />
                        <MenuItem
                            dense
                            label={i18n.t('Delete')}
                            icon={<IconDelete16 color="red" />}
                            onClick={() => {
                                deleteRoute()
                                setOpen(false)
                            }}
                        />
                    </FlyoutMenu>
                </Popover>
            )}
        </div>
    )
}

export default RouteActions
