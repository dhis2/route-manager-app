export type AuthScheme = 'http-basic' | 'api-token'

export type RouteAuthConfig =
    | {
          type: 'http-basic'
          username: string
          password: string
      }
    | { type: 'api-token'; token: string }

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
