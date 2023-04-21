import { defineStore } from 'pinia'
import type { OssClientInfo, OssClientState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'

export const useOssInfoStore = defineStore('oss-store', {
  state: (): OssClientState => getLocalState(),
  actions: {
    updateOssClientInfo(ossClientInfo: Partial<OssClientInfo>) {
      this.ossClientInfo = { ...this.ossClientInfo, ...ossClientInfo }
      this.recordState()
    },
    resetOssClientInfo() {
      this.ossClientInfo = { ...defaultSetting().ossClientInfo }
      this.recordState()
    },
    recordState() {
      setLocalState(this.$state)
    },
  },
})
