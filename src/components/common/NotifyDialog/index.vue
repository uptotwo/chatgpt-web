<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NModal } from 'naive-ui'
import { useAuthStore } from '@/store'

interface Emit {
  (e: 'update:pNotifyDialogShow', pNotifyDialogShow: boolean): void
}

interface Props {
  pNotifyDialogShow: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

const active = ref('General')

// ref(true)
const notifyDialogShow
 = computed(
   {
     get() {
       const localValue = sessionStorage.getItem('notifyDialogShow')
       return localValue !== null ? JSON.parse(localValue) : props.pNotifyDialogShow
     },
     set(ifshow: boolean) {
       sessionStorage.setItem('notifyDialogShow', JSON.stringify(ifshow))
       emit('update:pNotifyDialogShow', ifshow)
     },
   },
 )
</script>

<template>
  <NModal v-model:show="notifyDialogShow" :mask-closable="false" :close-on-esc="false" :closable="false" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <div align="center">
      <h4 class="enlarged">
        ChatGPT，开启智能交互新时代
      </h4>
      <div class="normalWord">
        <span class="normalWord">如果您有任何疑问或者建议,欢迎加入用户交流群</span>
      </div>

      <img src="../../../assets/groupqrcode.png" alt="加载中,请稍候..." style="width: 30%; aspect-ratio: 1;">
      <br>
      <div style="width: 30%;">
        <span>如果群满无法加入,请添加站长微信bbthan拉您进群</span>
      </div>

      <div class="normalWord" />
      <span class="enlarged">期待您的加入</span>
      <div>
        <NButton
          class="normalWord"
          size="small"
          type="primary"
          @click="$emit('child-click')"
        >
          我知道了
        </NButton>
      </div>

      <div class="normalWord" />
    </div>
  </NModal>
</template>

<style>
.enlarged {
  font-size: 20px;
  align-self: center;
  align-content: center;
  align-items: center;
  font-weight: bold;
}
.normalWord {
  width: 40%;
  font-size: 18px;
}
</style>
