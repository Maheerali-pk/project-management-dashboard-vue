<template>
   <div :class="{ opened: store.state.showTaskDetails }" class="task-details-wrapper">
      <div class="header" v-if="store.state.showTaskDetails">
         <div
            :class="{ completed: getActiveTask.completed }"
            @click="store.commit('toggleCompleteTask', undefined)"
            class="btn"
         >
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M1 5.61538L6.25 11L16 1" stroke="#0F393B" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
            <span v-if="getActiveTask.completed">Mark it as incomplete</span>
            <span v-else>Mark it as complete</span>
         </div>
         <div class="icons">
            <div class="files">
               <div v-for="file in getActiveTask.fileList" class="btn file">
                  <a :href="file.url" download>
                     {{ file.name }}
                  </a>
                  <i class="el-icon-close" @click.stop="store.commit('removeFile', file.name)"></i>
               </div>
            </div>
            <!-- <el-upload class="upload-demo" :on-remove="handleRemove" multiple :limit="3" :file-list="fileList">
               <el-button size="small" type="primary">Click to upload</el-button>
               <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </el-upload> -->
            <div>
               <label for="file-input">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path
                        d="M6.19141 20C2.83867 20 0.09375 17.2578 0.09375 13.832C0.09375 12.1941 0.731641 10.6539 1.88984 9.49609L10.1242 1.25781C10.9883 0.430859 12.168 0 13.3477 0C16.2812 0 17.9062 2.37773 17.9062 4.51562C17.9062 5.73359 17.4324 6.87812 16.5711 7.73906L9.00859 15.3055C8.44492 15.8695 7.67148 16.1516 6.89805 16.1516C4.52617 16.1516 3.91484 14.0352 3.91484 13.1949C3.91484 12.4305 4.20578 11.6664 4.7875 11.0844L10.35 5.52187C10.564 5.30777 10.8445 5.2007 11.1246 5.2007C11.7098 5.2007 12.2203 5.67219 12.2203 6.2968C12.2203 6.57727 12.1133 6.85773 11.8993 7.0718L6.33676 12.6343C6.18234 12.7887 6.10512 12.9918 6.10512 13.1948C6.10512 13.6523 6.47852 13.9874 6.8977 13.9874C7.1007 13.9874 7.30355 13.91 7.45863 13.7553L15.0211 6.18887C15.468 5.7416 15.7141 5.14707 15.7141 4.51543C15.7141 3.40762 14.8723 2.17051 13.3485 2.17051C12.7352 2.17051 12.1215 2.39422 11.6743 2.84121L3.4375 11.0781C2.69336 11.8227 2.28359 12.8121 2.28359 13.8648C2.28359 15.7113 3.68633 17.7684 6.225 17.7684C7.2457 17.7684 8.26719 17.3965 9.01172 16.6523L15.2422 10.418C15.4562 10.2039 15.7367 10.0968 16.0168 10.0968C16.602 10.0968 17.1125 10.5683 17.1125 11.1929C17.1125 11.4734 17.0055 11.7539 16.7914 11.9679L10.561 18.2023C9.40234 19.3633 7.86328 20 6.19141 20Z"
                        fill="#0F393B"
                     />
                  </svg>
               </label>
               <input
                  @change="(e) => store.commit('changeTaskFile', { id: '', e })"
                  type="file"
                  id="file-input"
                  style="display: none"
               />
            </div>

            <svg
               v-on:click="hideTaskdetails"
               width="21"
               height="22"
               viewBox="0 0 21 22"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path d="M19.5 2L19.5 20" stroke="#0F393B" stroke-width="2.5" stroke-linecap="round" />
               <path
                  d="M0 11.5H15M15 11.5L10.5 7M15 11.5L10.5 16"
                  stroke="#0F393B"
                  stroke-width="2.5"
                  stroke-linejoin="round"
               />
            </svg>
         </div>
      </div>
      <div class="body" v-if="store.state.showTaskDetails">
         <div class="title">
            {{ getActiveTask.text }}
         </div>
         <div class="details-table">
            <div class="details-label">Assignee</div>
            <div class="assignee" v-if="getTaskDetails.user.id !== '-1'">
               <img :src="getTaskDetails.user.img" />
               <div>{{ getTaskDetails.user.name }}</div>
            </div>
            <div class="assignee" v-if="getTaskDetails.user.id === '-1'">None</div>
            <div class="details-label">Date</div>
            <div class="date-wrapper">
               <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                     d="M6.78571 2.875H13.2143V1.07812C13.2143 0.48291 13.692 0 14.2857 0C14.8795 0 15.3571 0.48291 15.3571 1.07812V2.875H17.1429C18.7188 2.875 20 4.16201 20 5.75V20.125C20 21.7107 18.7188 23 17.1429 23H2.85714C1.27902 23 0 21.7107 0 20.125V5.75C0 4.16201 1.27902 2.875 2.85714 2.875H4.64286V1.07812C4.64286 0.48291 5.12054 0 5.71429 0C6.30804 0 6.78571 0.48291 6.78571 1.07812V2.875ZM2.14286 20.125C2.14286 20.5203 2.4625 20.8438 2.85714 20.8438H17.1429C17.5357 20.8438 17.8571 20.5203 17.8571 20.125V8.625H2.14286V20.125Z"
                     fill="#0F393B"
                  />
               </svg>
               <div>
                  From
                  <vc-date-picker
                     @input="onStartDateChange"
                     v-model="getTaskDetails.startDate"
                     :attributes="[{ key: 'today', highlight: 'red', dates: new Date() }]"
                     :min-date="new Date().setMonth(new Date().getMonth() - 3)"
                     :max-date="new Date().setMonth(new Date().getMonth() + 3)"
                  >
                     <template v-slot="{ inputValue, inputEvents, togglePopover }">
                        <b @click.stop="togglePopover">{{ inputValue }}</b>
                     </template>
                  </vc-date-picker>
                  to
                  <vc-date-picker
                     @input="onEndDateChange"
                     v-model="getTaskDetails.endDate"
                     :attributes="[{ key: 'today', highlight: 'red', dates: new Date() }]"
                     :min-date="new Date().setMonth(new Date().getMonth() - 3)"
                     :max-date="new Date().setMonth(new Date().getMonth() + 3)"
                  >
                     <template v-slot="{ inputValue, inputEvents, togglePopover }">
                        <b @click.stop="togglePopover">{{ inputValue }}</b>
                     </template>
                  </vc-date-picker>
               </div>
            </div>
            <div class="details-label">Task name</div>
            <div
               contenteditable="true"
               @blur="(e) => store.commit('updateTaskText', { id: getActiveTask.id, text: e.target.textContent })"
            >
               {{ getActiveTask.text }}
            </div>
            <div class="details-label">Dependencies</div>

            <div class="add-deps">
               <el-dropdown :hide-on-click="true" trigger="click" @command="addLink" placement="bottom-start">
                  <span class="el-dropdown-link">Add Dependencies</span>
                  <el-dropdown-menu class="deps-menu" slot="dropdown">
                     <el-dropdown-item
                        :command="task.id"
                        v-for="task in getTaskList"
                        :class="{ active: Boolean(task.active) }"
                        >{{ task.text }}</el-dropdown-item
                     >
                  </el-dropdown-menu>
               </el-dropdown>
            </div>
         </div>
         <div class="desc-label"><b>Description</b></div>
         <input
            :value="getActiveTask.description || ''"
            v-on:change="changeDescription"
            class="desc"
            placeholder="Add more details to this task..."
         />
      </div>
      <div class="subtasks-wrapper">
         <div class="light-text heading">Subtasks</div>
         <div class="subtasks">
            <div
               v-on:click="toggleSelection(subtask)"
               v-for="subtask in getActiveTask.subtasks"
               class="subtask"
               :class="{ completed: subtask.isCompleted, selected: subtask.selected }"
            >
               <div class="left">
                  <i class="el-icon-close" @click.stop="store.commit('deleteSubtask', subtask.id)"></i>
                  <svg
                     v-on:click="(e) => toggleCompleted(e, subtask)"
                     v-if="subtask.isCompleted"
                     width="25"
                     height="25"
                     viewBox="0 0 25 25"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <circle cx="12.5" cy="12.5" r="12.5" fill="#33B08E" />
                     <path d="M7 12L10.5 15.5L17 9" stroke="#F5F3EE" stroke-width="1.5" stroke-linejoin="round" />
                  </svg>
                  <svg
                     v-if="!subtask.isCompleted"
                     v-on:click="(e) => toggleCompleted(e, subtask)"
                     width="25"
                     height="25"
                     viewBox="0 0 25 25"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <circle cx="12.5" cy="12.5" r="11.75" stroke="#0F393B" stroke-width="1.5" />
                     <path d="M7 12L10.5 15.5L17 9" stroke="#0F393B" stroke-width="1.5" stroke-linejoin="round" />
                  </svg>

                  <input
                     class="subtask-input"
                     v-on:change="(e) => onSubtaskValueChange(e, subtask)"
                     :value="subtask.text"
                  />
               </div>
               <div class="right">
                  <vc-date-picker
                     :attributes="[{ key: 'today', highlight: 'red', dates: new Date() }]"
                     :min-date="new Date().setMonth(new Date().getMonth() - 3)"
                     :max-date="new Date().setMonth(new Date().getMonth() + 3)"
                     @input="(newDate) => onSubtaskDateChange(subtask, newDate)"
                     v-model="subtask.date"
                  >
                     <template v-slot="{ inputValue, inputEvents, togglePopover }">
                        <div @click.stop="togglePopover" style="display: flex; gap: 8px">
                           <span>{{ inputValue }}</span>
                           <svg
                              width="15"
                              height="18"
                              viewBox="0 0 15 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                           >
                              <path
                                 d="M5.08929 2.25H9.91071V0.84375C9.91071 0.37793 10.269 0 10.7143 0C11.1596 0 11.5179 0.37793 11.5179 0.84375V2.25H12.8571C14.0391 2.25 15 3.25723 15 4.5V15.75C15 16.991 14.0391 18 12.8571 18H2.14286C0.959263 18 0 16.991 0 15.75V4.5C0 3.25723 0.959263 2.25 2.14286 2.25H3.48214V0.84375C3.48214 0.37793 3.8404 0 4.28571 0C4.73103 0 5.08929 0.37793 5.08929 0.84375V2.25ZM1.60714 15.75C1.60714 16.0594 1.84687 16.3125 2.14286 16.3125H12.8571C13.1518 16.3125 13.3929 16.0594 13.3929 15.75V6.75H1.60714V15.75Z"
                                 fill="#0F393B"
                              />
                           </svg>
                        </div>
                     </template>
                  </vc-date-picker>
                  <el-popover placement="top" width="200" trigger="click">
                     <div class="subtask-popup">
                        <el-select
                           no-match-text="No user found"
                           popper-class="subtask-popper"
                           placement="bottom/left"
                           v-model="subtask.userId"
                           filterable
                           remote
                           reserve-keyword
                           placeholder="Name or email"
                           :remote-method="remoteMethod"
                           :loading="loading"
                        >
                           <el-option v-for="user in options" :key="user.id" :label="user.name" :value="user.id">
                              <div class="subtask-select-item">
                                 <img v-if="subtask.userId !== user.id" :src="user.img" />
                                 <i v-else class="el-icon-user-solid"></i>
                                 <div>{{ user.name }}</div>
                                 <div class="email">{{ user.email }}</div>
                              </div>
                           </el-option>
                           <div slot="empty">No User found</div>
                        </el-select>
                        <div>or</div>
                        <div class="btn" v-on:click="assignSubTaskToMe(subtask)">Assign to Me</div>
                     </div>

                     <svg
                        v-if="subtask.userId === undefined"
                        @click.stop="(e) => e.stopPropagation()"
                        width="15"
                        height="18"
                        viewBox="0 0 15 18"
                        fill="none"
                        slot="reference"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           d="M9.10714 10.6875H5.89286C2.63839 10.6875 0 13.4578 0 16.875C0 17.4962 0.479799 18 1.07143 18H13.9286C14.5202 18 15 17.4962 15 16.875C15 13.4578 12.3616 10.6875 9.10714 10.6875ZM1.64029 16.3125C1.9048 14.0941 3.70982 12.375 5.89286 12.375H9.10714C11.2888 12.375 13.0949 14.0959 13.3594 16.3125H1.64029ZM7.5 9C9.86685 9 11.7857 6.9852 11.7857 4.5C11.7857 2.0148 9.86685 0 7.5 0C5.13315 0 3.21429 2.0148 3.21429 4.5C3.21429 6.98555 5.13281 9 7.5 9ZM7.5 1.6875C8.9769 1.6875 10.1786 2.94926 10.1786 4.5C10.1786 6.05074 8.9769 7.3125 7.5 7.3125C6.0231 7.3125 4.82143 6.05039 4.82143 4.5C4.82143 2.94926 6.02344 1.6875 7.5 1.6875Z"
                           fill="#0F393B"
                        />
                     </svg>
                     <img
                        slot="reference"
                        @click.stop="(e) => e.stopPropagation()"
                        v-if="subtask.userId"
                        :src="getImageForSubtask(subtask)"
                     />
                  </el-popover>
               </div>
            </div>
         </div>
         <div class="btn" v-on:click="addSubtask">+ Add subtask</div>
      </div>
   </div>
</template>

<script lang="ts">
import store from "@/store";
import {
   getMonthListBetweenDates,
   getLinePath,
   getTrianglePoints,
   getMousePos,
   getCompleteDateList,
} from "@/utils/helpers";
import Vue from "vue";
import { MyStore } from "..";
import DatePicker from "./DatePicker.vue";

export default Vue.extend({
   name: "TaskDetails",
   data() {
      return {
         size: 10,
         loading: false,
         options: this.store.getters.getActiveProject.users.filter((x) => x.id !== "-1"),
         list: this.store.getters.getActiveProject.users.filter((x) => x.id !== "-1"),
         fileList: [],
         dialogImageUrl: "",
         dialogVisible: false,
         disabled: false,
      };
   },
   methods: {
      getImageForSubtask(subtask: ISubTask) {
         const user = store.getters.getActiveProject.users.find((x) => x.id === subtask.userId);
         if (user) {
            return user.img;
         }
      },
      handleRemove(file) {
         console.log(file);
      },
      handlePictureCardPreview(file) {
         this.dialogImageUrl = file.url;
         this.dialogVisible = true;
      },
      handleDownload(file) {
         console.log(file);
      },
      onStartDateChange(date: Date) {
         this.store.commit("updateDateOfSelectedTask", { type: "start", date });
      },
      onEndDateChange(date: Date) {
         this.store.commit("updateDateOfSelectedTask", { type: "end", date });
      },
      addLink(id: string) {
         console.log("Add link called");
         console.log(id);
         const activeProject = this.store.getters.getActiveProject;
         const taskList = this.getTaskList;
         const task = taskList.find((x) => x.id === id);
         if (task?.active) {
            this.store.commit("removeLinkFromSelectedTask", id);
         } else {
            this.store.commit("addLinkToSelectedTask", id);
         }
      },
      changeDescription(e: InputEvent) {
         this.store.commit("addDescriptionToSelectionTask", (e.target as HTMLInputElement).value);
      },
      toggleSelection(subtask: ISubTask) {
         this.store.commit("updateSubTask", { id: subtask.id, selected: !subtask.selected });
      },
      toggleCompleted(e: Event, subtask: ISubTask) {
         e.stopPropagation();
         this.store.commit("updateSubTask", { id: subtask.id, isCompleted: !subtask.isCompleted });
      },
      onSubtaskDateChange(subtask: ISubTask, date: Date) {
         this.store.commit("updateSubTask", { id: subtask.id, date });
      },
      remoteMethod(query) {
         if (query !== "") {
            console.log(query, "Query");
            this.loading = true;
            setTimeout(() => {
               this.loading = false;
               this.options = this.list.filter((item) => {
                  return (
                     item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                     item.email.toLocaleLowerCase().includes(item.email)
                  );
               });
            }, 200);
         } else {
            this.options = [];
         }
      },
      onSubtaskValueChange(e: Event, subTask: ISubTask) {
         const newValue = (e.target as HTMLInputElement).value;
         this.store.commit("updateSubTask", { id: subTask.id, text: newValue });
      },
      addSubtask() {
         this.store.commit("addSubtaskToSelectedTask", undefined);
      },
      assignSubTaskToMe(subTask: ISubTask) {
         this.store.commit("updateSubTask", { id: subTask.id, userId: this.store.state.currentUserId });
      },
      hideTaskdetails() {
         this.store.commit("hideTaskDetails", undefined);
      },
   },
   computed: {
      getActiveProject() {
         return store.getters.getActiveProject;
      },
      getUsers() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         return activeProject.users;
      },
      getTaskList() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         const selectedTask = activeProject.tasks.find((x) => x.selected) as ITask;
         const links = activeProject.links
            .filter((x) => x.task1 === selectedTask.id || x.task2 === selectedTask.id)
            .flatMap((x) => [x.task1, x.task2]);
         return activeProject.tasks
            .filter((x) => x.id !== selectedTask.id)
            .map((x) => ({ ...x, active: links.includes(x.id) }));
      },
      getActiveTask() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         return (this.store.getters.getActiveProject.tasks.find((x) => x.selected) as ITask) || { subtasks: [] };
      },
      getTaskDetails() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         const activeTask = activeProject.tasks.find((x) => x.selected) as ITask;
         const user = activeProject.users.find((x) => x.id === activeTask.userId) as IUser;
         const allDates = getCompleteDateList(activeProject.startDate, activeProject.endDate);
         const startDate = allDates[activeTask.startCol - 1];
         const endDate = allDates[activeTask.endCol - 2];
         return { ...activeProject, user, projectName: activeProject.name, startDate, endDate };
      },
      getTaskDetailsStatus() {
         return this.store.state.showTaskDetails;
      },
   },
   components: {},
});
</script>

<style scoped lang="scss">
.subtasks-wrapper {
   margin-top: 50px;
   .btn {
      width: fit-content;
      margin-top: 10px;
   }
   .subtasks {
      display: flex;
      flex-direction: column;
      border-top: 1px solid #ced9d2;
      .subtask {
         position: relative;
         cursor: pointer;
         display: flex;
         justify-content: space-between;
         width: 100%;
         border-bottom: 1px solid #ced9d2;
         padding: 10px;
         align-items: center;

         .subtask-input {
            background-color: transparent;
            border: none;
            outline: none;
            flex-grow: 1;
            width: 100%;
            font-size: 18px;
            font-family: "Goldplay-Medium";
            color: #0f393b;
         }
         &.completed {
            .left {
               input {
                  color: #0f393b44;
                  opacity: 0.75 !important;
               }
            }
         }
         .right {
            gap: 1rem;
            display: grid;
            grid-template-columns: 150px 30px;
            justify-content: end;
            row-gap: 10px;
            & > span > div {
               justify-content: flex-end;
            }
            img {
               height: 24px;
               width: 24px;
               object-fit: cover;
               border-radius: 50%;
            }
         }
         &.selected {
            background: #ced9d2;
            border-radius: 5px;
         }
         .left {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-grow: 1;
            padding-right: 10px;
         }
         i {
            opacity: 0;
            position: absolute;
            left: 0;
            transform: translate(-110%, 0);
         }
         &:hover {
            i {
               opacity: 1;
               &:hover {
                  color: #ef8451;
               }
            }
         }
      }
   }
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.task-details-wrapper {
   .files {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0px 10px;
      .file {
         display: flex;
         a {
            text-decoration: none;
            color: #347362;
         }
         justify-content: space-between;
         transition: all 0.2s ease-in-out;
         &:hover {
            a {
               color: white;
            }
            i {
               color: white;
            }
            background-color: #347362;
         }
      }
   }
   overflow: auto;
   display: flex;
   width: 0;
   flex-direction: column;
   height: 100%;
   background: #f5f3ee;
   /* SEO Suite/Pale Green */

   box-sizing: border-box;
   border-radius: 0px;
   position: fixed;
   right: 0;
   top: 0;
   z-index: 100;
   transition: width 0.25s ease-in;

   overflow: hidden;
   &.opened {
      width: 50%;

      border: 1px solid #ced9d2;
      box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
      padding: 30px;
      overflow: auto;
   }
   .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 30px;
      border-bottom: 1px solid #ced9d2;
      .btn {
         display: flex;
         align-items: center;
         gap: 0.3rem;

         &.completed {
            background-color: #347362;
            color: white;
            path {
               stroke: white;
            }
         }
      }
      .icons {
         display: flex;
         cursor: pointer;
         gap: 1.3rem;
         svg {
            opacity: 0.5;
         }
      }
   }
   .body {
      display: flex;
      padding-top: 30px;
      flex-direction: column;
      .title {
         font-family: "Goldplay-Semibold";
         font-style: normal;
         font-size: 28px;
         line-height: 100%;
         color: #0f393b;
      }
      .desc-label {
         margin-top: 60px;
         margin-bottom: 30px;
         color: #0f393b;
         font-family: "Goldplay-Bold";
      }
      .desc {
         width: 100%;
         border: none;
         outline: none;
         background-color: transparent;
         font-size: 18px;
         color: #0f393b;
         opacity: 0.5;
      }
      .details-table {
         display: grid;
         width: 100%;
         grid-template-columns: 1fr 2fr;
         grid-auto-rows: 48px;
         align-items: center;
         .details-label {
            font-family: Goldplay;
            font-size: 16px;
            color: #0f393b;
            opacity: 0.5;
         }
         .details-label + div {
            font-size: 18px;
            color: #0f393b;
         }
         .date-wrapper {
            display: flex;
            align-items: center;
            svg {
               margin-right: 24px;
            }
            font-size: 18px;
         }
         .assignee {
            display: flex;
            align-items: center;
            gap: 5px;
            img {
               height: 45px;
               width: 45px;
               border-radius: 50%;
               object-fit: cover;
            }
            div {
               font-family: Goldplay;
               font-size: 18px;
               color: #0f393b;
            }
         }
         .add-deps {
            span {
               font-family: "Goldplay-Bold";
               cursor: pointer;
               font-size: 18px;
               color: #0f393b;
            }
         }
         .empty-priority {
            width: 1rem;
            border-bottom: 1.5px solid #000000;
            opacity: 0.45;
         }
      }
   }
}
</style>
