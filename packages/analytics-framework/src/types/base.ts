// TODO: Нужен ли здесь дженерик?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type EndpointOptions<_E> = {
  name: string
  fraction?: number
  force?: boolean
}

export type BaseEvent<Type extends string, Data> = {
  type: Type
  name: string
  data: Data
  endpointsOptions?: EndpointOptions<BaseEvent<Type, Data>>[]
}
