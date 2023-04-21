import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  userId: string
  avatar: string
  name: string
  description: string
  countsQuota: number
  countsUsed: number
  account: string
  phoneVerified: string
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      userId: '',
      // https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg
      avatar: 'https://chenyl.fun/wp-content/uploads/2023/04/avatarF.png',
      name: '游客',
      description: '欢迎使用chatGPT',
      countsQuota: 20,
      countsUsed: 0,
      account: 'default-account',
      phoneVerified: 'N',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
