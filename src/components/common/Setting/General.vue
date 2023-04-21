<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NAvatar, NButton, NInput, NPopconfirm, NSelect, NUpload, useMessage } from 'naive-ui'
import OSS from 'ali-oss'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore, useAuthStore, useOssInfoStore, useUserStore } from '@/store'
import type { OssClientInfo } from '@/store/modules/oss/helper'
import type { UserInfo } from '@/store/modules/user/helper'
import { getCurrentDate } from '@/utils/functions'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { editUser, getSts, logout, saveOrUpdateAvatar } from '@/api'
interface Props {
  visible: boolean
}
interface UploadedAvatar {
  fileId: string
  url: string
  size: number
  name: string
  type: string
  code: string
  oname: string
}
interface Emit {
  (e: 'update:visible', visible: boolean): void
}
const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()
const appStore = useAppStore()
const userStore = useUserStore()
const ossInfoStore = useOssInfoStore()

const { isMobile } = useBasicLayout()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)

const uploadedAvatar: UploadedAvatar = { fileId: '', url: '', size: 0, name: '', type: '', code: '', oname: '' }

const uploadedAvatarUrl = ref('')

const showingAvatar = computed(() => uploadedAvatarUrl.value || userInfo.value.avatar)

const ossInfo = computed(() => ossInfoStore.ossClientInfo)

const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

const countsFree = ref(userInfo.value.countsQuota ?? 0)

const countsPaid = ref(userInfo.value.countsUsed ?? 0)

const language = computed({
  get() {
    return appStore.language
  },
  set(value: Language) {
    appStore.setLanguage(value)
  },
})

const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
  { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
  { label: 'English', key: 'en-US', value: 'en-US' },
]

async function updateUserInfo(options: Partial<UserInfo>) {
  try {
    const { data } = await editUser<string>(options)
    ms.success(data ?? '保存成功')
  }
  catch (error: any) {
    ms.error(error)
  }
  userStore.updateUserInfo(options)
}
async function updateUserName(options: Partial<UserInfo>) {
  try {
    const { data } = await editUser<string>({ nickName: options.name })
    ms.success(data ?? '保存成功')
  }
  catch (error: any) {
    ms.error(error)
  }
  userStore.updateUserInfo(options)
}
// function handleReset() {
//   userStore.resetUserInfo()
//   ms.success(t('common.success'))
//   window.location.reload()
// }
function handleLogout() {
  try {
    logout()
  }
  finally {
    userStore.resetUserInfo()
    emit('update:visible', false)
    authStore.removeToken()
  }
  ms.success('退出成功', { duration: 2 * 1000 })
}

function exportData(): void {
  const date = getCurrentDate()
  const data: string = localStorage.getItem('chatStorage') || '{}'
  const jsonString: string = JSON.stringify(JSON.parse(data), null, 2)
  const blob: Blob = new Blob([jsonString], { type: 'application/json' })
  const url: string = URL.createObjectURL(blob)
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  link.download = `chat-store_${date}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function importData(event: Event): void {
  const target = event.target as HTMLInputElement
  if (!target || !target.files)
    return

  const file: File = target.files[0]
  if (!file)
    return

  const reader: FileReader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      localStorage.setItem('chatStorage', JSON.stringify(data))
      ms.success(t('common.success'))
      location.reload()
    }
    catch (error) {
      ms.error(t('common.invalidFileFormat'))
    }
  }
  reader.readAsText(file)
}

function clearData(): void {
  localStorage.removeItem('chatStorage')
  location.reload()
}

function handleImportButtonClick(): void {
  const fileInput = document.getElementById('fileInput') as HTMLElement
  if (fileInput)
    fileInput.click()
}
interface UploadCustomRequestOptions {
  file: any
  action?: string
  data?:
  | Record<string, string>
  | (({ file }: { file: any }) => Record<string, string>)
  withCredentials?: boolean
  headers?:
  | Record<string, string>
  | (({ file }: { file: any }) => Record<string, string>)
  onProgress: (e: { percent: number }) => void
  onFinish: () => void
  onError: () => void
}
async function rereshOssInfo() {
  if (!ossInfoStore.$state.ossClientInfo.accessKeyId || ossInfoStore.$state.ossClientInfo.expiration < new Date().getTime()) {
    const { data } = await getSts<OssClientInfo>()
    const refreshSTSToken = { ...data, stsToken: data.securityToken }
    const fullData = { ...data, bucket: 'comboaiavatarbucket', region: 'oss-cn-beijing', stsToken: data.securityToken, refreshSTSToken }
    ossInfoStore.updateOssClientInfo(fullData)
    return fullData
  }
  return ossInfo.value
  // }
}

// : Promise<void>
async function uploadAvatar(option: UploadCustomRequestOptions) {
  const fullData = await rereshOssInfo()
  const client = new OSS(fullData)
  if (option.file.type !== 'image/png' && option.file.type !== 'image/jpeg') {
    ms.warning('必须为png或者jpeg文件')
    return
  }
  const fileSuffix = option.file.type === 'image/png' ? 'png' : 'jpg'
  if (option.file.file.size > 1024 * 1024 * 2) {
    ms.warning('图片不能大于2Mb')
    return
  }
  const userAbout: string = (userInfo.value.name ?? 'default-name') + (new Date().toLocaleTimeString().replace(/ /g, '').replace(/\//g, '-').replace(/:/g, '-'))
  const fileUploadName = `exampledir/avatar-${userAbout}.${fileSuffix}`
  client.put(fileUploadName, option.file.file)
    .then(
      (res: any) => {
        uploadedAvatarUrl.value = res.url
        uploadedAvatar.url = res.url
        uploadedAvatar.size = option.file.file.size / 1024
        uploadedAvatar.name = fileUploadName
        uploadedAvatar.type = fileSuffix
        uploadedAvatar.code = `avatar-${userInfo.value.account}`
        uploadedAvatar.oname = option.file.name
      },
    )
    .catch(
      (e: any) => ms.error(e),
    )
}
async function saveAvtarAndUpdateUser() {
  if (!uploadedAvatar.url)
    return

  // 这里返回的是fileid
  const { data } = await saveOrUpdateAvatar<string>(uploadedAvatar)
  await editUser<string>({ avatar: data })
  userStore.updateUserInfo({ avatar: uploadedAvatarUrl.value })
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
        <div class="flex-2">
          <!-- :fallback-src="defaultAvatar"  -->
          <!-- <NInput v-model:value="uploadedAvatarUrl" placeholder="" />
          <NInput v-model:value="userInfo.avatar" placeholder="" /> -->
          <NAvatar size="large" round :src="showingAvatar" />
        </div>
        <div class="flex-2">
          <NUpload
            accept="image/png, image/jpeg"
            :max="1"
            action="https://oss-cn-beijing.aliyuncs.com"
            :custom-request="uploadAvatar"
            :headers="{
              'naive-info': 'hello!',
            }"
            :data="{
              'naive-data': 'cool! naive!',
            }"
          >
            <NButton>上传头像</NButton>
          </NUpload>
        </div>
        <NButton size="tiny" text type="primary" @click="saveAvtarAndUpdateUser">
          {{ $t('common.save') }}
        </NButton>
      </div>

      <div />
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserName({ name })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <!-- 描述 -->
      <!-- <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.description') }}</span>
        <div class="flex-1">
          <NInput v-model:value="description" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ description })">
          {{ $t('common.save') }}
        </NButton>
      </div> -->
      <div class="flex items-center space-x-4">
        <!-- {{ $t('user.countsFree') }} -->
        <span class="flex-shrink-0 w-[100px]">已对话次数</span>
        <div class="flex-1">
          <NInput v-model:value="userInfo.countsUsed" placeholder="" disabled />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <!-- {{ $t('user.countsPaid') }} -->
        <span class="flex-shrink-0 w-[100px]">可用对话次数</span>
        <div class="flex-1">
          <NInput v-model:value="userInfo.countsQuota" placeholder="" disabled />
        </div>
      </div>
      <div
        class="flex items-center space-x-4"
        :class="isMobile && 'items-start'"
      >
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.chatHistory') }}</span>

        <div class="flex flex-wrap items-center gap-4">
          <NButton size="small" @click="exportData">
            <template #icon>
              <SvgIcon icon="ri:download-2-fill" />
            </template>
            {{ $t('common.export') }}
          </NButton>

          <input id="fileInput" type="file" style="display:none" @change="importData">
          <NButton size="small" @click="handleImportButtonClick">
            <template #icon>
              <SvgIcon icon="ri:upload-2-fill" />
            </template>
            {{ $t('common.import') }}
          </NButton>

          <NPopconfirm placement="bottom" @positive-click="clearData">
            <template #trigger>
              <NButton size="small">
                <template #icon>
                  <SvgIcon icon="ri:close-circle-line" />
                </template>
                {{ $t('common.clear') }}
              </NButton>
            </template>
            {{ $t('chat.clearHistoryConfirm') }}
          </NPopconfirm>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <template v-for="item of themeOptions" :key="item.key">
            <NButton
              size="small"
              :type="item.key === theme ? 'primary' : undefined"
              @click="appStore.setTheme(item.key)"
            >
              <template #icon>
                <SvgIcon :icon="item.icon" />
              </template>
            </NButton>
          </template>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="language"
            :options="languageOptions"
            @update-value="value => appStore.setLanguage(value)"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.resetUserInfo') }}</span>
        <NPopconfirm :on-positive-click="handleLogout" placement="right-end">
          <template #trigger>
            <NButton size="small" type="warning">
              退出登录
            </NButton>
          </template>
          您确定要退出登录吗?
        </NPopconfirm>
      </div>
    </div>
  </div>
</template>
