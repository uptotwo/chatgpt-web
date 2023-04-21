import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
import { useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()

  return post<T>({
    url: '/chat-process',
    data: { prompt: params.prompt, options: params.options, systemMessage: settingStore.systemMessage },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

export function signin<T>(phone: string, password: string) {
  return post<T>({
    url: '/signIn',
    data: { phone, password },
  })
}

export function login<T>(phone: string, password: string) {
  return post<T>({
    url: '/login',
    data: { phone, password },
  })
}

export function getVerifyCode<T>(phone: string) {
  return post<T>({
    url: '/getVerifyCode',
    data: { phone },
  })
}

export function verifyPhoneCode<T>(phone: string, code: string) {
  return post<T>({
    url: '/verifyPhoneCode',
    data: { phone, code },
  })
}

export function resetPsd<T>(phone: string, password: string) {
  return post<T>({
    url: '/resetPsd',
    data: { phone, password },
  })
}

export function editUser<T = string>(json: any) {
  return post<T>({
    url: '/editUser',
    data: json,
  })
}
export function logout<T>() {
  return get<T>({
    url: '/logout',
  })
}
export function getSts<T>() {
  return get<T>({
    url: '/getSts',
  })
}

export function saveOrUpdateAvatar<T = string>(json: any) {
  return post<T>({
    url: '/saveOrUpdateAvatar',
    data: json,
  })
}

export function freeTrial<T>() {
  return get<T>({
    url: '/freeTrial',
  })
}
