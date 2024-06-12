<script>
import { getEnterpriseListAPI, delEnterpriseAPI, getRentBuildListAPI, uploadAPI,
  createRentAPI, getRentListAPI, outRentAPI } from '@/api/enterprise'
export default {
  name: 'Building',
  data() {
    return {
      exterpriseList: [],
      params: {
        page: 1,
        pageSize: 3,
        name: '' // 增加字段name
      },
      total: 0,
      rentDialogVisible: false,
      buildingList: [],
      rentForm: {
        buildingId: null, // 楼宇id
        contractId: null, // 合同id
        contractUrl: '', // 合同Url
        enterpriseId: null, // 企业名称
        type: 0, // 合同类型
        rentTime: [] // 合同时间
      },
      rentRules: {
        buildingId: [
          { required: true, message: '请选择楼宇', trigger: 'change' }
        ],
        rentTime: [
          { required: true, message: '请选择租赁日期', trigger: 'change' }
        ],
        contractId: [
          { required: true, message: '请上传合同文件' }
        ]
      }
    }
  },
  mounted() {
    this.getExterpriseList()
    // 在mounted里面加监听，实时获取是否点击enter
    window.addEventListener('keydown', this.keyDown)
  },
  destroyed() {
    // 销毁事件
    window.removeEventListener('keydown', this.keyDown, false)
    console.log('销毁事件')
  },
  methods: {
    async getExterpriseList() {
      const res = await getEnterpriseListAPI(this.params)
      this.exterpriseList = res.data.rows.map((item) => {
        return {
          ...item,
          rentList: [] // 每一行补充存放合同的列表
        }
      })
      this.total = res.data.total
    },
    pageChange(page) {
      // 更改参数
      this.params.page = page
      // 重新获取数据渲染
      this.getExterpriseList()
    },
    // 准备查询后调方法
    doSearch() {
      this.params.page = 1
      this.getExterpriseList()
    },
    // 点击回车键登录
    keyDown(e) {
      // 回车则执行登录方法 enter键的ASCII是13

      // eslint-disable-next-line eqeqeq
      if (e.key == 'Enter') {
        // console.log(e)
        this.doSearch() // 定义的登录方法
        e.preventDefault() // 去掉默认的换行
        // console.log(e)
      }
    },
    editRent(id) {
      this.$router.push({
        path: '/exterpriseAdd',
        query: {
          id
        }
      })
    },
    queryRent(id) {
      this.$router.push({
        path: '/exterpriseDetail',
        query: {
          id
        }
      })
    },
    delEnterprise(id) {
      this.$confirm('确认删除该企业吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await delEnterpriseAPI(id)
        this.getExterpriseList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    // 关闭弹框
    closeDialog() {
      this.rentDialogVisible = false
    },
    // 打开弹框
    async addRent(rid) {
      console.log(rid)
      this.rentDialogVisible = true
      // 把企业id存入表单对象
      this.rentForm.enterpriseId = rid
      // 获取楼宇下拉列表
      const res = await getRentBuildListAPI()
      this.buildingList = res.data
    },
    // 上传合同
    async uploadHandle(fileData) {
      // 1. 处理FormData
      const { file } = fileData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'contract')
      console.log(formData)
      // 2. 上传并赋值
      const res = await uploadAPI(formData)
      const { id, url } = res.data
      this.rentForm.contractId = id
      this.rentForm.contractUrl = url
      // 单独校验表单
      // this.$refs.addForm.validate('contractId')
    },
    // 确认提交
    confirmAdd() {
      this.$refs.addForm.validate(async valid => {
        // if (valid) {
        //   const { buildingId, contractId, contractUrl, enterpriseId, type } = this.rentForm
        //   await createRentAPI({
        //     buildingId, contractId, contractUrl, enterpriseId, type,
        //     startTime: this.rentForm.rentTime[0],
        //     endTime: this.rentForm.rentTime[1]
        //   })
        //   // 更新列表
        //   this.getExterpriseList()
        //   // 关闭弹框
        //   this.rentDialogVisible = false
        // }
        if (valid) {
          // TODO API
          // 2. 调用接口
          // 处理参数
          const { buildingId, contractId, contractUrl, type, enterpriseId } = this.rentForm
          const reqData = {
            buildingId, contractId, contractUrl, type, enterpriseId,
            startTime: this.rentForm.rentTime[0],
            endTime: this.rentForm.rentTime[1]
          }
          createRentAPI(reqData)
          // 1. 弹框关闭
          this.dialogVisible = false
          // 2. 重置一下数据( resetFileds + 手动清除)
          this.$refs.addForm.resetFields()
          this.rentForm = {
            buildingId: null, // 楼宇id
            contractId: null, // 合同id
            contractUrl: '', // 合同Url
            enterpriseId: null, // 企业名称
            type: 0, // 合同类型
            rentTime: [] // 合同时间
          }
          this.$refs.uploadRef.clearFiles()
          // 3. 重新拉取一下列表
        }
      })
    },
    // 格式化tag类型
    formatInfoType(status) {
      const MAP = {
        0: 'warning',
        1: 'success',
        2: 'info',
        3: 'danger'
      }
      // return 格式化之后的中文显示
      return MAP[status]
    },
    // 格式化status
    formatStatus(type) {
      const TYPEMAP = {
        0: '待生效',
        1: '生效中',
        2: '已到期',
        3: '已退租'
      }
      return TYPEMAP[type]
    },
    // 3. 只有展开时获取数据并绑定
    async expandHandle(row, rows) {
      console.log('展开或关闭', row, rows)
      const isExpend = rows.find(item => item.id === row.id)
      if (isExpend) {
        const res = await getRentListAPI(row.id)
        // eslint-disable-next-line require-atomic-updates
        row.rentList = res.data
      }
    },
    outRent(rentId) {
      this.$confirm('确认退租吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        distinguishCancelAndClose: true,
        type: 'warning'
      }).then(async() => {
        // 1. 调用接口
        await outRentAPI(rentId)
        // 2. 重新拉取列表
        this.getEnterpriseListAPI()
        this.$message({
          type: 'success',
          message: '退租成功!'
        })
        // // 重新获取数据渲染
        // this.expandHandle()
        // return
      }).catch(act => {
        if (act === 'cancel') {
          this.$message({ type: 'info', message: '取消退租' })
        }
      })
    }
  }
}
</script>

<template>
  <div class="building-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-label">企业名称：</div>
      <el-input v-model="params.name" clearable placeholder="请输入内容" class="search-main" />
      <el-button type="primary" @click="doSearch" @keyup.enter="keyDown(e)">查询</el-button>
    </div>
    <div class="create-container">
      <!-- <el-button type="primary" size="mini">添加企业</el-button> -->
      <el-button type="primary" size="mini" @click="$router.push('/exterpriseAdd')">添加企业</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="table">
      <el-table style="width: 100%" :data="exterpriseList" @expand-change="expandHandle">
        <el-table-column type="expand">
          <template #default="{row}">
            <el-table :data="row.rentList" style="width: 80%; float: right">
              <el-table-column label="租赁楼宇" width="200" prop="buildingName" />
              <el-table-column label="租赁起始时间" width="200" prop="startTime" />
              <el-table-column label="合同状态">
                <template #default="scope">
                  <!--
                    差值表达式支持函数调用吗？支持
                    调用一个函数的时候 差值表达式的位置渲染的是什么？ 函数执行之后的返回值
                   -->
                  <el-tag :type="formatInfoType(scope.row.status)">
                    {{ formatStatus(scope.row.status) }}
                  </el-tag>
                  <!-- <el-button size="mini" type="text">续租</el-button>
                  <el-button size="mini" type="text">退租</el-button>
                  <el-button size="mini" type="text">删除</el-button> -->
                </template>
              </el-table-column>
              <!--
                  退租：如果当前是退租的状态 禁用  如果不是退租的状态 启用
                  删除：只有已退租的时候 删除才是启用的 否则就是禁用的
                 -->
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="scope">
                  <el-button size="mini" type="text" :disabled="scope.row.status === 3" @click="outRent(scope.row.id)">退租</el-button>
                  <el-button size="mini" type="text" :disabled="scope.row.status !== 3">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column type="index" label="序号" />
        <el-table-column label="企业名称" width="320" prop="name" />
        <el-table-column label="联系人" prop="contact" />
        <el-table-column label="联系电话" prop="contactNumber" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="mini" type="text" @click="addRent(scope.row.id)">添加合同</el-button>
            <el-button size="mini" type="text" @click="queryRent(scope.row.id)">查看</el-button>
            <el-button size="mini" type="text" @click="editRent(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="text" @click="delEnterprise(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--
        分页 页数位于子组件内部 父组件如果想要用 子传父去获取 @current-change='pageChange'
        清除 叉号位于子组件中 点击叉号时去通知父组件我现在给你清空了 你去做事儿吧 @clear

        子传父的本质: 子组件通过调用父组件中的某个方法 通知它做个事儿
       -->
    <div>
      <el-pagination
        layout="total, prev, pager, next"
        :total="total"
        :page-size="params.pageSize"
        @current-change="pageChange"
      />
    </div>
    <!-- 添加合同弹框 -->
    <el-dialog
      title="添加合同"
      :visible="rentDialogVisible"
      width="580px"
      @close="closeDialog"
      @open="openDialog"
    >
      <!-- 默认插槽 -->
      <div class="form-container">
        <el-form ref="addForm" :model="rentForm" :rules="rentRules" label-position="top">
          <el-form-item label="租赁楼宇" prop="buildingId">
            <el-select v-model="rentForm.buildingId" placeholder="请选择">
              <el-option
                v-for="item in buildingList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="租赁起止日期" prop="rentTime">
            <el-date-picker
              v-model="rentForm.rentTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="租赁合同" prop="contractId">
            <!--
              上传实现流程：
                1. el-upload 打开本地文件 并且校验这个文件是否符合要求 - File
                2. :http-request = 'upload'
                3. 按照接口的要求格式 得到类型为FormData的对象  new FormData()
                4. 按照要求往formData中添加字段数据 fd.append('字段名', '字段值')
                5. 调用上传接口
                6. 拿到返回的文件地址和其他有用的信息id 存入data中的响应式数据的位置 将来提交表单
             -->
            <el-upload
              ref="uploadRef"
              action="#"
              :http-request="uploadHandle"
            >
              <el-button size="small" type="primary" plain>上传合同文件</el-button>
              <div slot="tip" class="el-upload__tip">支持扩展名：.doc .docx .pdf, 文件大小不超过5M</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="rentDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.department-container {
  padding: 10px;
}

.search-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(237, 237, 237, .9);
  ;
  padding-bottom: 20px;

  .search-label {
    width: 100px;
  }

  .search-main {
    width: 220px;
    margin-right: 10px;
  }
}
.create-container{
  margin: 10px 0px;
}
.page-container{
  padding:4px 0px;
  text-align: right;
}
.form-container{
  padding:0px 80px;
}
</style>
