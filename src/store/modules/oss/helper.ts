import { ss } from '@/utils/storage'

const LOCAL_NAME = 'ossClientInfoStorage'

export interface OssClientInfo {
  securityToken: string
  accessKeySecret: string
  accessKeyId: string
  expiration: number
  bucket: string
  region: string
  stsToken: string
}

export interface OssClientState {
  ossClientInfo: OssClientInfo
}

export function defaultSetting(): OssClientState {
  return {
    ossClientInfo: {
      securityToken: '',
      accessKeySecret: '',
      accessKeyId: '',
      expiration: 100000,
      bucket: 'comboaiavatarbucket',
      region: 'cn-beijing',
      stsToken: '',
    },
  }
}

export function getLocalState(): OssClientState {
  const localSetting: OssClientState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: OssClientState): void {
  ss.set(LOCAL_NAME, setting)
}
