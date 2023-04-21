<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { getVerifyCode, login, resetPsd, signin, verifyPhoneCode } from '@/api'
import { useAuthStore, useUserStore } from '@/store'
import Icon403 from '@/icons/403.vue'

interface Props {
  visible: boolean
  signInVisible: boolean
  resetPsdVisible: boolean
}
interface Emit {
  (e: 'update:signInVisible', signInVisible: boolean): void
  (e: 'update:resetPsdVisible', resetPsdVisible: boolean): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
interface SignInResponse {
  countsQuota: number
  countsUsed: number
  token: string
  expireAt: number
  loginUser: LoginUser
  phoneVerified: string
}
interface LoginUser {
  userId: string
  account: string
  avatarUrl: string
  simpleUserInfo: any
}
const showLogin = computed(() => props.visible)
const authStore = useAuthStore()
const userStore = useUserStore()

const ms = useMessage()

const loading = ref(false)
const signInloading = ref(false)
const getCodeButtonLoading = ref(false)
const resetPsdButtonLoading = ref(false)

const phone = ref('')
const password = ref('')
const signInPhone = ref('')
const signInPassword = ref('')
const theVerifyPhoneCode = ref('')
const theResetedPassword = ref('')
const disabled = computed(() => (!phone.value.trim() || loading.value) || (!password.value.trim() || loading.value))
const signInDisabled = computed(() => (!signInPhone.value.trim() || signInloading.value) || (!signInPassword.value.trim() || signInloading.value
|| !signInPassword.value.trim() || !theVerifyPhoneCode.value.trim() || theVerifyPhoneCode.value.length !== 6))
const verifyPhoneCodeButtonDisabled = computed(() => (!phone.value.trim() || phone.value.trim().length !== 11 || !theVerifyPhoneCode.value.trim() || theVerifyPhoneCode.value.trim().length !== 6))
const resetPsdButtonDisabled = computed(() => !theResetedPassword.value.trim() || theResetedPassword.value.trim().length < 4 || theResetedPassword.value.trim().length > 12 || resetPsdButtonLoading.value)
const ifshowGetCode = ref(true)
const ifshowResstingPsd = ref(false)
async function handleVerify() {
  // const secretKey = token.value.trim()
  // if (!secretKey)
  //   return
  try {
    loading.value = true
    const { data } = await login<SignInResponse>(phone.value.trim(), password.value.trim())
    storeUserInfos(data)
    ms.success('登录成功', { duration: 2000 })
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

function storeUserInfos(data: SignInResponse) {
  const userInfo: any = {
    userId: data.loginUser.userId,
    name: data.loginUser.simpleUserInfo.nickName,
    // description: string
    countsQuota: data.countsQuota,
    countsUsed: data.countsUsed,
    account: data.loginUser.account,
    phoneVerified: data.phoneVerified,
  }
  if (data.loginUser.avatarUrl)
    userInfo.avatar = data.loginUser.avatarUrl

  userStore.updateUserInfo(userInfo)
}

function jumpSignIn() {
  emit('update:signInVisible', true)
}
function jumpRestPsd() {
  emit('update:resetPsdVisible', true)
}
function jumpLogin() {
  emit('update:signInVisible', false)
  emit('update:resetPsdVisible', false)
  ifshowGetCode.value = true
  ifshowResstingPsd.value = false
}
async function handleSignIn() {
  try {
    signInloading.value = true
    const { data } = await signin<SignInResponse>(signInPhone.value.trim(), signInPassword.value.trim())
    storeUserInfos(data)
    ms.success('注册成功,已登录', { duration: 2000 })
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
function validateHandlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    toVerifyPhoneCode()
  }
}
// 发送验证码前端------------
const waitingSecond = ref(0)
const getCodeWord = computed(() => `获取验证码 ${waitingSecond.value === 0 ? '' : `(${waitingSecond.value})`}`)
const getCodeButtonDisabled = computed(() => !phone.value.trim() || phone.value.length !== 11 || getCodeButtonLoading.value || waitingSecond.value !== 0)
const signInGetCodeButtonDisabled = computed(() => !signInPhone.value.trim() || signInPhone.value.length !== 11 || getCodeButtonLoading.value
|| waitingSecond.value !== 0)
// 倒计时
async function handleGetCode() {
  getCodeButtonLoading.value = true
  try {
    const { data } = await getVerifyCode<string>(phone.value.trim())
    ms.success(data ?? '发送成功,请注意查收', { duration: 1000 })
  }
  catch (error: any) {
    ms.error(error.message ?? '发送失败,请稍后重试', { duration: 2000 })
    // phone.value = ''
  }
  // 后台去获取
  getCodeButtonLoading.value = false
  let seconds = 60
  const countdownTimer = setInterval(() => {
    waitingSecond.value = seconds
    if (seconds <= 0)
      clearInterval(countdownTimer)
    else
      seconds--
  }, 1000)
}
// 倒计时
async function handleSignInGetCode() {
  getCodeButtonLoading.value = true
  try {
    const { data } = await getVerifyCode<string>(signInPhone.value.trim())
    ms.success(data ?? '发送成功,请注意查收', { duration: 1000 })
  }
  catch (error: any) {
    ms.error(error.message ?? '发送失败,请稍后重试', { duration: 2000 })
    // phone.value = ''
  }
  // 后台去获取
  getCodeButtonLoading.value = false
  let seconds = 60
  const countdownTimer = setInterval(() => {
    waitingSecond.value = seconds
    if (seconds <= 0)
      clearInterval(countdownTimer)
    else
      seconds--
  }, 1000)
}
async function toVerifyPhoneCode() {
  try {
    const { data } = await verifyPhoneCode<string>(phone.value.trim(), theVerifyPhoneCode.value.trim())
    ms.success(data ?? '验证成功', { duration: 1000 })
    ifshowGetCode.value = false
    ifshowResstingPsd.value = true
  }
  catch (error: any) {
    ms.error(error.message ?? '验证码有误,请重新输入', { duration: 2000 })
    // phone.value = ''
  }
}
async function toResetPsd() {
  resetPsdButtonLoading.value = true
  try {
    const { data } = await resetPsd<string>(phone.value.trim(), theResetedPassword.value.trim())
    ms.success(data ?? '重置成功,请登录', { duration: 1000 })
    jumpLogin()
    ifshowGetCode.value = true
    ifshowResstingPsd.value = false
  }
  catch (error: any) {
    ms.error(error.message ?? '重置失败,请稍后重试', { duration: 2000 })
    // phone.value = ''
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
        <NInput v-model:value="password" type="password" placeholder="请输入密码" show-password-on="click" @keypress="handlePress" />
        <!-- <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" /> -->
        <NButton block type="primary" :disabled="disabled" :loading="loading" @click="handleVerify">
          登录
        </NButton>
        <NButton block type="tertiary" :loading="signInloading" @click="jumpSignIn">
          尚未注册?去注册
        </NButton>
        <NButton block type="tertiary" @click="jumpRestPsd">
          忘记密码?点击重置
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
        <NInput v-model:value="signInPassword" type="password" placeholder="请输入密码[4-12位]" show-password-on="click" @keypress="singInHandlePress" />
        <!-- <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" /> -->
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <NInput v-model:value="theVerifyPhoneCode" type="text" placeholder="请输入验证码" @keypress="validateHandlePress" />
          </div>
          <NButton type="primary" :disabled="signInGetCodeButtonDisabled" :loading="getCodeButtonLoading" @click="handleSignInGetCode">
            {{ getCodeWord }}
          </NButton>
        </div>
        <NButton block type="primary" :disabled="signInDisabled" :loading="signInloading" @click="handleSignIn">
          注册并登录
        </NButton>
        <NButton block type="tertiary" @click="jumpLogin">
          已注册?去登录
        </NButton>
      </div>
    </div>
  </NModal>
  <!-- 重置密码页 -->
  <NModal :show="resetPsdVisible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800 space-y-4">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl text-center text-slate-800 dark:text-neutral-200">
            重置密码
          </h2>
          <Icon403 class="w-[200px] m-auto" />
        </header>
        <div v-if="ifshowGetCode" class="space-y-4">
          <NInput v-model:value="phone" type="text" placeholder="请输入手机号" />
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <NInput v-model:value="theVerifyPhoneCode" type="text" placeholder="请输入验证码" @keypress="validateHandlePress" />
            </div>
            <NButton type="primary" :disabled="getCodeButtonDisabled" :loading="getCodeButtonLoading" @click="handleGetCode">
              {{ getCodeWord }}
            </NButton>
          </div>
          <NButton block type="primary" :disabled="verifyPhoneCodeButtonDisabled" @click="toVerifyPhoneCode">
            点击验证
          </NButton>
        </div>
        <div v-if="ifshowResstingPsd" class="space-y-4">
          <NInput v-model:value="theResetedPassword" type="password" placeholder="请输入新的密码[4-12位]" />
          <NButton block type="primary" :disabled="resetPsdButtonDisabled" :loading="resetPsdButtonLoading" show-password-on="click" @click="toResetPsd">
            确认重置
          </NButton>
        </div>
      </div>
      <div>
        <NButton block type="tertiary" @click="jumpLogin">
          返回登录页
        </NButton>
      </div>
    </div>
  </NModal>
</template>
