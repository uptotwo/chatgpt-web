<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'

const VerifyPhoneDialog = defineAsyncComponent(() => import('@/components/common/VerifyPhoneDialog/index.vue'))
const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const NotifyDialog = defineAsyncComponent(() => import('@/components/common/NotifyDialog/index.vue'))

const show = ref(false)
const notifyDialogShow = ref(getLocalDialogShow())
function getLocalDialogShow() {
  const localValue = localStorage.getItem('notifyDialogShow')
  return localValue !== null ? JSON.parse(localValue) : false
}
function setNotifyDialogShow(ifshow: boolean) {
  localStorage.setItem('notifyDialogShow', JSON.stringify(ifshow))
  notifyDialogShow.value = ifshow
}
const onChildClick = () => {
  setNotifyDialogShow(false)
}
const ifshowGetCode = ref(false)
function updateIfShowGetCode(ifshowGetCodeVal: boolean) {
  ifshowGetCode.value = ifshowGetCodeVal
}
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar :ifshow-get-code="ifshowGetCode" @update:ifshow-get-code="updateIfShowGetCode" />
    </div>

    <HoverButton @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>

    <Setting v-if="show" v-model:visible="show" />
    <NotifyDialog v-if="notifyDialogShow" v-model:pNotifyDialogShow="notifyDialogShow" @child-click="onChildClick" />
    <VerifyPhoneDialog v-if="ifshowGetCode" :visible="ifshowGetCode" @update:visible="updateIfShowGetCode" />
  </footer>
</template>
