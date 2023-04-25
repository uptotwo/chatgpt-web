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
  <NModal v-model:show="notifyDialogShow" :mask-closable="false" :close-on-esc="false" :closable="false"
    :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <div align="center">
      <h4 class="enlarged">
        重要通知
      </h4>
      <div class="enlarged">
        <span class="normalWord">由于成本问题,本站的ChatGPT对话将无法继续免费访问.</span>
      </div>
      <div class="normalWord2">
        <span class="normalWord2">因此推出了收费计划,老用户可以通过</span>
        <span class="normalWord">验证手机</span>
        <span>获取同新注册用户一样的试用额度.</span>
        <div>
          <span> 如果您有更多的使用需求,可以在左侧</span>
          <span class="normalWord">额度商店</span>
          <span>选购合适的套餐.</span>
        </div>
        <span class="normalWord2">同时,收费之后,我们就将:</span>
      </div>
      <div class="normalWord3">
        <div><span >1.提供更稳定快捷的服务 </span></div>
        <div><span>2.提供更多的个性化设置 </span></div>
        <div><span >3.推出更多的高级功能 </span></div>
      </div>
      <div class="normalWord">您可以在[设置]-[关于我们]找到我们的联系方式</div>

      <!-- <img src="../../../assets/groupqrcode.png" alt="加载中,请稍候..." style="width: 30%; aspect-ratio: 1;">
      <br>
      <div style="width: 30%;">
        <span>如果群满无法加入,请添加站长微信bbthan拉您进群</span>
      </div> -->

      <div class="normalWord" />
      <span class="enlarged">感谢您的理解,期待您的加入</span>
      <div >
        <NButton class="normalWord" size="small" type="primary" @click="$emit('child-click')">
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
  width: 70%;
  font-size: 16px;
}

.normalWord2 {
  text-align: left;
  width: 50%;
}

.normalWord3 {
  text-align: left;
  width: 50%;
}
</style>
