<template>
  <div class="fagai-dynamic-container">
    <el-card shadow="hover" class="page-card">
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-row">
          <el-input
            v-model.trim="state.getInfoParams.contractid"
            clearable
            placeholder="合同编号"
            size="default"
            class="search-item"
          />
          <el-input
            v-model.trim="state.getInfoParams.ccompanyname"
            clearable
            placeholder="采购方企业名称"
            size="default"
            class="search-item"
          />
          <el-input
            v-model.trim="state.getInfoParams.cusername"
            clearable
            placeholder="采购人姓名"
            size="default"
            class="search-item"
          />
        </div>

        <div class="search-row">
          <el-select
            v-model="state.getInfoParams.status"
            placeholder="筛选订单状态"
            class="search-item"
            clearable
          >
            <el-option
              v-for="item in state.statusOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
          <el-date-picker
            v-model="state.getInfoParams.timeRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="search-item search-date-picker"
          />
          <el-checkbox
            v-model="state.getInfoParams.showOnlyActive"
            class="search-checkbox"
            @change="getOrders"
            >只显示有效订单</el-checkbox
          >
          <el-button type="primary" @click="getOrders" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="downloadFile" class="search-btn">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
      </div>

      <!-- 订单列表 -->
      <el-table
        :data="state.orderList"
        style="width: 100%"
        @row-dblclick="onCompanyTableRowDBClicked"
        stripe
        border
        :header-cell-style="{
          background: '#f8f9fa',
          color: '#333',
          fontWeight: '500',
        }"
        :empty-text="emptyTableText"
        size="default"
        class="full-table"
        table-layout="fixed"
      >
        <el-table-column prop="id" label="ID" min-width="60px" align="center" />
        <el-table-column
          prop="contractid"
          label="合同编号"
          min-width="100px"
          show-overflow-tooltip
        />
        <el-table-column
          prop="totalprice"
          label="订单价格"
          min-width="70px"
          align="right"
        >
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.totalprice }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="bcompanyname"
          label="供应商"
          min-width="150px"
          show-overflow-tooltip
        />
        <el-table-column
          prop="ccompanyname"
          label="采购方"
          min-width="150px"
          show-overflow-tooltip
        />
        <el-table-column prop="ccompanygrade" label="企业类型" min-width="70px">
          <template #default="scope">
            {{ showCompanyGrade(scope.row.ccompanygrade) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="cusername"
          label="采购人"
          min-width="60px"
          align="center"
        />
        <el-table-column
          prop="status"
          label="订单状态"
          min-width="80px"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{
              showstatus(scope.row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createtime"
          label="订单时间"
          min-width="180px"
          v-if="!state.getInfoParams.showOnlyActive"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="approvetime"
          label="审批时间"
          min-width="180px"
          v-if="state.getInfoParams.showOnlyActive"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.approvetime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="state.getInfoParams.currentPage"
          :page-size="state.getInfoParams.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="state.getInfoParams.totalCount"
          @current-change="handleCurrentChange"
          background
          size="default"
        />
      </div>
    </el-card>

    <!-- 订单信息模态窗口 -->
    <el-dialog
      v-model="state.showOrderInfoDialog"
      width="90%"
      :show-close="false"
      @close="resetOrderForm"
      class="order-detail-dialog"
      draggable
    >
      <div class="dialog-header">
        <h2 class="dialog-title">
          <el-icon><Document /></el-icon>
          订单详情
          <span class="contract-id-tag">{{
            state.orderInfoForm.contractid
          }}</span>
        </h2>
      </div>

      <el-scrollbar height="70vh" class="dialog-scrollbar">
        <el-form
          :model="state.orderInfoForm"
          label-width="100px"
          class="detail-form"
        >
          <!-- 第一区域：采购商信息 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><UserFilled /></el-icon>
              <h3>采购商信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="采购企业名称">
                <el-input
                  v-model="state.orderInfoForm.ccompanyname"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="有效额度">
                <el-input
                  v-model="state.orderInfoForm.ccompanyAvailableCredit"
                  readonly
                  class="read-only-input"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="接口人姓名">
                <el-input
                  v-model="state.orderInfoForm.cusername"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="职位信息">
                <el-input
                  v-model="state.orderInfoForm.cusertitle"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="联系方式">
                <el-input
                  v-model="state.orderInfoForm.cuserphone"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="信用编码">
                <el-input
                  v-model="state.orderInfoForm.creditcode"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 第二区域：供应商信息 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Shop /></el-icon>
              <h3>供应商信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="供应商名称">
                <el-input
                  v-model="state.orderInfoForm.bcompanyname"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="接口人姓名">
                <el-input
                  v-model="state.supplierInfo.bcompanycpname"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="接口人电话">
                <el-input
                  v-model="state.supplierInfo.bcompanycpphone"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="接口人邮件">
                <el-input
                  v-model="state.supplierInfo.bcompanycpmail"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 第三区域：商品信息 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Goods /></el-icon>
              <h3>商品信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="订单总额">
                <el-input
                  v-model="state.orderInfoForm.totalprice"
                  :readonly="state.orderInfoForm.status !== 1"
                  class="read-only-input"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="合同总额">
                <el-input
                  v-model="state.orderInfoForm.contractprice"
                  :readonly="state.orderInfoForm.status !== 1"
                  class="read-only-input"
                  @input="handleContractPriceChange"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="订单状态">
                <el-input
                  :value="showstatus(state.orderInfoForm.status)"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="订单创建时间">
                <el-input
                  :value="timestamp2datetime(state.orderInfoForm.createtime)"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
            </div>

            <!-- 订单内容详情 -->
            <div class="order-content-section">
              <div class="section-subheader">
                <el-icon><List /></el-icon>
                <h4>订单内容</h4>
              </div>
              <div
                v-for="(item, index) in state.orderContentList"
                :key="index"
                class="order-content-item"
              >
                <el-divider content-position="left">
                  <span class="item-title">商品 {{ index + 1 }}</span>
                </el-divider>
                <div class="form-grid">
                  <el-form-item label="单品价格">
                    <el-input
                      v-model="item.singleprice"
                      readonly
                      class="read-only-input"
                    >
                      <template #prefix>¥</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="购买数量">
                    <el-input
                      v-model="item.buyamount"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="金额小计">
                    <el-input
                      v-model="item.singleamount"
                      readonly
                      class="read-only-input"
                    >
                      <template #prefix>¥</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="商品名称">
                    <el-input
                      v-model="item.producttitle"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="计价方式">
                    <el-input
                      v-model="item.pricetype"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item
                    label="套餐说明"
                    v-if="item.pricetype === '套餐计价'"
                  >
                    <el-input
                      v-model="item.packagetitle"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="建筑面积" v-if="item.buildarea">
                    <el-input
                      v-model="item.buildarea"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="居室信息" v-if="item.js">
                    <el-input
                      v-model="item.js"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="起租日期" v-if="item.starttanent">
                    <el-input
                      :value="timestamp2date(item.starttanent)"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="退租日期" v-if="item.endtanent">
                    <el-input
                      :value="timestamp2date(item.endtanent)"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="商品图片" class="image-form-item">
                    <div class="image-list">
                      <div
                        v-if="parseImageList(item.imagelist).length === 0"
                        class="img-placeholder"
                      >
                        <el-icon><Picture /></el-icon>
                        <span>暂无图片</span>
                      </div>
                      <img
                        v-for="(img, imgIndex) in parseImageList(
                          item.imagelist,
                        )"
                        :key="imgIndex"
                        :src="img.url"
                        alt="商品图片"
                        class="preview-img"
                        @click="previewImage(img.url)"
                        loading="lazy"
                      />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>

            <!-- 订单支付计划 -->
            <div
              class="order-pay-plan"
              v-if="
                state.paymentPlan && Object.keys(state.paymentPlan).length > 0
              "
            >
              <div class="section-subheader">
                <el-icon><InfoFilled /></el-icon>
                <h4>支付计划</h4>
              </div>
              <div class="form-grid">
                <el-form-item label="订单总额">
                  <el-input
                    :value="state.paymentPlan.totalprice"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="补贴方式">
                  <el-input
                    :value="
                      state.paymentPlan.subsidytype === 'discount'
                        ? '折扣比例'
                        : '限额补贴'
                    "
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item
                  label="积分补贴"
                  v-if="state.paymentPlan.subsidytype === 'deduction'"
                >
                  <el-input
                    :value="state.paymentPlan.face_value"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item
                  label="折扣比例"
                  v-if="state.paymentPlan.subsidytype === 'discount'"
                >
                  <el-input
                    :value="state.paymentPlan.face_value"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item
                  label="折扣限额"
                  v-if="state.paymentPlan.subsidytype === 'discount'"
                >
                  <el-input
                    :value="state.paymentPlan.limitamount"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="平台补贴">
                  <el-input
                    :value="state.paymentPlan.totalSubsidyAmount"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="租户自付">
                  <el-input
                    :value="state.paymentPlan.userPayAmount"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="租户姓名">
                  <el-input
                    :value="state.paymentPlan.tanentname"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="租户身份证">
                  <el-input
                    :value="state.paymentPlan.tanentid"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="租户电话">
                  <el-input
                    :value="state.paymentPlan.phone"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
                <el-form-item label="租户职务">
                  <el-input
                    :value="state.paymentPlan.title"
                    readonly
                    class="read-only-input"
                  />
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 第四区域：订单操作历史 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Clock /></el-icon>
              <h3>订单操作历史</h3>
            </div>
            <el-table
              :data="state.orderActionList"
              border
              style="width: 100%; margin-bottom: 20px"
              stripe
              size="small"
              :empty-text="
                state.orderActionList.length === 0 ? '暂无操作记录' : ''
              "
            >
              <el-table-column
                label="序号"
                type="index"
                :index="(index) => index + 1"
                width="60px"
                align="center"
              />
              <el-table-column
                label="操作人姓名"
                prop="username"
                min-width="120px"
              />
              <el-table-column
                label="联系方式"
                prop="userphone"
                min-width="130px"
              />
              <el-table-column
                label="操作内容"
                prop="actionDesc"
                min-width="150px"
              >
                <template #default="scope">
                  <el-tag size="small">{{
                    getActionDesc(scope.row.action)
                  }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="操作时间"
                prop="timestamp"
                min-width="180px"
              >
                <template #default="scope">
                  {{ timestamp2datetime(scope.row.timestamp) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 第五区域：文件列表 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><FolderOpened /></el-icon>
              <h3>文件列表</h3>
            </div>
            <div class="form-line">
              <!-- 需求说明文件 -->
              <el-form-item
                label="需求说明文件"
                class="file-form-item"
                style="width: 45%"
              >
                <div class="file-upload-wrapper">
                  <el-upload
                    :action="store.state.uploadApi"
                    :data="state.uploadContractFileForm"
                    disabled
                    :on-success="handleContractUploadSuccess"
                    :before-remove="handleRemoveContractFile"
                    :file-list="state.contractFileList"
                    :limit="1"
                    :on-exceed="handleFileExceed"
                    class="upload-component"
                  >
                    <el-button type="primary" size="default">
                      <el-icon><Upload /></el-icon>
                      上传需求说明文件
                    </el-button>
                  </el-upload>
                  <div
                    v-if="state.orderInfoForm.contractfile"
                    class="file-link-wrapper"
                  >
                    <el-button
                      type="primary"
                      text
                      @click="downloadFileOuter(state.contractFileList)"
                      class="file-link-btn"
                    >
                      <el-icon><Download /></el-icon>
                      下载需求说明文件
                    </el-button>
                  </div>
                  <div v-else class="no-file-tip">
                    <el-icon><Document /></el-icon>
                    暂无文件
                  </div>
                </div>
              </el-form-item>

              <!-- 项目结项证明文件 handleRemoveFinishFile-->
              <el-form-item
                label="结项证明文件"
                class="file-form-item"
                style="width: 45%"
              >
                <div class="file-upload-wrapper">
                  <el-upload
                    :action="store.state.uploadApi"
                    :data="state.uploadOrderCompliteFileForm"
                    disabled
                    :on-success="handleFinishFileUploadSuccess"
                    :before-remove="handleRemoveFinishFile"
                    :file-list="state.finishFileList"
                    :limit="1"
                    :on-exceed="handleFileExceed"
                    class="upload-component"
                  >
                    <el-button type="primary" size="default">
                      <el-icon><Upload /></el-icon>
                      上传结项证明文件
                    </el-button>
                  </el-upload>
                  <div
                    v-if="state.orderInfoForm.finishfiles"
                    class="file-link-wrapper"
                  >
                    <el-button
                      type="primary"
                      text
                      @click="downloadFileOuter(state.finishFileList)"
                      class="file-link-btn"
                    >
                      <el-icon><Download /></el-icon>
                      下载结项证明文件
                    </el-button>
                  </div>
                  <div v-else class="no-file-tip">
                    <el-icon><Document /></el-icon>
                    暂无文件
                  </div>
                </div>
              </el-form-item>
            </div>
            <div class="form-line">
              <!-- 订单终止说明 -->
              <el-form-item
                label="订单终止说明"
                class="full-width-item"
                style="width: 100%"
              >
                <el-input
                  v-model="state.orderInfoForm.terminatedesc"
                  type="textarea"
                  :disabled="!(state.orderInfoForm.status > -1)"
                  placeholder="请输入终止说明（仅终止订单时填写）"
                  :rows="4"
                  class="terminate-textarea"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </el-scrollbar>

      <!-- 操作按钮区域 -->
      <template #footer>
        <div class="dialog-footer-wrapper">
          <!-- 关闭按钮 -->
          <el-button @click="state.showOrderInfoDialog = false" icon="Close">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看图片窗体 -->
    <el-dialog
      v-model="state.dialogViewPicVisible"
      class="dialog-preview"
      title="图片预览"
      :close-on-click-modal="true"
      width="80%"
      top="5vh"
    >
      <div class="preview-container">
        <img
          :src="state.curDialogImageUrl"
          alt="Preview Image"
          class="preview-image"
          loading="lazy"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Delete,
  Search,
  Document,
  UserFilled,
  Shop,
  Goods,
  List,
  Clock,
  FolderOpened,
  Upload,
  Download,
  WarningFilled,
  InfoFilled,
  Picture,
  Check,
  Close,
  EditPen,
  CircleCheck,
  SwitchButton,
  // Stop,
} from "@element-plus/icons-vue";
import { download } from "../../utils/request";
import { info } from "sass";

const state = reactive({
  fileTempList: [],
  orderList: [],
  showOrderInfoDialog: false,
  showUploadFileDialog: false,
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    contractid: "",
    bcompanyid: "",
    ccompanyname: "",
    timeRange: [],
    cusername: "",
    status: "",
    showOnlyActive: false, // 新增字段，是否只显示有效订单
  },
  dialogViewPicVisible: false,
  curDialogImageUrl: "",
  orderInfoForm: {
    id: "",
    contractid: "",
    categoryaid: "",
    bcompanyid: "",
    bcompanyname: "",
    ccompanyid: "",
    ccompanyname: "",
    ccompanyAvailableCredit: "", // 有效额度
    cuserid: "",
    cusername: "",
    ordercontent: "",
    totalprice: "",
    contractprice: "",
    status: "",
    finishfiles: "",
    terminatedesc: "",
    useractionrecords: "",
    contractfile: "",
    createtime: "",
    updatetime: "",
    cusertitle: "",
    cuserphone: "",
    creditcode: "",
  },
  paymentPlan: {},
  uploadContractFileForm: {
    fileid: "110",
    orderid: "",
    cuserid: "",
    filetype: "ORDER_CONTRACT_FILE",
  },
  uploadOrderCompliteFileForm: {
    fileid: "110",
    orderid: "",
    cuserid: "",
    filetype: "ORDER_COMPLETE_FILE",
  },
  uploadFileList: "",
  category_a_info: {
    id: "",
    title: "",
  },
  category_b_info: {
    id: "",
    title: "",
  },
  // 供应商扩展信息
  supplierInfo: {
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  },
  // 解析后的订单内容列表
  orderContentList: [],
  // 解析后的操作历史列表
  orderActionList: [],
  // 合同文件上传列表
  contractFileList: [],
  // 结项文件上传列表
  finishFileList: [],

  categories_a: [],
  categories_b: [],
  searchCategorybs: [],
  statusOptions: [
    { id: 0, title: "待主管审核" },
    { id: 1, title: "待签约" },
    { id: 2, title: "服务中" },
    { id: 3, title: "已结项" },
    { id: 4, title: "待后台签约" },
    { id: -1, title: "用户取消订单" },
    { id: -2, title: "审核未通过" },
    { id: -3, title: "后台终止" },
    { id: -4, title: "主管审核拒绝" },
  ],
});

const getCategories = () => {
  // 访问接口给两个category赋值
  let payload = {};
  request.post("/getcategories", payload).then((res) => {
    if (res) {
      state.categories_a = res.data.arr_category_a;
      state.categories_b = res.data.arr_category_b;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

// 空表格提示文本
const emptyTableText = computed(() => {
  return "暂无订单数据，请调整查询条件后重试";
});

// 根据状态获取标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    // 0-4(主管审核)-1-2-3
    0: "warning", // 待主管审核
    1: "primary", // 待签约
    2: "info", // 服务中
    3: "success", // 已结项
    4: "primary", // 待后台签约
    "-1": "danger", // 用户取消订单
    "-2": "danger", // 审核未通过
    "-3": "danger", // 后台终止
    "-4": "danger", // 主管审核拒绝
  };
  return statusMap[status] || "default";
};

// 解析图片列表字符串
const parseImageList = (imagelistStr) => {
  if (!imagelistStr) return [];
  try {
    return JSON.parse(imagelistStr);
  } catch (e) {
    console.warn("解析图片列表失败:", e);
    return [];
  }
};

// 预览图片
const previewImage = (url) => {
  state.curDialogImageUrl = url;
  state.dialogViewPicVisible = true;
};

// 获取供应商信息
const getSupplierInfo = (bcompanyid) => {
  if (!bcompanyid) return;
  let payload = {
    bcompanyid: bcompanyid,
  };
  request.post("/getbcompanyuserinfobyid", payload).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      state.supplierInfo.bcompanycpname = res.data[0].bcompanycpname || "";
      state.supplierInfo.bcompanycpphone = res.data[0].bcompanycpphone || "";
      state.supplierInfo.bcompanycpmail = res.data[0].bcompanycpmail || "";
    }
  });
};

// 解析订单内容
const parseOrderContent = (contentStr) => {
  if (!contentStr) {
    state.orderContentList = [];
    return;
  }
  try {
    state.orderContentList = JSON.parse(contentStr);
  } catch (e) {
    console.warn("解析订单内容失败:", e);
    state.orderContentList = [];
  }
};

// 显示企业类型
const showCompanyGrade = (grade) => {
  const gradeMap = {
    1: "总部型",
    2: "领军型",
    3: "领跑型",
    4: "潜力型",
    5: "未知类型",
  };
  return gradeMap[grade] || "未知类型";
};

// 解析操作历史
const parseOrderActionRecords = (recordsStr) => {
  if (!recordsStr) {
    state.orderActionList = [];
    return;
  }
  try {
    state.orderActionList = JSON.parse(recordsStr);
  } catch (e) {
    console.warn("解析操作历史失败:", e);
    state.orderActionList = [];
  }
};

// 获取操作描述
const getActionDesc = (action) => {
  const actionMap = {
    create_order: "创建订单",
    cancel_order: "取消订单",
    approve_order: "审核通过",
    approve_denied: "审核未通过",
    contract_signed: "合同签署",
    order_accomplished: "服务结项",
    order_suspended: "服务后台终止",
  };
  return actionMap[action] || action;
};

// 下载文件的前端方法
const downloadFile = async (uuidName, fileName) => {
  try {
    const payload = {
      ...state.getInfoParams,
      userid: store.state.userinfo.userid,
    };

    const res = await request.post("/getordersexcelfile", payload);
    const fileName = res?.data?.filename || res?.filename;

    if (!fileName) {
      ElMessage.error("获取下载文件名失败");
      return;
    }

    const downloadUrl = `https://mvpme82.cloud/data/${fileName}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("下载失败：", error);
    ElMessage.error("文件下载失败，请重试");
  }
};

// 下载文件
const downloadFileOuter = (fileList) => {
  if (!fileList || fileList.length === 0) {
    ElMessage.warning("暂无文件可下载");
    return;
  }
  const fileName = fileList[0].name;
  const uuidName = fileList[0].url;

  const downloadUrl = `https://mvpme82.cloud/data/${uuidName}`;
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 文件超出数量限制
const handleFileExceed = () => {
  ElMessage.warning("最多只能上传一个文件");
};
// 删除合同文件
const handleRemoveContractFile = (file, uploadFiles) => {
  request
    .post("/deleteorderattatchfile", {
      orderid: state.orderInfoForm.id,
      doctype: "ORDER_CONTRACT_FILE",
    })
    .then((res) => {
      if (res.retcode === "200") {
        ElMessage.success(`操作成功，已删除文件！`);
        state.orderInfoForm.contractfile = "";
        state.contractFileList = [];
      } else {
        getattachfiles();
        ElMessage.error("操作失败，请重试");
      }
    });
};

// 删除结项文件
const handleRemoveFinishFile = (file, uploadFiles) => {
  request
    .post("/deleteorderattatchfile", {
      orderid: state.orderInfoForm.id,
      doctype: "ORDER_COMPLETE_FILE",
    })
    .then((res) => {
      if (res.retcode === "200") {
        ElMessage.success(`操作成功，已删除文件！`);
        state.orderInfoForm.finishfiles = "";
        state.finishFileList = [];
      } else {
        getattachfiles();
        ElMessage.error("操作失败，请重试");
      }
    });
};

// 合同文件上传成功回调
const handleContractUploadSuccess = (res) => {
  if (res.status === "200" || res.status === 200) {
    state.orderInfoForm.contractfile = res.imgurl;
    state.contractFileList = [];
    state.contractFileList.push({
      name: res.imgurl,
      url: res.timestamp,
    });
    ElMessage.success("合同扫描件上传成功");
  } else {
    ElMessage.error("合同扫描件上传失败");
  }
};

// 结项文件上传成功回调
const handleFinishFileUploadSuccess = (res) => {
  if (res.status === "200" || res.status === 200) {
    state.orderInfoForm.finishfiles = res.imgurl;
    state.finishFileList.push({
      name: res.imgurl,
      url: res.timestamp,
    });
    ElMessage.success("结项证明文件上传成功");
  } else {
    ElMessage.error("结项证明文件上传失败");
  }
};

// 根据状态获取操作key
const getActionKeyByStatus = (status) => {
  const statusMap = {
    1: "approve_order",
    "-1": "order_cancelled",
    "-2": "approve_denied",
    2: "contract_signed",
    3: "order_accomplished",
    "-3": "order_suspended",
  };
  return statusMap[status] || "";
};

const getFirstImageUrl = (imagelistStr) => {
  if (!imagelistStr || typeof imagelistStr !== "string") return "";
  try {
    const imagelist = JSON.parse(imagelistStr);
    if (Array.isArray(imagelist) && imagelist.length > 0 && imagelist[0].url) {
      return imagelist[0].url;
    }
    return "";
  } catch (e) {
    console.warn("解析imagelist失败:", e);
    return "";
  }
};

const handleRemoveImg = (uploadFile, uploadFiles) => {
  state.orderInfoForm.imagelistreal = [];
  state.orderInfoForm.imagelist = [];
  uploadFiles.forEach((item, index) => {
    let curobj = {
      name: item.name,
      url: item.url,
    };
    state.orderInfoForm.imagelistreal.push(curobj);
  });
  state.orderInfoForm.imagelist = state.orderInfoForm.imagelistreal;
};

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 1) {
    ElMessage.error("Picture size can not exceed 1MB!");
    return false;
  }
  return true;
};

const handlePictureCardPreview = (uploadedFile) => {
  state.curDialogImageUrl = uploadedFile.url;
  state.dialogViewPicVisible = true;
};

const handleUploadFileOver = (res) => {
  if (res.status === 200) {
    let curObj = {
      name: state.orderInfoForm.imagelistreal.length + 1,
      url: res.imgurl,
    };
    state.orderInfoForm.imagelistreal.push(curObj);
  } else {
    ElMessage.error("请选择1M以下的图片文件！");
  }
  state.orderInfoForm.imagelist = state.orderInfoForm.imagelistreal;
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.uploadContractFileForm.orderid = row.id;
  state.uploadContractFileForm.cuserid = row.cuserid;

  state.uploadOrderCompliteFileForm.orderid = row.id;
  state.uploadOrderCompliteFileForm.cuserid = row.cuserid;
  // 重置表单
  state.supplierInfo = {
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  };
  state.orderContentList = [];
  state.orderActionList = [];
  state.contractFileList = [];
  state.finishFileList = [];
  state.paymentPlan = {};

  // 赋值基础信息
  Object.keys(state.orderInfoForm).forEach((key) => {
    state.orderInfoForm[key] = row[key] || "";
  });

  state.orderInfoForm.status = row.status;
  state.orderInfoForm.categoryaid = row.categoryaid;

  if (row.categoryaid === 0) {
    getPaymentPlanByOrderId(row.id);
  }

  // 获取供应商信息
  getSupplierInfo(row.bcompanyid);

  // 解析订单内容
  parseOrderContent(row.ordercontent);

  // 解析操作历史
  parseOrderActionRecords(row.useractionrecords);

  // 获取合同文件和结项证明文件
  request.post("/getorderattachfiles", { orderid: row.id }).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      // 遍历res.data.data数组，如果当前对象的doctype = "ORDER_CONTRACT_FILE",state.orderInfoForm.contractfile = 对象的filename，state.orderInfoForm.finishfiles = []
      res.data.forEach((item) => {
        if (item.doctype === "ORDER_CONTRACT_FILE") {
          state.orderInfoForm.contractfile = item.filename;
          state.contractFileList.push({
            name: item.filename,
            url: item.uuidname,
          });
        } else if (item.doctype === "ORDER_COMPLETE_FILE") {
          state.orderInfoForm.finishfiles = item.filename;
          state.finishFileList.push({
            name: item.filename,
            url: item.uuidname,
          });
        }
      });
    }
  });
  // 如果是安居产品，获取承租人姓名及身份证号,延迟100ms执行，确保订单内容已解析完成
  setTimeout(() => {
    if (row.categoryaid === 0) {
      request
        .post("/gettanentinfobyorderid", { orderId: row.id })
        .then((res) => {
          if (res && res.code === "200" && res.data) {
            state.paymentPlan.tanentname = res.data[0].tanentname || "";
            state.paymentPlan.tanentid = res.data[0].tanentid || "";
            state.paymentPlan.phone = res.data[0].phone || "";
            state.paymentPlan.title = res.data[0].title || "";
          }
        });
    }
  }, 100);
  state.showOrderInfoDialog = true;
};

// 异步获取订单的支付计划（仅针对安居类订单）
const getPaymentPlanByOrderId = (orderid) => {
  request
    .post("getpaymentplanbyorderid", { orderid: orderid })
    .then((res) => {
      console.info("获取支付计划接口返回：", res);
      if (res && res.retcode === "200" && res.data) {
        if (Array.isArray(res.data) && res.data.length > 0) {
          state.paymentPlan = res.data[0];
          console.info("订单支付计划：", state.paymentPlan);
        } else {
          state.paymentPlan = {};
        }
      } else {
        state.paymentPlan = {};
      }
    })
    .catch(() => {
      state.paymentPlan = {};
    });
};

const getattachfiles = () => {
  // 获取合同文件和结项证明文件
  request
    .post("/getorderattachfiles", { orderid: state.orderInfoForm.id })
    .then((res) => {
      if (res && res.retcode === "200" && res.data) {
        // 遍历res.data.data数组，如果当前对象的doctype = "ORDER_CONTRACT_FILE",state.orderInfoForm.contractfile = 对象的filename，state.orderInfoForm.finishfiles = []
        res.data.forEach((item) => {
          if (item.doctype === "ORDER_CONTRACT_FILE") {
            state.orderInfoForm.contractfile = item.filename;
            state.contractFileList = [];
            state.contractFileList.push({
              name: item.filename,
              url: item.uuidname,
            });
          } else if (item.doctype === "ORDER_COMPLETE_FILE") {
            state.orderInfoForm.finishfiles = item.filename;
            state.finishFileList = [];
            state.finishFileList.push({
              name: item.filename,
              url: item.uuidname,
            });
          }
        });
      }
    });
};

const showstatus = (status) => {
  if (status === 0) return "待主管审核";
  else if (status === 1) return "待签约";
  else if (status === 2) return "服务中";
  else if (status === 3) return "已结项";
  else if (status === 4) return "主管审批通过";
  else if (status === -1) return "用户取消订单";
  else if (status === -2) return "审核未通过";
  else if (status === -3) return "后台终止";
  else if (status === -4) return "主管审批拒绝";
  else return "未知状态";
};

// 清除企业信息窗体数据
const resetOrderForm = () => {
  state.orderInfoForm.id = "";
  state.orderInfoForm.producttitle = "";
  state.orderInfoForm.bcompanyid = "";
  state.orderInfoForm.categoryaid = "";
  state.orderInfoForm.categorybid = "";
  state.orderInfoForm.pricetype = "";
  state.orderInfoForm.originalprice = "";
  state.orderInfoForm.pricefactor = "";
  state.orderInfoForm.detail = "";
  state.orderInfoForm.extrainfo = "";
  state.orderInfoForm.imagelist = [];
  state.orderInfoForm.imagelistreal = [];
  state.orderInfoForm.packageprice = [];
  state.supplierInfo = {
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  };
  state.orderContentList = [];
  state.orderActionList = [];
  state.contractFileList = [];
  state.finishFileList = [];
  state.orderInfoForm.creditcode = "";
};

const resetFileUploadDialogForm = () => {
  state.uploadFileList = "";
};

// 分页切换
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getOrders();
};

// 获取订单列表
const getOrders = () => {
  request.post("/getborders", state.getInfoParams).then((res) => {
    if (res) {
      state.orderList = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error("获取订单数据失败！");
    }
  });
};

// 当合同金额变化时
const handleContractPriceChange = (newValue) => {
  if (state.orderInfoForm.categoryaid === 0) {
    let payload = {};
    request
      .post("getestimatedpaymentplanbyorderidandcontractprice", {
        orderid: state.orderInfoForm.id,
        contractprice: newValue,
      })
      .then((res) => {
        console.info("获取支付计划接口返回：", res);
        if (res && res.retcode === "200" && res.data) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            state.paymentPlan = res.data[0];
            console.info("订单支付计划：", state.paymentPlan);
          } else {
            state.paymentPlan = {};
          }
        } else {
          state.paymentPlan = {};
        }
      })
      .catch(() => {
        state.paymentPlan = {};
      });
  }
};

// 组件挂载时加载数据
onMounted(() => {
  state.getInfoParams.bcompanyid = store.state.userinfo.bcompanyid;
  setTimeout(() => {
    getOrders();
  }, 200);
  getCategories();
});
</script>

<style lang="scss" scoped>
// 基础布局优化
.fagai-dynamic-container {
  padding: 20px;
  background-color: #f9f9f9;
  height: calc(100vh - 60px);
  box-sizing: border-box;
  overflow: hidden;
}

.page-card {
  border-radius: 8px;
  height: 100%;
}

:deep(.page-card .el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 20px;
}

// 搜索区域美化
.search-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}

// 第一行：输入框（4个均分占满一行）
.search-row:first-child {
  .search-item {
    flex: 1;
    min-width: 0;
  }
}

// 第二行：筛选器和按钮
.search-row:nth-child(2) {
  .search-item {
    flex: 1;
    min-width: 150px;
  }

  .search-date-picker {
    width: 180px;
    flex-shrink: 0;
  }
}

.search-item {
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
  }
}

.search-date-picker :deep(.el-date-editor) {
  width: 100% !important;
}

.search-checkbox {
  white-space: nowrap;
  margin-right: 5px;
  flex-shrink: 0;
}

.search-btn {
  height: 32px;
  padding: 0 20px;
  flex-shrink: 0;

  &:last-child {
    margin-left: auto;
  }
}

.full-table {
  flex: 1;
  min-height: 0;
  --el-table-row-hover-bg-color: #f8f9fa;
}

.price-text {
  color: #e6a23c;
  font-weight: 500;
}

// 分页区域
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 15px 0 0 0;
  flex-shrink: 0;
  margin-top: 15px;
}

// 详情弹窗美化
.order-detail-dialog {
  .dialog-header {
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;

    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      .contract-id-tag {
        font-size: 14px;
        color: #666;
        font-weight: normal;
        background: #f5f7fa;
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 10px;
      }
    }
  }

  .dialog-scrollbar {
    --el-scrollbar-background-color: transparent;
  }

  .detail-form {
    padding: 0 10px;
  }

  // 表单区域样式
  .form-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
        font-weight: 600;
      }
    }

    .section-subheader {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 15px 0;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width-item {
      grid-column: 1 / -1;
    }

    .disabled-input {
      background-color: #f8f9fa;
      color: #666;
    }

    .tips {
      margin-top: 5px;
      font-size: 12px;
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .form-line {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }

  // 订单内容样式
  .order-content-section {
    margin-top: 20px;

    .order-content-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      border: 1px solid #eee;

      .item-title {
        font-weight: 500;
        color: #333;
      }
    }

    .image-form-item {
      grid-column: 1 / -1;
    }

    .image-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 5px;
    }

    .preview-img {
      width: 100px;
      height: 80px;
      object-fit: cover;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid #eee;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .img-placeholder {
      width: 100px;
      height: 80px;
      border: 1px dashed #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 12px;
      border-radius: 4px;
      gap: 4px;
    }
  }

  .order-pay-plan {
    margin-top: 20px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  // 文件上传区域样式
  .file-form-item {
    display: flex;
    flex-direction: column;
  }

  .file-upload-wrapper {
    margin-top: 5px;
  }

  .upload-component {
    width: 100%;
  }

  .file-link-wrapper {
    display: flex;
    align-items: center;
  }

  .file-link-btn {
    padding: 0;
    height: auto;
    color: #409eff;

    &:hover {
      color: #66b1ff;
    }
  }

  .no-file-tip {
    color: #999;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
  }

  .terminate-textarea {
    resize: vertical;
  }
}

// 弹窗底部按钮区域
.dialog-footer-wrapper {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 10px 0;

  .el-button {
    min-width: 100px;
  }
}

// 图片预览弹窗
.dialog-preview {
  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    max-height: 80vh;
    padding: 10px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr !important;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .search-select,
  .search-date-picker,
  .search-btn {
    width: 100% !important;
  }

  .search-date-picker :deep(.el-date-editor) {
    width: 100% !important;
  }
}

.read-only-input :deep(.el-input__wrapper) {
  background: #f8f9fa; /* 浅背景，而非禁用的灰色 */
  border-color: #e4e7ed; /* 弱化边框 */
  cursor: text; /* 鼠标样式更友好 */
}

.read-only-input :deep(.el-input__inner) {
  color: #303133; /* 保持正常文本色，而非禁用的浅灰色 */
  background: transparent;
}
</style>
