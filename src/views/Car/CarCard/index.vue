<script>
import { getCardListAPI, delCardAPI, delCardListAPI } from '@/api/card'

export default {
  data() {
    return {
      // 请求参数
      params: {
        page: 1,
        pageSize: 5,
        carNumber: null,
        personName: null,
        cardStatus: null
      },
      total: 0,
      // 月卡列表
      cardList: [],
      // 月卡状态
      cardStatusList: [
        {
          id: null,
          name: '全部'
        },
        {
          id: 0,
          name: '可用'
        },
        {
          id: 1,
          name: '已过期'
        }
      ],
      // 已选择列表
      selectedCarList: [],
      currentPage1: 5
    }
  },
  mounted() {
    this.getCardList()
  },
  methods: {
    async getCardList() {
      const res = await getCardListAPI(this.params)
      // console.log(this.params)
      // console.log(res)
      this.cardList = res.data.rows
      this.total = res.data.total
    },
    formatStatus(row) {
      const MAP = {
        0: '可用',
        1: '已过期'
      }
      return MAP[row.cardStatus]
    },
    currentChange(page) {
      // 把点击的页数赋值给请求参数页数
      this.params.page = page
      // 使用最新的请求参数获取列表数据
      this.getCardList()
    },
    handleSizeChange(pageSize) {
      // 把点击的页数赋值给请求参数页数
      this.params.pageSize = pageSize
      // 使用最新的请求参数获取列表数据
      this.getCardList()
    },
    doSearch() {
      // 调用接口之前把页数参数重置为1
      this.params.page = 1
      this.getCardList()
    },
    editCard(id) {
      console.log(id + '  --- ok')
      this.$router.push({
        path: '/addCard',
        query: {
          id
        }
      })
    },
    // 删除逻辑
    delCard(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // return
        await delCardAPI(id)
        this.getCardList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch((error) => {
        console.log(error)
      })
    },
    handleSelectionChange(rowList) {
      console.log(rowList)
      this.selectedCarList = rowList
    },
    delCartList() {
      this.$confirm('此操作将永久删除选择的月卡, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // 处理id
        // console.log(this.selectedCarList.map(item => item.id))
        await delCardListAPI(this.selectedCarList.map(item => item.id))
        this.getCardList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}

</script>

<template>
  <div class="card-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <span class="search-label">车牌号码：</span>
      <el-input v-model="params.carNumber" clearable placeholder="请输入内容" class="search-main" />
      <span class="search-label">车主姓名：</span>
      <el-input v-model="params.personName" clearable placeholder="请输入内容" class="search-main" />
      <span class="search-label">状态：</span>
      <el-select v-model="params.cardStatus">
        <el-option
          v-for="item in cardStatusList"
          :key="item.id"
          :value="item.id"
          :label="item.name"
        />
      </el-select>
      <el-button type="primary" class="search-btn" @click="doSearch">查询</el-button>
    </div>
    <!-- 新增删除操作区域 -->
    <div class="create-container">
      <!-- <el-button type="primary" @click="$router.push('/cardAdd')">添加月卡</el-button> -->
      <el-button style="padding: 7px 15px;" type="primary" @click="$router.push('/addCard')">添加月卡</el-button>
      <!-- <el-button style="padding: 7px 15px" @click="delCartList(handleSelectionChange)">批量删除</el-button> -->
      <el-button style="padding: 7px 15px" @click="delCartList">批量删除</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="table">
      <el-table style="width: 100%" :data="cardList" @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="45"
        />
        <el-table-column type="index" label="序号" />
        <el-table-column label="车主名称" prop="personName" />
        <el-table-column label="联系方式" prop="phoneNumber" />
        <el-table-column label="车牌号码" prop="carNumber" />
        <el-table-column label="车辆品牌" prop="carBrand" />
        <el-table-column label="剩余有效天数" prop="totalEffectiveDate" />
        <el-table-column label="状态" prop="cardStatus" :formatter="formatStatus" />
        <el-table-column label="操作" fixed="right" width="180">
          <!--
            scope 作用域插槽
            scope.row -> 当前行的数据对象

            如果我们只是想使用插槽渲染模版 #default
            如果我们除了想要使用插槽渲染模版 而且还想要拿到它内部的数据 #default="scope" scope类似于函数的形参
            组件内部会把当前行数据对象当成一个实参传到scope的位置

            在内部传递实参的时候 实参的格式长这个样式 所以row是固定的
            {
              row: 当前行的对象数据
            }

            因为本来传下来就是一个对象 所以通过解构赋值的方式去取row参数 #default="{ row }"

           -->
          <template #default="scope">
            <el-button size="mini" type="text">续费</el-button>
            <el-button size="mini" type="text">查看</el-button>
            <el-button size="mini" type="text" @click="editCard(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="text" @click="delCard(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页器 -->
    <!--
      1. 页数分出来 (页数 = 总条数 / 每页条数)
      2. 点击每页的时候获取当前页的数据重新渲染到table上
         1. 通过事件获取到当前点击的是第几页
         2. 以当前拿到的页数作为参数去和后端要数据
         3. 把获取到的当前页的列表数据重新渲染table组件上
    -->
    <div class="page-container">
      <!-- <span class="demonstration">显示总数</span> -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-size="params.pageSize"
        :total="total"
        :page-sizes="[5, 3, 10, 50]"
        @current-change="currentChange"
        @size-change="handleSizeChange"
      />
    </div>
    <!-- 添加楼宇 -->
    <el-dialog title="添加楼宇" width="580px">
      <!-- 表单接口 -->
      <div class="form-container">
        <!-- <el-form ref="addForm" :model="addForm" :rules="addFormRules">
          <el-form-item label="楼宇名称" prop="name">
            <el-input v-model="addForm.name" />
          </el-form-item>
          <el-form-item label="楼宇层数" prop="floors">
            <el-input v-model="addForm.floors" />
          </el-form-item>
          <el-form-item label="在管面积" prop="area">
            <el-input v-model="addForm.area" />
          </el-form-item>
          <el-form-item label="物业费" prop="propertyFeePrice">
            <el-input v-model="addForm.propertyFeePrice" />
          </el-form-item>
        </el-form> -->
      </div>
      <template #footer>
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  padding: 20px;
  background-color: #fff;
}

.search-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(237, 237, 237, .9);
  padding-bottom: 20px;

  .search-main {
    width: 220px;
    margin-right: 10px;
  }

  .search-btn {
    margin-left: 20px;
  }
}

.create-container {
  margin: 10px 0px;
}
// .create-container > div {
//   /* 选择 .parent-class 内的所有直接子 <div> 元素 */
//   padding: 8px 15px;
// }
// .parent-class div:first-child {
//   /* 选择 .parent-class 内的第一个 <div> 元素 */
// }
// .parent-class p:last-child {
//   /* 选择 .parent-class 内的最后一个 <p> 元素 */
// }
// .create-container-yue {
//   padding: 10px 20px;
// }

.page-container {
  padding: 4px 0px;
  text-align: right;
}

.form-container {
  padding: 0px 80px;
}
</style>
