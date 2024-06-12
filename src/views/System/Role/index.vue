<template>
  <div class="role-container">
    <!--
        思路：tab切换类交互的实现通用思路
         1. 点击谁就把谁的index值记录下来(需要一个独一无二的标识就可以 id)
         2. 通过动态控制class类名 active  :class="{active: index === 当前项的下标值}"
       -->
    <div class="left-wrapper">
      <div
        v-for="(item, index) in roleList"
        :key="item.roleId"
        class="role-item"
        :class="{ active: index === activeIndex }"
        @click="changeRole(index)"
      >
        <div class="role-info">
          <!--
            是一个组件 而且还是一个全局组件
            1. 传入不同的iconClass就会显示不同的图标
            2. 图标名来自于icons文件夹下的svg文件夹下的所有可选图标的名称

            目标：根据当前谁被激活 显示激活的图标
            未激活 user 激活的图标 user-active
           -->
          <svg-icon :icon-class="index === activeIndex ? 'user-active' : 'user'" class="icon" />
          {{ item.roleName }}
        </div>
        <div class="more">
          <el-dropdown>
            <span class="el-dropdown-link">
              <svg-icon icon-class="more" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item @click.native="$router.push(`/roleAdd?id=${item.roleId}`)">编辑角色</el-dropdown-item> -->
              <el-dropdown-item @click.native="goEdit(item.roleId)">编辑角色</el-dropdown-item>
              <el-dropdown-item @click.native="delRole(item.roleId)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <el-button class="addBtn" size="mini" @click="$router.push('/roleAdd')">添加角色</el-button>
    </div>
    <div class="right-wrapper">
      <el-tabs v-model="activeName">
        <el-tab-pane label="功能权限" name="first">
          <div class="tree-wrapper">
            <div v-for="item in treeList" :key="item.id" class="tree-item">
              <div class="tree-title"> {{ item.title }} </div>
              <el-tree
                ref="tree"
                :data="item.children"
                :props="{ label: 'title' }"
                :show-checkbox="true"
                node-key="id"
                :default-expand-all="true"
              />
            </div>
          </div>
        </el-tab-pane>
        <!-- 模版渲染 -->
        <el-tab-pane :label="`成员(${roleUserList.length})`" name="user">
          <div class="user-wrapper">
            <el-table
              :data="roleUserList"
              style="width: 100%"
            >
              <el-table-column
                type="index"
                width="250"
                label="序号"
              />
              <el-table-column
                prop="name"
                label="员工姓名"
              />
              <el-table-column
                prop="userName"
                label="登录账号"
              />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { getRoleListAPI, getTreeListAPI, getRoleDetailAPI, getRoleUserAPI, delRoleUserAPI } from '@/api/system'

// 递归添加disabled属性
// 重复的执行同一个函数 目的是为针对于每一层中的每一个对象都执行相同的逻辑
// 相同的逻辑：遍历数组 给每一项都添加一个属性disable
// 判断：递归的结束条件 必须有子集数组 才去调用这个函数
function addDisabled(treeList) {
  treeList.forEach(item => {
    item.disabled = true
    if (item.children) {
      addDisabled(item.children)
    }
  })
}
export default {
  name: 'Role',
  data() {
    return {
      roleList: [],
      activeIndex: 0,
      treeList: [], // 权限树形列表
      perms: [], // 当前角色权限点列表
      activeName: 'first', // 默认打开tree  first
      roleUserList: [] // 当前角色下的成员列表
    }
  },
  // 生命周期里先以第一项roleId获取
  async mounted() {
    // 先获取角色列表和可选权限列表
    await this.getRoleList()
    await this.getTreeList()
    // 再获取当前角色下的权限列表
    this.getRoleDetail(this.roleList[0].roleId)
    this.getRoleUserList(this.roleList[0].roleId)
  },
  methods: {
    async getRoleList() {
      const res = await getRoleListAPI()
      this.roleList = res.data
    },
    goEdit(roleId) {
      console.log('去编辑')
      this.$router.push({
        path: '/roleAdd',
        query: {
          roleId
        }
      })
    },
    delRole(roleId) {
      this.$confirm('是否确认删除当前角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await delRoleUserAPI(roleId)
        this.getRoleList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    // 切换角色
    changeRole(idx) {
      this.activeIndex = idx
      // 获取当前角色下的权限点数据列表
      const roleId = this.roleList[idx].roleId
      // 获取当前角色下的权限点数据列表
      this.getRoleDetail(roleId)
      // console.log(roleId)
      // console.log(this.roleList)
      // 2. 获取当前角色下的成员数据列表
      this.getRoleUserList(roleId)
    },
    // 获取tree数据
    async getTreeList() {
      const res = await getTreeListAPI()
      this.treeList = res.data
      // 禁用
      // 目标：treeList里面的每一项以及嵌套的子项都添加一个disabled = true
      addDisabled(this.treeList)
    },
    // 封装请求方法
    async getRoleDetail(roleId) {
      const res = await getRoleDetailAPI(roleId)
      this.perms = res.data.perms
      // console.log(this.perms);
      // 高亮权限列表
      const treeComponentList = this.$refs.tree
      // console.log(treeComponentList);
      // 调用setCheckedKeys方法
      treeComponentList.forEach((tree, index) => {
        // console.log(this.perms[index]);
        tree.setCheckedKeys(this.perms[index])
      })
    },
    // 封装获取当前角色下的成员的方法
    async getRoleUserList(roleId) {
      const res = await getRoleUserAPI(roleId)
      this.roleUserList = res.data.rows
    }
  }
}
</script>

<style scoped lang="scss">
.role-container {
  display: flex;
  font-size: 14px;
  background-color: #fff;
  padding: 20px;

  .left-wrapper {
    width: 200px;
    border-right: 1px solid #e4e7ec;
    padding: 4px;
    text-align: center;

    .role-item {
      position: relative;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      cursor: pointer;

      &.active {
        background: #edf5ff;
        color: #4770ff;
      }
    }

    .role-info {
      display: flex;
      align-items: center;

      .icon {
        margin-right: 10px;
      }
    }

    .more {
      display: flex;
      align-items: center;
    }

    .addBtn {
      width: 100%;
      margin-top: 20px;
    }
  }

  .right-wrapper {
    flex: 1;

    .tree-wrapper {
      display: flex;
      justify-content: space-between;

      .tree-item {
        flex: 1;
        border-right: 1px solid #e4e7ec;
        padding: 0px 4px;
        text-align: center;

        .tree-title {
          background: #f5f7fa;
          text-align: center;
          padding: 10px 0;
          margin-bottom: 12px;
        }
      }
    }

    ::v-deep .el-tabs__nav-wrap {
      padding-left: 20px;
    }

    .user-wrapper {
      padding: 20px;
    }
  }
}
</style>
