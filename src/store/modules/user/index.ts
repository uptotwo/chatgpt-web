import { defineStore } from 'pinia'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'

export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  actions: {
    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.recordState()
    },

    decreaseCount() {
      if (this.userInfo.countsFree > 0) {
        const deed = this.userInfo.countsFree - 1
        this.updateUserInfo({ countsFree: deed })
        return
      }
      if (this.userInfo.countsPaid > 0) {
        const deed = this.userInfo.countsPaid - 1
        this.updateUserInfo({ countsPaid: deed })
        return
      }
      // eslint-disable-next-line no-console
      console.log('u need to pay')
    },

    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
