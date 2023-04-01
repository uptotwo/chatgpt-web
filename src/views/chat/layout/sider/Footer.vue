<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))
const NotifyDialog = defineAsyncComponent(() => import('@/components/common/NotifyDialog/index.vue'))

const show = ref(false)
const notifyDialogShow = ref(getLocalDialogShow())
// const notifyDialogShow = computed<boolean>(() => {
//   const localValue = localStorage.getItem('notifyDialogShow')
//   return localValue !== null ? JSON.parse(localValue) : true
// })

// const notifyDialogShow = computed({
//   get() {
//     const localValue = localStorage.getItem('notifyDialogShow')
//     return localValue !== null ? JSON.parse(localValue) : true
//   },
//   set(visible: boolean) {
//     localStorage.setItem('notifyDialogShow', JSON.stringify(visible))
//   },
// })
function getLocalDialogShow() {
  const localValue = sessionStorage.getItem('notifyDialogShow')
  return localValue !== null ? JSON.parse(localValue) : true
}
// const notifyDialogShow = computed<boolean>(
//   {
//     get() {
//       const localValue = localStorage.getItem('notifyDialogShow')

//       return localValue !== null ? JSON.parse(localValue) : true
//     },
//     set(ifshow: boolean) {
//       localStorage.setItem('notifyDialogShow', JSON.stringify(ifshow))
//     },
//   },
// )
function setNotifyDialogShow(ifshow: boolean) {
  localStorage.setItem('notifyDialogShow', JSON.stringify(ifshow))
  notifyDialogShow.value = ifshow
}
const onChildClick = () => {
  setNotifyDialogShow(false)
}
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div>

    <HoverButton @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>

    <Setting v-if="show" v-model:visible="show" />
    <NotifyDialog v-if="notifyDialogShow" v-model:pNotifyDialogShow="notifyDialogShow" @child-click="onChildClick" />
  </footer>
</template>
