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
import { useNavigate } from 'react-router'

type RouteActionsProps = {
    routeId: string
    showSharingDialog: VoidFunction
    deleteRoute: VoidFunction
}

const RouteActions: React.FC<RouteActionsProps> = ({
    routeId,
    showSharingDialog,
    deleteRoute,
}) => {
    const [open, setOpen] = useState(false)
    const ref = React.useRef(null)

    const navigate = useNavigate()

    return (
        <div ref={ref}>
            <Button
                dataTest="button-more-actions"
                title={i18n.t('more actions')}
                aria-label={i18n.t('more actions')}
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
                    dataTest="popover-more-actions"
                >
                    <FlyoutMenu>
                        <MenuItem
                            dense
                            label={i18n.t('Edit')}
                            icon={<IconEdit16 />}
                            onClick={() => {
                                navigate(`/create-route/${routeId}`)
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
