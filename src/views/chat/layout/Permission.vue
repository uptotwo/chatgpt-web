<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { login, signin } from '@/api'
import { useAuthStore } from '@/store'
import Icon403 from '@/icons/403.vue'

interface Props {
  visible: boolean
  signInVisible: boolean
}
interface Emit {
  (e: 'update:signInVisible', signInVisible: boolean): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
interface SignInResponse {
  token: string
  expireAt: number
  loginUser: LoginUser
}
interface LoginUser {
  account: string
  avatarUrl: string
}
const showLogin = computed(() => props.visible)
const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)
const signInloading = ref(false)
const token = ref('')
const phone = ref('')
const password = ref('')
const signInPhone = ref('')
const signInPassword = ref('')
const disabled = computed(() => (!phone.value.trim() || loading.value) || (!password.value.trim() || loading.value))
const signInDisabled = computed(() => (!signInPhone.value.trim() || signInloading.value) || (!signInPassword.value.trim() || signInloading.value))

async function handleVerify() {
  // const secretKey = token.value.trim()
  // if (!secretKey)
  //   return
  try {
    loading.value = true
    const { data } = await login<SignInResponse>(phone.value.trim(), password.value.trim())
    ms.success('success')
    authStore.setToken(data.token)
    localStorage.setItem('notifyDialogShow', JSON.stringify(true))
    window.location.reload()
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
    // phone.value = ''
    password.value = ''
  }
  finally {
    loading.value = false
  }
}
function jumpSignIn() {
  emit('update:signInVisible', true)
}
function jumpLogin() {
  emit('update:signInVisible', false)
}
async function handleSignIn() {
  try {
    signInloading.value = true
    const { data } = await signin<SignInResponse>(signInPhone.value.trim(), signInPassword.value.trim())
    ms.success('success')
    authStore.setToken(data.token)
    localStorage.setItem('notifyDialogShow', JSON.stringify(true))
    window.location.reload()
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
    // phone.value = ''
  }
  finally {
    signInloading.value = false
  }
}

function handlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleVerify()
  }
}
function singInHandlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSignIn()
  }
}
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl text-center text-slate-800 dark:text-neutral-200">
            {{ $t('common.unauthorizedTips') }}
          </h2>
          <!-- <p class="text-base text-center text-slate-500 dark:text-slate-500">
            {{ $t('common.unauthorizedTips') }}
          </p> -->
          <Icon403 class="w-[200px] m-auto" />
        </header>
        <NInput v-model:value="phone" type="text" placeholder="请输入手机号" @keypress="handlePress" />
        <NInput v-model:value="password" type="password" placeholder="请输入密码" @keypress="handlePress" />
        <!-- <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" /> -->
        <NButton
          block
          type="primary"
          :disabled="disabled"
          :loading="loading"
          @click="handleVerify"
        >
          登录
        </NButton>
        <NButton
          block
          type="tertiary"
          :loading="signInloading"
          @click="jumpSignIn"
        >
          尚未注册?去注册
        </NButton>
      </div>
    </div>
  </NModal>
  <NModal :show="signInVisible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl text-center text-slate-800 dark:text-neutral-200">
            注册成功后自动登录授权
          </h2>
          <!-- <p class="text-base text-center text-slate-500 dark:text-slate-500">
            {{ $t('common.unauthorizedTips') }}
          </p> -->
          <Icon403 class="w-[200px] m-auto" />
        </header>
        <NInput v-model:value="signInPhone" type="text" placeholder="请输入手机号[唯一凭证]" @keypress="singInHandlePress" />
        <NInput v-model:value="signInPassword" type="password" placeholder="请输入密码[4-12位]" @keypress="singInHandlePress" />
        <!-- <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" /> -->
        <NButton
          block
          type="primary"
          :disabled="signInDisabled"
          :loading="signInloading"
          @click="handleSignIn"
        >
          注册并登录
        </NButton>
        <NButton
          block
          type="tertiary"
          @click="jumpLogin"
        >
          已注册?去登录
        </NButton>
      </div>
    </div>
  </NModal>
</template>
