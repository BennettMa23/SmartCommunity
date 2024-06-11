<script>
import { getEnterpriseListAPI } from '@/api/enterprise'
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
      total: 0
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
      this.exterpriseList = res.data.rows
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
      <el-table style="width: 100%" :data="exterpriseList">
        <el-table-column type="index" label="序号" />
        <el-table-column label="企业名称" width="320" prop="name" />
        <el-table-column label="联系人" prop="contact" />
        <el-table-column label="联系电话" prop="contactNumber" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="mini" type="text">添加合同</el-button>
            <el-button size="mini" type="text">查看</el-button>
            <el-button size="mini" type="text">编辑</el-button>
            <el-button size="mini" type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-pagination
        layout="total, prev, pager, next"
        :total="total"
        :page-size="params.pageSize"
        @current-change="pageChange"
      />
    </div>
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
