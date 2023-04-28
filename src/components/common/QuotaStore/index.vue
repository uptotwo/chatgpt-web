<script setup lang='ts'>
import type { DataTableColumns } from 'naive-ui'
import { computed, h, ref, watch } from 'vue'
import { NButton, NDataTable, NImage, NModal, NTabPane, NTabs, useMessage } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'
import PromptRecommend from '../../../assets/recommend.json'
import { useAuthStore, usePromptStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { closeBill, getQrcode, verifyPaid } from '@/api'
import defaultAvatar from '@/assets/comboAvatar.png'
import { ms } from 'date-fns/locale'

interface DataProps {
  renderKey: string
  renderValue: string
  key: string
  value: string
}

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const userStore = useUserStore()

const message = useMessage()
const showQrcode = ref(false)
const show = computed({
  get: () => props.visible && !showQrcode.value,
  set: (visible: boolean) => emit('update:visible', visible),
})

const showModal = ref(false)

const importLoading = ref(false)
const exportLoading = ref(false)

const searchValue = ref<string>('')

// 移动端自适应相关
const { isMobile } = useBasicLayout()

const promptStore = usePromptStore()

const authStore = useAuthStore()

const buyButtonWord = isMobile.value ? '购买' : '点击购买'
const modalStyle = isMobile.value ? 'width: 100%; max-width: 400px;' : 'width: 90%; max-width: 500px;'
const operationWidth = isMobile.value ? 80 : 150
// Prompt在线导入推荐List,根据部署者喜好进行修改(assets/recommend.json)
const promptRecommendList = PromptRecommend
const promptList = ref<any>(promptStore.promptList)

// 用于添加修改的临时prompt参数
const tempPromptKey = ref('')
const tempPromptValue = ref('')

// Modal模式，根据不同模式渲染不同的Modal内容
const modalMode = ref('')

// 这个是为了后期的修改Prompt内容考虑，因为要针对无uuid的list进行修改，且考虑到不能出现标题和内容的冲突，所以就需要一个临时item来记录一下
const tempModifiedItem = ref<any>({})

// 添加修改导入都使用一个Modal, 临时修改内容占用tempPromptKey,切换状态前先将内容都清楚
const changeShowModal = (mode: 'add' | 'modify' | 'local_import', selected = { key: '', value: '' }) => {
  if (mode === 'add') {
    tempPromptKey.value = ''
    tempPromptValue.value = ''
  }
  else if (mode === 'modify') {
    tempModifiedItem.value = { ...selected }
    tempPromptKey.value = selected.key
    tempPromptValue.value = selected.value
  }
  else if (mode === 'local_import') {
    tempPromptKey.value = 'local_import'
    tempPromptValue.value = ''
  }
  showModal.value = !showModal.value
  modalMode.value = mode
}

// 在线导入相关
const downloadURL = ref('')
const downloadDisabled = computed(() => downloadURL.value.trim().length < 1)
const setDownloadURL = (url: string) => {
  downloadURL.value = url
}

// 控制 input 按钮
const inputStatus = computed(() => tempPromptKey.value.trim().length < 1 || tempPromptValue.value.trim().length < 1)

// Prompt模板相关操作
const addPromptTemplate = () => {
  for (const i of promptList.value) {
    if (i.key === tempPromptKey.value) {
      message.error(t('store.addRepeatTitleTips'))
      return
    }
    if (i.value === tempPromptValue.value) {
      message.error(t('store.addRepeatContentTips', { msg: tempPromptKey.value }))
      return
    }
  }
  promptList.value.unshift({ key: tempPromptKey.value, value: tempPromptValue.value } as never)
  message.success(t('common.addSuccess'))
  changeShowModal('add')
}

const modifyPromptTemplate = () => {
  let index = 0

  // 通过临时索引把待修改项摘出来
  for (const i of promptList.value) {
    if (i.key === tempModifiedItem.value.key && i.value === tempModifiedItem.value.value)
      break
    index = index + 1
  }

  const tempList = promptList.value.filter((_: any, i: number) => i !== index)

  // 搜索有冲突的部分
  for (const i of tempList) {
    if (i.key === tempPromptKey.value) {
      message.error(t('store.editRepeatTitleTips'))
      return
    }
    if (i.value === tempPromptValue.value) {
      message.error(t('store.editRepeatContentTips', { msg: i.key }))
      return
    }
  }

  promptList.value = [{ key: tempPromptKey.value, value: tempPromptValue.value }, ...tempList] as never
  message.success(t('common.editSuccess'))
  changeShowModal('modify')
}

const deletePromptTemplate = (row: { key: string; value: string }) => {
  promptList.value = [
    ...promptList.value.filter((item: { key: string; value: string }) => item.key !== row.key),
  ] as never
  message.success(t('common.deleteSuccess'))
}

const clearPromptTemplate = () => {
  promptList.value = []
  message.success(t('common.clearSuccess'))
}

const importPromptTemplate = (from = 'online') => {
  try {
    const jsonData = JSON.parse(tempPromptValue.value)
    let key = ''
    let value = ''
    // 可以扩展加入更多模板字典的key
    if ('key' in jsonData[0]) {
      key = 'key'
      value = 'value'
    }
    else if ('act' in jsonData[0]) {
      key = 'act'
      value = 'prompt'
    }
    else {
      // 不支持的字典的key防止导入 以免破坏prompt商店打开
      message.warning('prompt key not supported.')
      throw new Error('prompt key not supported.')
    }

    for (const i of jsonData) {
      if (!(key in i) || !(value in i))
        throw new Error(t('store.importError'))
      let safe = true
      for (const j of promptList.value) {
        if (j.key === i[key]) {
          message.warning(t('store.importRepeatTitle', { msg: i[key] }))
          safe = false
          break
        }
        if (j.value === i[value]) {
          message.warning(t('store.importRepeatContent', { msg: i[key] }))
          safe = false
          break
        }
      }
      if (safe)
        promptList.value.unshift({ key: i[key], value: i[value] } as never)
    }
    message.success(t('common.importSuccess'))
  }
  catch {
    message.error('JSON 格式错误，请检查 JSON 格式')
  }
  if (from === 'local')
    showModal.value = !showModal.value
}

// 模板导出
const exportPromptTemplate = () => {
  exportLoading.value = true
  const jsonDataStr = JSON.stringify(promptList.value)
  const blob = new Blob([jsonDataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ChatGPTPromptTemplate.json'
  link.click()
  URL.revokeObjectURL(url)
  exportLoading.value = false
}

// 模板在线导入
const downloadPromptTemplate = async () => {
  try {
    importLoading.value = true
    const response = await fetch(downloadURL.value)
    const jsonData = await response.json()
    if ('key' in jsonData[0] && 'value' in jsonData[0])
      tempPromptValue.value = JSON.stringify(jsonData)
    if ('act' in jsonData[0] && 'prompt' in jsonData[0]) {
      const newJsonData = jsonData.map((item: { act: string; prompt: string }) => {
        return {
          key: item.act,
          value: item.prompt,
        }
      })
      tempPromptValue.value = JSON.stringify(newJsonData)
    }
    importPromptTemplate()
    downloadURL.value = ''
  }
  catch {
    message.error(t('store.downloadError'))
    downloadURL.value = ''
  }
  finally {
    importLoading.value = false
  }
}

// 移动端自适应相关
const renderTemplate = () => {
  const [keyLimit, valueLimit] = isMobile.value ? [10, 30] : [15, 50]

  return promptList.value.map((item: { key: string; value: string }) => {
    return {
      renderKey: item.key.length <= keyLimit ? item.key : `${item.key.substring(0, keyLimit)}...`,
      renderValue: item.value.length <= valueLimit ? item.value : `${item.value.substring(0, valueLimit)}...`,
      key: item.key,
      value: item.value,
    }
  })
}

const pagination = computed(() => {
  const [pageSize, pageSlot] = isMobile.value ? [6, 5] : [7, 15]
  return {
    pageSize, pageSlot,
  }
})

// table相关
const createColumns = (): DataTableColumns<DataProps> => {
  return [
    {
      title: '套餐名称',
      key: 'renderKey',
    },
    {
      title: '可用时长(天)',
      key: 'renderValue',
    },
    {
      title: '总限额(次)',
      key: 'renderValue',
    },
    {
      title: t('common.action'),
      key: 'actions',
      width: 100,
      align: 'center',
      render(row) {
        return h('div', { class: 'flex items-center flex-col gap-2' }, {
          default: () => [h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'info',
              onClick: () => changeShowModal('modify', row),
            },
            { default: () => t('common.edit') },
          ),
          h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'error',
              onClick: () => deletePromptTemplate(row),
            },
            { default: () => t('common.delete') },
          ),
          h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'info',
              onClick: () => changeShowModal('modify', row),
            },
            { default: () => t('common.edit') },
          ),

          ],
        })
      },
    },
  ]
}

watch(
  () => promptList,
  () => {
    promptStore.updatePromptList(promptList.value)
  },
  { deep: true },
)

// ------------------------------------------------------------------------------------------------------------------
// { sendMail }: { sendMail: (rowData: RowData) => void }
const createQuotaColumns = (): DataTableColumns<RowData> => {
  return [
    {
      title: '套餐名称',
      key: 'goodsTitle',
    },
    {
      title: '可用时长(天)',
      key: 'quotaDay',
    },
    {
      title: '总限额(次)',
      key: 'totalLimit',
    },
    {
      title: '价格(人民币/元)',
      key: 'goodsPrice',
    },
    {
      width: operationWidth,
      align: 'left',
      title: '操作',
      key: 'actions',
      render(row: any) {
        return h(
          NButton,
          {
            size: 'small',
            onClick: () => tobuy(row),
          },
          { default: () => buyButtonWord },
        )
      },
    },
  ]
}
interface Goods {
  goodsCode: string
  goodsTitle: string
  goodsPrice: string
  uuid: string
}

const buying = ref<Goods>({
  goodsCode: 'counts-gpt-35turbo-90',
  goodsTitle: '季度套餐1',
  goodsPrice: '69',
  uuid: '',
})
const qrcodeUrl = ref('')
const buyUrl = `${import.meta.env.VITE_GLOB_API_URL}/buy`
function tobuy(row: any) {
  const myUuid: string = uuidv4()
  buying.value = {
    goodsCode: row.goodsCode,
    goodsTitle: row.goodsTitle,
    goodsPrice: row.goodsPrice,
    uuid: myUuid,
  }
  qrcodeUrl.value = `${buyUrl}?goodsCode=${buying.value.goodsCode}&uuid=${myUuid}&token=${authStore.getToken()}`
  // qrcodeUrl.value = 'http://comboaiavatarbucket.oss-cn-beijing.aliyuncs.com/exampledir/avatar-156*006210-25-01PM.png'
  showQrcode.value = true
  startLoadingClock()
}
const createQuotaData = [
  {
    goodsCode: 'counts-gpt-35turbo-3',
    goodsType: '',
    goodsTitle: '3天体验套餐',
    goodsDesc: '3天,限量200次',
    goodsPrice: '9.9',
    totalLimit: 200,
    quotaDay: 3,
  },
  {
    goodsCode: 'counts-gpt-35turbo-30',
    goodsType: '',
    goodsTitle: '月套餐',
    goodsDesc: '30天,限量1200次',
    goodsPrice: '39',
    totalLimit: 1200,
    quotaDay: 30,
  },
  {
    goodsCode: 'counts-gpt-35turbo-90',
    goodsType: '',
    goodsTitle: '季度套餐1',
    goodsDesc: '90天,限量2000次',
    goodsPrice: '69',
    totalLimit: 2000,
    quotaDay: 90,
  },
  {
    goodsCode: 'counts-gpt-35turbo-120',
    goodsType: '',
    goodsTitle: '季度套餐2',
    goodsDesc: '120天,限量4200次',
    goodsPrice: '139',
    totalLimit: 4200,
    quotaDay: 120,
  },
  {
    goodsCode: 'counts-gpt-35turbo-365',
    goodsType: '',
    goodsTitle: '年套餐',
    goodsDesc: '365天,限量10000次',
    goodsPrice: '289',
    totalLimit: 10000,
    quotaDay: 365,
  },
]

interface RowData {
  key: number
  name: string
  age: number
  address: string
  tags: string[]
}
const quotaColumns = createQuotaColumns()
const quotaData = ref(createQuotaData)

const verifyPayLoading = ref(false)
const verifyPayDisabled = computed(() => verifyPayLoading.value)

async function toVerifyPayRes() {
  verifyPayLoading.value = true
  try {
    const { data } = await verifyPaid<any>(buying.value.uuid)
    userStore.updateUserInfo({ countsUsed: data.totalUsed, countsQuota: data.quota })
    message.success('支付成功')
    showQrcode.value = false
  }
  catch (error: any) {
    message.error(error.message ?? '验证失败', { duration: 2000 })
    // phone.value = ''
  }
  verifyPayLoading.value = false
}
function payModalClose() {
  try {
    closeBill<string>(buying.value.uuid)
    // message.warning('交易已关闭')
  }
  catch (error: any) {
    message.error(error.message ?? '交易关闭失败', { duration: 2000 })
    // phone.value = ''
  }
  qrcodeLoaded.value = false
}
const openPayUrlLoading = ref(false)
async function goPay() {
  openPayUrlLoading.value =true
  try{
    const { data } = await getQrcode<string>(buying.value.uuid)
    window.open(data, '支付页')
  }
  catch (error: any) {
    message.error(error.message ?? '获取链接失败,请稍后重试', { duration: 1000 })
    // phone.value = ''
  }
  openPayUrlLoading.value =false
}
const qrcodeLoaded = ref(false)
function hideLoadingText() {
  qrcodeLoaded.value = true
}
const qrCodeLoadingText = ref('二维码加载中,请稍候')
function startLoadingClock() {
  const ori = '二维码加载中,请稍候'
  let seconds = 30 * 5 //30 sec
  const countdownTimer = setInterval(() => {
    if (seconds % 3 == 1) {
      qrCodeLoadingText.value = ori + '.'
    } else if (seconds % 3 == 0) {
      qrCodeLoadingText.value = ori + '...'
    } else {
      qrCodeLoadingText.value = ori + '.....'
    }
    if (seconds <= 0 || qrcodeLoaded.value == true)
      clearInterval(countdownTimer)
    else
      seconds--
  }, 200)
}


</script>

<template>
  <NModal v-model:show="show" style="width: 90%; max-width: 900px;" preset="card">
    <div class="space-y-4">
      <NTabs type="segment">
        <NTabPane name="quotaStore" tab="对话次数购买">
          <NDataTable :max-height="400" :columns="quotaColumns" :data="quotaData" :bordered="false" />
        </NTabPane>
      </NTabs>
    </div>
  </NModal>
  <NModal v-model:show="showQrcode" :style="modalStyle" preset="card" :close-on-esc="false"
    :on-after-leave="payModalClose">
    <div v-if="showQrcode" class="space-y-4 items-center">
      <h2 class="text-xl text-center text-slate-800 dark:text-neutral-200">
        您当前要订购的套餐为:
      </h2>
      <br>
      <span class="flex-shrink-0 w-[200px] text-center text-base">{{ buying.goodsTitle }}</span>
      <br>
      <span class="flex-shrink-0 w-[100px] ">价格: {{ buying.goodsPrice }} (人民币/元)</span>      
      <!-- https://ppt.chnlib.com/FileUpload/2018-11/7-Cai_Se_Re_1i_1iu_Gao-110740_144.png -->
      <NImage :hidden="!qrcodeLoaded" :on-load="hideLoadingText" :src="qrcodeUrl" width="200" object-fit="contain"/>
      <!-- <div class="flex-shrink-0 w-[200px] text-center text-base"> -->
        <span class="flex-shrink-0 w-[200px] text-center text-base" :hidden="qrcodeLoaded">{{ qrCodeLoadingText }}</span>
        <br>
        <br>
        <span :hidden="!qrcodeLoaded" class="flex-shrink-0 w-[100px] ">订单10分钟后自动关闭,请及时支付</span>
      <!-- </div> -->
      <div class="flex items-center space-x-4">
        <!-- <NImage src="https://ppt.chnlib.com/FileUpload/2018-11/7-Cai_Se_Re_1i_1iu_Gao-110740_144.png" width="200" /> -->
        <div class="flex-1 items-center">
          <span>支付宝扫描上方二维码 </span>
          或者
          <NButton type="primary" text size="large" :loading="openPayUrlLoading" @click="goPay">
            [点击这里]
          </NButton>
          <span> 进行支付 </span>
        </div>
      </div>
      <NButton block type="primary" :disabled="verifyPayDisabled" :loading="verifyPayLoading" @click="toVerifyPayRes">
        已经支付?点击这里
      </NButton>
    </div>
  </NModal>
</template>
