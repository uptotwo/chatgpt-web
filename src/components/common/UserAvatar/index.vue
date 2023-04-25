<script setup lang='ts'>
import { computed } from 'vue'
import { NAvatar, NButton } from 'naive-ui'
import { useUserStore } from '@/store'
import defaultAvatar from '@/assets/comboAvatar.png'
import { isString } from '@/utils/is'

interface Props {
  ifshowGetCode: boolean
}
interface Emit {
  (e: 'update:ifshowGetCode', ifshowGetCode: boolean): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

// const ifshowGetCode = ref(false)

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

function toShowGetCode() {
  if (!props.ifshowGetCode)
    emit('update:ifshowGetCode', true)
}
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <NAvatar
          size="large"
          round
          :src="userInfo.avatar"
          :fallback-src="defaultAvatar"
        />
      </template>
      <template v-else>
        <NAvatar size="large" round :src="defaultAvatar" />
      </template>
    </div>
    <div class="flex-1 min-w-0 ml-2">
      <h2 class="overflow-hidden font-bold text-md text-ellipsis whitespace-nowrap">
        {{ userInfo.name ?? '游客' }}
      </h2>
      <!-- <p class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap" /> -->
      <!-- <span >欢迎使用chatGPT</span> -->
      <!-- <span
          v-if="isNumber(userInfo.freeCount)"
          v-html="userInfo.freeCount"
        /> -->
      <template v-if="isString(userInfo.phoneVerified) && userInfo.phoneVerified === 'N'">
        <NButton size="tiny" text type="primary" @click="toShowGetCode">
          验证手机获取额度
        </NButton>
      </template>
      <template v-if="isString(userInfo.phoneVerified) && userInfo.phoneVerified === 'Y'">
        <div class="text-xs">
          已对话[ {{ userInfo.countsUsed }} ]次
        </div>
      </template>
    </div>
  </div>
</template>
