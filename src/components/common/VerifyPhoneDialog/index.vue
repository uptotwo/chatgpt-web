<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { useUserStore } from '@/store'
import { freeTrial, getVerifyCode, verifyPhoneCode } from '@/api'

interface Props {
  visible: boolean
}
interface Emit {
  (e: 'update:visible', visible: boolean): void
}
interface UserExtra {
  totalUsed: number
  countsQuota: number
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const ms = useMessage()
// const ifshowGetCode = ref(false)
const getCodeButtonLoading = ref(false)

const theVerifyPhoneCode = ref('')
const waitingSecond = ref(0)
const userStore = useUserStore()
// const ifshowGetCodeC = props.ifshowGetCode

const userInfo = computed(() => userStore.userInfo)
const getCodeButtonDisabled = computed(() => getCodeButtonLoading.value || waitingSecond.value !== 0)
const getCodeWord = computed(() => `获取验证码 ${waitingSecond.value === 0 ? '' : `(${waitingSecond.value})`}`)
const verifyPhoneCodeButtonDisabled = computed(() => (!theVerifyPhoneCode.value.trim() || theVerifyPhoneCode.value.trim().length !== 6))

function validateHandlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    toVerifyPhoneCode()
  }
}
async function toVerifyPhoneCode() {
  try {
    const { data } = await verifyPhoneCode<string>(userInfo.value.account, theVerifyPhoneCode.value.trim())
    ms.success(data ?? '验证成功', { duration: 1000 })
    const userExtra = await freeTrial<UserExtra>()
    userStore.updateUserInfo({ countsUsed: userExtra.data.totalUsed, phoneVerified: 'Y', countsQuota: userExtra.data.countsQuota })
    emit('update:visible', false)
  }
  catch (error: any) {
    ms.error(error.message ?? '验证码有误,请重新输入', { duration: 2000 })
    // phone.value = ''
  }
}
// function handleGetCode() {
//   emit('update:visible', false)
// }
// 倒计时
async function handleGetCode() {
  getCodeButtonLoading.value = true
  try {
    const { data } = await getVerifyCode<string>(userInfo.value.account)
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
const ifshowGetCode = computed({
  get() {
    return props.visible
  },
  set(ifshowGetCode: boolean) {
    emit('update:visible', ifshowGetCode)
  },
})
</script>

<template>
  <NModal v-model:show="ifshowGetCode" :mask-closable="true" :close-on-esc="false" :closable="false" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <div class="space-y-4">
      <header class="space-y-2">
        <h2 class="text-2xl text-center text-slate-800 dark:text-neutral-200">
          验证手机
        </h2>
        <!-- <p class="text-base text-center text-slate-500 dark:text-slate-500">
              {{ $t('common.unauthorizedTips') }}
            </p> -->
        <Icon403 class="w-[200px] m-auto" />
      </header>
      <div class="space-y-4">
        <NInput v-model:value="userInfo.account" type="text" disabled />
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
    </div>
  </NModal>
</template>
