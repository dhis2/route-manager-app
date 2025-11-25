export type AuthScheme = 'http-basic' | 'api-token' | 'oauth2-client-credentials'

export type RouteAuthConfig =
    | {
          type: 'http-basic'
          username: string
          password: string
      }
    | { type: 'api-token'; token: string }
    | {
          type: 'oauth2-client-credentials'
          clientId: string
          clientSecret: string
          tokenUri: string
      }

export type CustomHeaders = {
    [key in string]: string
}

export type ApiRouteData = {
    id: string
    url: string
    name: string
    code: string
    disabled: boolean
    auth?: RouteAuthConfig
    authorities?: string[]
    headers?: CustomHeaders
}

export type ApiRouteCreationPayload = Omit<ApiRouteData, 'id'> & {
    id?: string
}

export type Authority = {
    id: string
    name: string
}

export type WrapQueryResponse<
    T,
    S extends string = 'result',
    R extends string = S
> = {
    [K in S]: {
        [K in R]: T
    }
}

export type WrapQueryResponseSingle<T, S extends string> = {
    [K in S]: T
}
