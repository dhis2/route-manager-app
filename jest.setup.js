import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder
}

configure({ testIdAttribute: 'data-test' })
