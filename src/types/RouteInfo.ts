export type AuthScheme = 'http-basic'

export type RouteAuthConfig = {
    type: AuthScheme
    username: string
    password: string
}

export type ApiRouteData = {
    id: string
    url: string
    name: string
    code: string
    auth?: RouteAuthConfig
    authorities?: string[]
}

export type ApiRouteCreationPayload = Omit<ApiRouteData, 'id'> & {
    id?: string
}

export type WrapQueryResponse<T, S extends string = 'result'> = {
    [K in S]: {
        [K in S]: T
    }
}
