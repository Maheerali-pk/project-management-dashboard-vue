<template>
   <div id="app">
      <SubHeader></SubHeader>
      <Calendar></Calendar>
      <TaskDetails></TaskDetails>
      <div class="filters">
         <div @click="store.commit('scrollToToday', undefined)">Today</div>
      </div>
   </div>
</template>

<script lang="ts">
import Vue from "vue";
import Calendar from "./components/Calendar.vue";
import SubHeader from "./components/SubHeader.vue";
import TaskDetails from "./components/TaskDetails.vue";
export default Vue.extend({
   name: "App",
   components: {
      Calendar,
      SubHeader,
      TaskDetails,
   },
   data() {
      return { showTaskDetails: this.store.state.showTaskDetails, dialogVisible: false };
   },
   computed: {
      getTaskDetailsStatus() {
         return this.store.state.showTaskDetails;
      },
   },
});
</script>

<style scoped lang="scss">
.filters {
   display: flex;
   color: #0f393b;
   position: absolute;
   right: 60px;
   top: calc(110px);
   gap: 20px;
   font-family: "Goldplay-Medium";
   cursor: pointer;
}
#app {
   position: relative;
   display: grid;
   grid-template-rows: min-content auto;
}
</style>

<style lang="scss">
.datepicker-input {
   background-color: transparent;
   outline: none;
   border: none;
   font-family: "Goldplay-Bold";
   font-size: 18px;
   width: fit-content;
}

.vc-container {
   background: #f5f3ee !important;
   .vc-title {
      text-transform: uppercase;
      font-size: 14px !important;
      color: #0f393b !important;
      opacity: 0.5 !important;
   }

   .vc-day {
      .vc-highlights {
         .vc-highlight {
            background-color: #e5e8e9 !important;
         }
         & + span {
            color: #0f393b !important;

            &:hover,
            &:focus {
               background-color: transparent !important;
            }
         }
      }
      & > span {
         color: #0f393b;
      }

      &.is-today {
         .vc-highlights {
            .vc-highlight {
               background-color: transparent !important;
               border-radius: 5px !important;
               border: 1px solid #ef8451 !important;
            }
            & + span {
               font-weight: initial;
               color: #ef8451 !important;
               &:hover,
               &:focus {
                  background-color: transparent !important;
               }
            }
         }
      }
   }
   .vc-svg-icon {
      color: #0f393b !important;
      opacity: 0.5 !important;
   }
   .vc-weekday {
      font-family: Goldplay;
      font-size: 14px;
      color: #0f393b;
      opacity: 0.5;
   }
}

.subtask-select-item {
   display: flex;
   img {
      height: 30px;
      width: 30px;
      border-radius: 50%;
      object-fit: cover;
   }
   div {
      color: #0f393b;
   }
   div.email {
      opacity: 0.2;
   }
   gap: 10px;
}
.el-select-dropdown__item {
   padding: 0 10px;
   box-sizing: border-box;
   &.selected,
   &.hover {
      background-color: #f8f7f4 !important;
   }
}
.subtask-popper,
.users-popper {
   min-width: 450px !important;
   background-color: #f5f3ee !important;
   box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
   border-radius: 10px;
   i {
      font-size: 24px;
      color: gray;
      margin: 0px 3px;
   }
}
.users-popper {
   padding: 0 !important;
   border-radius: 4px !important;
   overflow: hidden;
   border: none;
   .user-select-item {
      display: flex;
      align-items: center;
      line-height: initial !important;
      padding: 7px 20px;
      &:hover,
      &.active {
         background-color: #f8f7f4 !important;
         background-color: #0f393b !important;
         div {
            color: white !important;
         }
      }
   }
}
.subtask-popup {
   display: flex;
   gap: 10px;
   align-items: center;
}
.el-popover {
   width: fit-content !important;
   border-radius: 10px;
   border: 1.5px solid #ced9d2;
   /* fdsfs */

   box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
}

.project-dropdown {
   .el-dropdown-link {
      font-family: "Goldplay-Bold";
      cursor: pointer;
      i {
         font-size: 16px;
      }
      font-size: 24px;
      color: #0f393b;
      border: none !important;
      outline: none !important;
   }
}
.project-dropdown-menu {
   min-width: 400px;
   border-radius: 10px !important;
   background: #f5f3ee !important;
   box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
   padding: 0 !important;
   .dropdown-item {
      padding: 0px 20px !important;
      font-size: 20px;
      .item-content {
         width: 100%;
         border-bottom: 1px solid #ced9d2;
         padding: 15px 0;
         display: flex;
         align-items: center;
         width: 100%;
         color: #0f393b;
      }
      &.create-new {
         .item-content {
            opacity: 0.5;
            border-bottom: none;
         }
      }
      &.active {
         background-color: #ced9d2;
         font-family: "Goldplay-Bold";
         .item-content {
            justify-content: space-between;
         }
      }
      &:hover {
         background-color: #ced9d2 !important;
      }
   }
}
.project-dialog {
   background: #f5f3ee !important;
   box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05) !important;
   border-radius: 10px !important;
   width: fit-content !important;
   .el-dialog__header {
      border-bottom: 2px solid #ced9d2;
      margin-bottom: 30px;
      font-size: 18px;
      padding-bottom: 10px;
      font-family: "Goldplay-Bold";
   }
   .el-dialog__body,
   .el-dialog__footer,
   .el-dialog__header {
      padding: 0px !important;
   }
   .el-dialog__body {
      padding-bottom: 30px !important;
   }
   padding: 30px;
   input {
      background-color: transparent;
      padding: 13px 20px;
      color: #0f393b;
      font-size: 24px;
      border: 1px solid #ced9d2;
      outline: none;
      border-radius: 10px;
   }
   .btn-save {
      color: white;
      background: #347362;
      border-radius: 10px;
      padding: 13px 30px;
      cursor: pointer;
   }
   .btn-cancel {
      color: #347362;
      font-size: 18px;
      font-family: "Goldplay-Semibold";
      cursor: pointer;
   }

   .el-dialog__footer {
      display: flex;
      justify-content: flex-end;
      .dialog-footer {
         display: flex;
         gap: 20px;
         align-items: center;
      }
   }
}
.el-input {
   height: fit-content;
}
.deps-menu {
   background-color: #f5f3ee !important;
   .el-dropdown-menu__item.active {
   }

   .el-dropdown-menu__item {
      &.active,
      &:hover {
         background-color: #ced9d2 !important;
         color: #0f393b !important;
      }
   }
}
</style>

<style>
@font-face {
   font-family: "Goldplay";
   src: local("Goldplay"), url("./fonts/Goldplay\ Regular.otf") format("opentype");
}
@font-face {
   font-family: "Goldplay-Medium";
   src: local("Goldplay-Medium"), url("./fonts/Goldplay\ Medium.otf") format("opentype");
}

@font-face {
   font-family: "Goldplay-Semibold";
   src: local("Goldplay-Semibold"), url("./fonts/Goldplay\ SemiBold.otf") format("opentype");
}
@font-face {
   font-family: "Goldplay-Bold";
   src: local("Goldplay-Bold"), url("./fonts/Goldplay\ Bold.otf") format("opentype");
}
body,
::placeholder {
   font-family: Goldplay;
   color: #0f393b;
}
body {
   background-color: #eeebe3;
}
html,
body,
#app {
   height: 100%;
}
#sub-app {
   height: 90%;
}
* {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
   -moz-box-sizing: border-box;
   -ms-box-sizing: border-box;
   -webkit-box-sizing: border-box;
   -webkit-user-drag: none;
}
*::after,
*::before {
   box-sizing: border-box;
   -moz-box-sizing: border-box;
   -ms-box-sizing: border-box;
   -webkit-box-sizing: border-box;
}
.btn {
   padding: 0.75rem 0.5rem;
   font-size: 0.9rem;
   border: 1px solid #347362;
   border-radius: 10px;
   color: #0f393b;
   cursor: pointer;
   height: fit-content;
}
.light-text {
   color: #0f393b;
   opacity: 0.5;
}
.popper__arrow::after {
   border-top-color: #f5f3ee !important;
   border-bottom-color: #f5f3ee !important;
}
.el-popover.el-popper {
   background: #f5f3ee;
}
.el-input__inner {
   background-color: transparent !important;
   color: #0f393b81 !important;
   border: 1px solid #0f393b81 !important;
   border-radius: 10px !important;
   outline: none;
}
</style>
