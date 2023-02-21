<template>
   <div class="users-wrapper">
      <div class="btn-wrapper">
         <div class="btn" v-on:click="onClickAddTask">+ Add task</div>
         <el-dropdown @command="(id) => store.commit('addUserToActiveProject', id)" trigger="click">
            <div class="btn el-dropdown-link">+ Add colleague</div>
            <el-dropdown-menu slot="dropdown" class="users-popper">
               <el-dropdown-item
                  :command="user.id"
                  class="subtask-select-item user-select-item"
                  :class="{ active: user.active }"
                  v-for="user in getAllUsers"
               >
                  <img :src="user.img" />
                  <div>{{ user.name }}</div>
                  <div class="email">{{ user.email }}</div>
               </el-dropdown-item>
            </el-dropdown-menu>
         </el-dropdown>
      </div>
      <div class="users">
         <div :style="{ gridRow: `span ${user.noOfRows}` }" class="user" v-for="user in getUsers">
            <div class="user-body">
               <img :src="user.img" :style="{ visibility: user.id === '-1' ? 'hidden' : '' }" />
               <div>{{ user.name }}</div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">
import store from "@/store";
import { getMonthListBetweenDates, getLinePath, getTrianglePoints, getMousePos } from "@/utils/helpers";
import Vue from "vue";
import { MyStore } from "..";

export default Vue.extend({
   name: "UsersList",

   data() {
      return { size: 10 };
   },

   methods: {
      onClickAddTask() {
         this.store.commit("addNewTask", undefined);
      },
   },
   computed: {
      getAllUsers() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         return this.store.state.allUsers.map((x) => ({
            ...x,
            active: Boolean(activeProject.users.find((u) => u.id === x.id)),
         }));
      },
      getUsers() {
         const users = this.store.getters.getActiveProject.users as IUser[];
         return users.map((x, i) => {
            const startRow = users.slice(0, i).reduce((ac, a) => ac + a.noOfRows, 0);
            return { ...x, startRow, endRow: startRow + x.noOfRows };
         });
      },
   },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.users-wrapper {
   background-color: #eeebe3;
   display: grid;
   grid-template-rows: min-content auto;
   .btn-wrapper {
      height: calc(56px + 24px);
      display: flex;
      gap: 1.125rem;
      justify-content: center;
      padding-left: 1.25rem;
      padding-right: 0rem;
      align-items: center;
      .btn {
         padding: 0.75rem 0.5rem;
         font-size: 0.9rem;
         border: 1px solid #347362;
         border-radius: 10px;
         color: #0f393b;
         cursor: pointer;
         height: fit-content;
         transition: all 0.2s ease-in-out;
         &:hover {
            color: white;
            background-color: #347362;
         }
      }
   }

   .users {
      display: grid;
      align-items: center;
      grid-auto-rows: 55px;
      border-top: 1px solid #ced9d2;
      border-right: 1px solid #ced9d2;
      /* height: 100%; */
      padding-top: 1px;
   }
   .user {
      height: 100%;
      border-bottom: 1px solid #ced9d2;
      &:last-child {
         border-bottom: none;
      }
      .user-body {
         display: flex;
         align-items: center;
         height: 55px;
         gap: 10px;
         padding: 1.25rem 0.3rem;
      }
      div {
         font-family: Goldplay;
         font-style: normal;
         font-weight: 500;
         font-size: 18px;
         line-height: 100%;
         color: #0f393b;
      }
      img {
         height: 45px;
         aspect-ratio: 1;
         object-fit: cover;
         border-radius: 100%;
      }
   }
}
</style>
