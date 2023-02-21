<template>
   <div v-on:mouseup="onMouseUp" class="wrapper-wrapper">
      <UsersList></UsersList>
      <div v-on:mousemove="onMouseMove" v-on:scroll="onGridScroll" id="grid-wrapper" class="wrapper">
         <svg
            class="main-svg"
            version="1.1"
            :style="{ width: getTotalDays() * 38 }"
            width="300"
            height="200"
            xmlns="http://www.w3.org/2000/svg"
            v-on:click="onClickOnGrid"
         >
            <path
               fill="none"
               :class="{ highlighted: link.task1 === getSelectedTaskId() || link.task2 === getSelectedTaskId() }"
               v-for="link in getLinks"
               :d="link.path"
               stroke-width="2"
               stroke="black"
            ></path>

            <g v-for="link in getLinks">
               <path
                  class="invisible-path"
                  fill="none"
                  :d="link.path"
                  stroke-width="15"
                  style="stroke: transparent"
               ></path>
               <g class="close" v-on:click="(e) => onCloseBtnClick(e, link.id)">
                  <circle :cx="link.midPoint[0]" :cy="link.midPoint[1]" r="7" fill="#0F393B"></circle>
                  <line
                     class="cross-line"
                     :x1="link.midPoint[0] - 3"
                     :y1="link.midPoint[1] - 3"
                     :x2="link.midPoint[0] + 3"
                     :y2="link.midPoint[1] + 3"
                  />
                  <line
                     class="cross-line"
                     :x1="link.midPoint[0] - 3"
                     :y1="link.midPoint[1] + 3"
                     :x2="link.midPoint[0] + 3"
                     :y2="link.midPoint[1] - 3"
                  />
               </g>
               <polygon :points="link.trianglePoints" />
            </g>
            <circle
               v-for="link in getLinks"
               v-on:mousedown="(e) => mouseDownOnCircle(e, link.id)"
               :cx="link.point1[0] + 4"
               :cy="link.point1[1]"
               r="5"
               class="movement-circle"
               v-on:click="(e) => (e.stopImmediatePropagation(), e.stopPropagation())"
            ></circle>
            <polygon
               v-for="link in getLinks"
               :points="link.trianglePoints"
               :class="{ highlighted: link.task1 === getSelectedTaskId() || link.task2 === getSelectedTaskId() }"
               v-on:click="(e) => (e.stopImmediatePropagation(), e.stopPropagation())"
               v-on:mousedown="(e) => mouseDownOnArrow(e, link.id)"
            />
         </svg>
         <div
            id="grid-grid"
            :style="{
               width: getTotalDays() * 38 + 'px',
            }"
         >
            <div class="month-labels">
               <div
                  v-for="month in getMonthList"
                  :style="{ gridColumn: `${month.startCol + 1}/${month.startCol + 1 + month.noOfDays}` }"
               >
                  {{ month.month }}
               </div>
            </div>
            <div class="calendar-labels-grid">
               <div
                  v-for="(date, i) in getAllDates"
                  :class="{
                     weekend: date.getDay() === 6 || date.getDay() === 0,
                     sunday: date.getDay() === 0,
                     saturday: date.getDay() === 6,
                     highlighted: highlightedDates.includes(i + 1),
                     highlightedStart: highlightedDates[0] === i + 1,
                     highlightedEnd: highlightedDates.slice(-1)[0] === i + 1,
                  }"
               >
                  {{ date.getDate() }}
               </div>
            </div>
            <div
               draggable="false"
               id="grid"
               v-bind:style="{
                  width: getTotalDays() * 38 + 'px',
                  // gridTemplateColumns: `repeat(${getTotalDays()}, 38px)`,
                  gridTemplateRows: getTemplateRows || templateRows,
               }"
            >
               <div
                  class="weekend-overlay"
                  v-for="date in getWeekends"
                  :style="{
                     gridColumn: `${date.index + 1} / ${date.index + 1}`,
                     gridRow: `1/${(getNoOfRows || noOfRows) + 1}`,
                  }"
               ></div>
               <div
                  v-for="user in getUsers"
                  class="user-divider"
                  :style="{
                     gridRow: user.endRow + 1,
                     gridColumn: `1/${getTotalDays()}`,
                     display: user.id === '-1' ? 'none' : '',
                  }"
               ></div>

               <div
                  draggable="false"
                  v-for="task in getTasks"
                  v-on:click="selectTask(task.id)"
                  :class="{
                     highlighted: highlightedTasks.includes(task.id),
                     'task-wrapper': true,
                     small: task.endCol - task.startCol === 2 || task.endCol - task.startCol === 3,
                     verySmall: task.endCol - task.startCol === 1,
                     selected: task.selected,
                     'show-tooltip': task.endCol - task.startCol <= 3,
                     completed: task.completed,
                  }"
                  aria-selected="false"
                  :style="{ gridColumn: `${task.startCol}/${task.endCol}`, gridRow: `${task.row}` }"
               >
                  <div class="close-icon" @click.stop="store.commit('removeTask', task.id)">
                     <i class="el-icon-close"></i>
                  </div>
                  <div class="task-tooltip task-wrapper">
                     <div v-on:mousedown="(e) => onMouseDownOnBody(e, task)" draggable="false" class="task-body">
                        <svg
                           class="complete-icon"
                           v-if="task.completed"
                           style="margin-right: 5px"
                           width="25"
                           height="25"
                           viewBox="0 0 25 25"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path d="M7 12L10.5 15.5L17 9" stroke="#0F393B" stroke-width="1.5" stroke-linejoin="round" />
                           <circle cx="12.5" cy="12.5" r="11.75" stroke="#0F393B" stroke-width="1.5" />
                        </svg>

                        <img :src="task.img" v-if="task.userId !== '-1'" />
                        <div
                           @click.stop="() => 5"
                           @blur="(e) => store.commit('updateTaskText', { id: task.id, text: e.target.textContent })"
                           contenteditable="true"
                        >
                           {{ task.text }}
                        </div>
                        <div v-if="task.subtasks.length" class="subtasks-count">
                           {{ task.subtasks.length }}
                           <svg
                              width="14"
                              height="13"
                              viewBox="0 0 14 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                           >
                              <path
                                 d="M3.23212 5.46604L1.7252 7.13948L1.12036 6.53491C0.864011 6.27856 0.448796 6.27856 0.192312 6.53491C-0.0641724 6.79126 -0.0640356 7.20647 0.192312 7.46296L1.28606 8.55671C1.40911 8.68167 1.57673 8.75003 1.72548 8.75003C1.73146 8.75003 1.73659 8.75003 1.74257 8.7496C1.92288 8.7449 2.09285 8.66672 2.21343 8.53298L4.18218 6.34548C4.42486 6.0759 4.40263 5.66107 4.13348 5.41826C3.88837 5.1762 3.47548 5.19807 3.23212 5.46604ZM3.23212 1.09214L1.7252 2.76448L1.12036 2.15991C0.864011 1.90356 0.448796 1.90356 0.192312 2.15991C-0.0641724 2.41626 -0.0640356 2.83147 0.192312 3.08796L1.28606 4.18171C1.40911 4.30667 1.57673 4.37503 1.72548 4.37503C1.73146 4.37503 1.73659 4.37503 1.74257 4.3746C1.92288 4.3699 2.09285 4.29172 2.21343 4.15798L4.18218 1.97048C4.42486 1.7009 4.40263 1.28607 4.13348 1.04326C3.88837 0.801471 3.47548 0.8228 3.23212 1.09214ZM1.31259 10.0379C0.587703 10.0379 8.54481e-05 10.6255 8.54481e-05 11.3504C8.54481e-05 12.0753 0.587703 12.6629 1.31259 12.6629C2.03747 12.6629 2.62509 12.0753 2.62509 11.3504C2.62509 10.6504 2.03747 10.0379 1.31259 10.0379ZM7.00008 3.50003H13.1251C13.6082 3.50003 14.0001 3.10819 14.0001 2.62503C14.0001 2.14186 13.6082 1.75003 13.1251 1.75003H7.00008C6.5161 1.75003 6.12509 2.14186 6.12509 2.62503C6.12509 3.10819 6.5161 3.50003 7.00008 3.50003ZM13.1251 6.12503H7.00008C6.5161 6.12503 6.12509 6.51604 6.12509 7.00003C6.12509 7.48401 6.51692 7.87503 7.00008 7.87503H13.1251C13.6082 7.87503 14.0001 7.48319 14.0001 7.00003C14.0001 6.51686 13.6091 6.12503 13.1251 6.12503ZM13.1251 10.5H5.25009C4.76692 10.5 4.37509 10.8919 4.37509 11.375C4.37509 11.8582 4.76692 12.25 5.25009 12.25H13.1251C13.6082 12.25 14.0001 11.8582 14.0001 11.375C14.0001 10.8919 13.6091 10.5 13.1251 10.5Z"
                                 fill="#0F393B"
                              />
                           </svg>
                        </div>
                     </div>
                  </div>
                  <div
                     v-if="task.selected"
                     v-on:mousedown="onMouseDownOnMover(task, 'left')"
                     class="task-mover task-mover-left"
                  >
                     <svg width="6" height="17" viewBox="0 0 6 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line
                           y1="-0.75"
                           x2="17"
                           y2="-0.75"
                           transform="matrix(4.37114e-08 1 1 -4.37114e-08 2 0)"
                           stroke="#F5F3EE"
                           stroke-width="1.5"
                        />
                        <line
                           y1="-0.75"
                           x2="17"
                           y2="-0.75"
                           transform="matrix(4.37114e-08 1 1 -4.37114e-08 6 0)"
                           stroke="#F5F3EE"
                           stroke-width="1.5"
                        />
                     </svg>
                  </div>
                  <!-- ts-ignore -->
                  <div v-on:mousedown="(e) => onMouseDownOnBody(e, task)" draggable="false" class="task-body">
                     <svg
                        class="complete-icon"
                        v-if="task.completed"
                        style="margin-right: 5px"
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path d="M7 12L10.5 15.5L17 9" stroke="#0F393B" stroke-width="1.5" stroke-linejoin="round" />
                        <circle cx="12.5" cy="12.5" r="11.75" stroke="#0F393B" stroke-width="1.5" />
                     </svg>

                     <img :src="task.img" v-if="task.userId !== '-1'" />
                     <div
                        @click.stop="() => 5"
                        @blur="(e) => store.commit('updateTaskText', { id: task.id, text: e.target.textContent })"
                        :contenteditable="!task.moving"
                     >
                        {{ task.text }}
                     </div>
                     <div v-if="task.subtasks.length" class="subtasks-count">
                        {{ task.subtasks.length }}
                        <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path
                              d="M3.23212 5.46604L1.7252 7.13948L1.12036 6.53491C0.864011 6.27856 0.448796 6.27856 0.192312 6.53491C-0.0641724 6.79126 -0.0640356 7.20647 0.192312 7.46296L1.28606 8.55671C1.40911 8.68167 1.57673 8.75003 1.72548 8.75003C1.73146 8.75003 1.73659 8.75003 1.74257 8.7496C1.92288 8.7449 2.09285 8.66672 2.21343 8.53298L4.18218 6.34548C4.42486 6.0759 4.40263 5.66107 4.13348 5.41826C3.88837 5.1762 3.47548 5.19807 3.23212 5.46604ZM3.23212 1.09214L1.7252 2.76448L1.12036 2.15991C0.864011 1.90356 0.448796 1.90356 0.192312 2.15991C-0.0641724 2.41626 -0.0640356 2.83147 0.192312 3.08796L1.28606 4.18171C1.40911 4.30667 1.57673 4.37503 1.72548 4.37503C1.73146 4.37503 1.73659 4.37503 1.74257 4.3746C1.92288 4.3699 2.09285 4.29172 2.21343 4.15798L4.18218 1.97048C4.42486 1.7009 4.40263 1.28607 4.13348 1.04326C3.88837 0.801471 3.47548 0.8228 3.23212 1.09214ZM1.31259 10.0379C0.587703 10.0379 8.54481e-05 10.6255 8.54481e-05 11.3504C8.54481e-05 12.0753 0.587703 12.6629 1.31259 12.6629C2.03747 12.6629 2.62509 12.0753 2.62509 11.3504C2.62509 10.6504 2.03747 10.0379 1.31259 10.0379ZM7.00008 3.50003H13.1251C13.6082 3.50003 14.0001 3.10819 14.0001 2.62503C14.0001 2.14186 13.6082 1.75003 13.1251 1.75003H7.00008C6.5161 1.75003 6.12509 2.14186 6.12509 2.62503C6.12509 3.10819 6.5161 3.50003 7.00008 3.50003ZM13.1251 6.12503H7.00008C6.5161 6.12503 6.12509 6.51604 6.12509 7.00003C6.12509 7.48401 6.51692 7.87503 7.00008 7.87503H13.1251C13.6082 7.87503 14.0001 7.48319 14.0001 7.00003C14.0001 6.51686 13.6091 6.12503 13.1251 6.12503ZM13.1251 10.5H5.25009C4.76692 10.5 4.37509 10.8919 4.37509 11.375C4.37509 11.8582 4.76692 12.25 5.25009 12.25H13.1251C13.6082 12.25 14.0001 11.8582 14.0001 11.375C14.0001 10.8919 13.6091 10.5 13.1251 10.5Z"
                              fill="#0F393B"
                           />
                        </svg>
                     </div>
                  </div>
                  <div
                     v-if="task.selected"
                     v-on:mousedown="onMouseDownOnMover(task, 'right')"
                     class="task-mover task-mover-right"
                  >
                     <svg width="6" height="17" viewBox="0 0 6 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line
                           y1="-0.75"
                           x2="17"
                           y2="-0.75"
                           transform="matrix(4.37114e-08 1 1 -4.37114e-08 2 0)"
                           stroke="#F5F3EE"
                           stroke-width="1.5"
                        />
                        <line
                           y1="-0.75"
                           x2="17"
                           y2="-0.75"
                           transform="matrix(4.37114e-08 1 1 -4.37114e-08 6 0)"
                           stroke="#F5F3EE"
                           stroke-width="1.5"
                        />
                     </svg>
                  </div>
               </div>
            </div>
         </div>
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
   compareDates,
} from "@/utils/helpers";
import Vue from "vue";
import { MyStore } from "..";
import UsersList from "./UsersList.vue";
import TaskDetails from "./TaskDetails.vue";

export default Vue.extend({
   name: "Calendar",
   data() {
      console.log(this.store.state.mouse, "Mouse");
      return { size: 10, noOfRows: 0, templateRows: "" };
   },

   methods: {
      getTotalDays() {
         return this.getAllDates.length + 1;
      },
      getDateList() {
         return this.dateList.flatMap((x) => [...Array(x.noOfDays)].map((x, i) => i + 1));
      },
      selectTask(taskId: string) {
         this.store.commit("selectTaskById", taskId);
      },
      onMouseDownOnMover(task: ITask, dir: MoverDirection) {
         this.store.commit("mouseDownOnMover", dir);
      },
      onMouseDownOnBody(e: MouseEvent, task: ITask) {
         const [x, _] = getMousePos(e);
         const grabColOffset = Math.ceil(x / 38) - task.startCol;
         this.store.commit("mouseDownOnTaskBody", { task, grabColOffset });
      },
      onMouseMove(e: MouseEvent) {
         const wrapper = e.target as HTMLElement;
         const { left, top } = wrapper.getBoundingClientRect();
         // console.log(left, top);
         this.store.commit("onMouseMove", getMousePos(e));
      },
      onMouseUp(e: MouseEvent) {
         this.store.commit("onMouseUp", undefined);
      },
      mouseDownOnArrow(e: MouseEvent, linkId: string) {
         e.preventDefault();
         e.stopPropagation();
         e.stopImmediatePropagation();
         this.store.commit("mouseDownOnArrow", linkId);
      },
      mouseDownOnCircle(e: MouseEvent, linkId: string) {
         e.preventDefault();

         e.stopPropagation();
         e.stopImmediatePropagation();
         console.log("mouse down on circle called");
         this.store.commit("mouseDownOnCircle", linkId);
      },
      onCloseBtnClick(e: MouseEvent, linkId: string) {
         this.store.commit("deleteLink", linkId);
      },
      getSelectedTaskId() {
         return this.store.getters.getActiveProject.tasks.find((x) => x.selected)?.id || "-1";
      },
      onClickOnGrid() {
         this.store.commit("deselectAllTasks", undefined);
      },
      onGridScroll(e: Event) {
         this.store.commit("setGridScroll", (e.target as HTMLElement).scrollLeft);
      },
      addNewTask() {},
   },
   mounted() {
      this.store.commit("updateLinks", undefined);
      const grid = document.querySelector("#grid");
      const height = grid?.getBoundingClientRect().height;
      if (height) {
         const noOfRows = Math.floor(height / 55);
         const remainingPart = height % 55;
         this.noOfRows = noOfRows + 1;
         this.templateRows = `repeat(${noOfRows}, 55px) ${remainingPart}px`;
      }

      const activeProject = store.getters.getActiveProject;
      const allDates = getCompleteDateList(activeProject.startDate, activeProject.endDate);
      const colNo = allDates.findIndex((x) => compareDates(x, new Date()));
      const width = colNo * 38;
      const gridWrapper = document.querySelector("#grid-wrapper");
      gridWrapper?.scrollTo({ left: width });
   },
   computed: {
      getCalendarHeight() {
         return window.innerHeight - 186 + 90;
      },
      getTemplateRows() {
         const grid = document.querySelector("#grid");
         const height = grid?.getBoundingClientRect().height;
         if (height) {
            const noOfRows = Math.floor(height / 55);
            const remainingPart = height % 55;
            return `repeat(${noOfRows}, 55px) ${remainingPart}px`;
         }
         console.log("Height not found");
         return "";
      },
      getNoOfRows() {
         const grid = document.querySelector("#grid");
         const height = grid?.getBoundingClientRect().height;
         if (height) {
            const noOfRows = Math.floor(height / 55);
            const remainingPart = height % 55;
            return noOfRows + 1;
         }
      },

      getTotalRows() {
         return this.store.getters.getActiveProject.users.reduce((ac, a) => ac + a.noOfRows, 0);
      },
      getMPos() {
         return this.store.state.mouse;
      },
      getTasksToRemoveOverlap() {
         const activeProject = this.store.getters.getActiveProject;
         const activeTasks = activeProject.tasks;
         const tasksByUser = activeProject.users.map((u) => ({
            ...u,
            tasks: activeTasks.filter((t) => t.userId === u.id),
         }));
      },
      getWeekends() {
         const { endDate, startDate } = this.store.getters.getActiveProject;

         const dateList = getCompleteDateList(startDate, endDate);
         return dateList
            .map((x, i) => ({ date: x, index: i }))
            .filter(({ date }) => date.getDay() === 0 || date.getDay() === 6);
      },
      getAllDates() {
         const { endDate, startDate } = this.store.getters.getActiveProject;
         const dateList = getCompleteDateList(startDate, endDate);
         return dateList;
      },
      dateList() {
         const { endDate, startDate } = this.store.state.projects[0];
         return getMonthListBetweenDates(startDate, endDate);
      },
      // getAllDates(){
      // }
      templateRows() {
         const users = this.store.state.projects[0].users as IUser[];
         return `${users.flatMap((x) => Array(x.noOfRows).fill("55px")).join(" ")}`;
      },
      getTasks() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         return activeProject.tasks.map((x) => ({
            ...x,
            img: activeProject.users.find((u) => u.id === x.userId)?.img || "",
         }));
      },
      getLinks() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         return activeProject.links;
         return this.store.getters.getLinksWithPaths
            .map((x) => {
               if (x.id === this.store.state.movingArrow) {
                  return { ...x, point2: [this.store.state.mouse.x, this.store.state.mouse.y] };
               }
               return x;
            })
            .map((x) => ({
               ...x,
               path: getLinePath(x.point1[0], x.point1[1], x.point2[0], x.point2[1]),
               trianglePoints: getTrianglePoints(x.point2[0], x.point2[1]),
               midPoint: [x.point1[0] + (x.point2[0] - x.point1[0]) / 2, x.point1[1] + (x.point2[1] - x.point1[1]) / 2],
            }));
      },
      getBorders() {
         const activeTasks = this.store.getters.getActiveProject?.tasks;
         if (activeTasks) {
            return activeTasks;
         }
      },
      getUsers() {
         const users = this.store.getters.getActiveProject.users as IUser[];
         return users.map((x, i) => {
            const startRow = users.slice(0, i).reduce((ac, a) => ac + a.noOfRows, 0);
            return { ...x, startRow, endRow: startRow + x.noOfRows };
         });
      },
      highlightedDates() {
         const selectedTask = this.store.getters.getActiveProject.tasks.find((x) => x.selected) as ITask;
         if (selectedTask) {
            return Array(selectedTask.endCol - selectedTask.startCol)
               .fill(0)
               .map((x, i) => selectedTask.startCol + i);
         }
         return [] as number[];
      },
      highlightedTasks() {
         const activeProject = this.store.getters.getActiveProject as IProject;
         const selectedTask = this.store.getters.getActiveProject.tasks.find((x) => x.selected) as ITask;
         if (selectedTask) {
            const links = activeProject.links.filter((x) => x.task1 === selectedTask.id || x.task2 === selectedTask.id);
            const tasks = [...new Set(links.flatMap((x) => [x.task1, x.task2]))].filter((x) => x !== selectedTask.id);
            console.log(tasks, "Selected tasks");
            return tasks;
         }
         return [];
      },

      getMonthList() {
         const { endDate, startDate } = this.store.state.projects[0];
         const monthList = getMonthListBetweenDates(startDate, endDate);
         const dateList = getCompleteDateList(startDate, endDate);
         // const allMonths = [...new Set(dateList.map(x => x.getMonth()))];
         // const datesByMonths = allMonths.map(x => dateList.filter())
         // const datesByMonth =
         const monthListWithStartCol = monthList
            .map((x, i) => ({
               ...x,
               noOfDays: dateList.filter((d) => d.getMonth() === x.monthNo).length,
            }))
            .map((x, i, monthList) => ({
               ...x,
               startCol: monthList.slice(0, i).reduce((ac, a) => ac + a.noOfDays, 0),
            }));
         console.log("Month List", monthListWithStartCol);
         return monthListWithStartCol;
      },
   },
   components: { UsersList, TaskDetails },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrapper-wrapper {
   display: grid;
   grid-template-columns: 1fr 4fr;
   .wrapper {
      position: relative;

      .calendar-labels-grid {
         user-select: none;
         -webkit-user-drag: none;
         display: grid;
         grid-auto-flow: column;
         grid-auto-columns: 38px;
         place-items: center;
         background-color: #eeebe3;
         height: 25px;
         border-bottom: 1px solid #ced9d2;
         div {
            font-family: "Goldplay-Medium";
            font-weight: 500;
            font-size: 1rem;
            height: 100%;
            width: 100%;

            text-align: center;
            color: #0f393b;
            &.weekend {
               background: #efece6;
               border: 1px solid #ced9d2;
               border-bottom: none;
               color: #0f393b;
               opacity: 0.5;
               &.sunday {
                  border-left: none;
                  border-radius: 0px 5px 0px 0px;
               }
               &.saturday {
                  border-right: none;
                  border-radius: 5px 0px 0px 0px;
               }
            }
            &.highlighted {
               background: #ef8451;
               border: none;
               border-radius: 0 !important;
               opacity: 1;
               &.highlightedStart {
                  border-radius: 5px 0px 0px 0px !important;
               }
               &.highlightedEnd {
                  border-radius: 0px 5px 0px 0px !important;
               }
               color: white;
            }
         }
      }
   }
}

.wrapper {
   height: 100%;
   width: 100%;
   overflow: auto;
}
#grid-grid {
   display: grid;

   grid-template-rows: min-content min-content auto;
   height: 100%;
   .month-labels {
      user-select: none;
      -webkit-user-drag: none;
      position: relative;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 38px;
      background-color: #eeebe3;
      height: 56px;
      & > div:not(.filters) {
         border-left: 2px solid #ced9d2;
         padding-left: 0.5rem;
         font-size: 1.125rem;
         color: #0f393b;
         opacity: 0.5;
         height: fit-content;
      }
   }
   #grid {
      display: grid;
      height: 100%;
      background: #f5f3ee;
      grid-auto-flow: dense;
      grid-auto-rows: 55px;
      grid-auto-columns: 38px;

      .user-divider {
         border-bottom: 1px solid #ced9d2;
         width: 100%;
         height: 0px;
      }
      .weekend-overlay {
         width: 100%;
         /* position: absolute; */
         background-color: #efece6;
      }
   }
}
.task-wrapper {
   /* input {
      border: none;
      outline: none;
      background: transparent;
      color: #0f393b;
      font-family: "Goldplay";
      font-size: 16px;
   } */
   .close-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0f393b;
      opacity: 0.25;
      position: absolute;
      top: 0;
      left: 100%;
      color: white;
      padding: 0.15rem;
      border-radius: 50%;
      font-size: 12px;
      transform: translate(-60%, -40%);
      transition: all 0.2s ease-in-out;
      z-index: 10;
      &:hover {
         opacity: 1;
      }
   }
   display: flex;
   /* display: grid;
   grid-template-columns: 12px auto 12px; */
   background: #eeebe3;
   -webkit-user-drag: none;
   /* SEO Suite/Pale Green */
   margin: 5px 0;
   box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
   position: relative;
   /* overflow: hidden; */
   border: 1px solid #ced9d2;
   /* border-radius: 10px; */
   &.completed:not(.selected) {
      opacity: 0.3;
   }
   .task-tooltip {
      display: none;
      position: absolute;
      top: 0px;
      left: 50%;
      transform: translate(0%, -100%);
      min-width: fit-content;
      z-index: 1;
      div,
      .complete-icon {
         display: block !important;
      }
      .subtasks-count {
         display: flex !important;
      }
      .task-body {
         display: flex !important;
         border: none !important;
      }
   }
   &.highlighted {
      border: 1px solid #ef8451;
   }
   cursor: pointer;
   .task-body {
      flex-grow: 1;
      user-select: none;
      padding: 5px;
      display: flex;
      align-items: center;
      gap: 5px;

      .complete-icon {
         opacity: 0.5;
      }
      div {
         font-family: 16;
         font-family: Goldplay;
         padding: 0.2rem 0.3rem;
      }
      img {
         height: 35px;
         width: 35px;
         border-radius: 50%;
         object-fit: cover;
      }
      .subtasks-count {
         margin-left: 10px;
         font-size: 18px;
         opacity: 0.5;
         display: flex;
         align-items: center;
         gap: 10px;
      }
   }
   &.small {
      .task-body {
         flex-grow: 1;
         img {
         }
         div,
         .complete-icon,
         .subtasks-count {
            display: none;
         }
      }
   }

   &.verySmall {
      .task-mover {
         width: 6px;
      }
      .task-body {
         padding: 2px;

         div,
         .complete-icon,
         .subtasks-count {
            display: none;
         }
         img {
            width: 100%;
            aspect-ratio: 1;
         }
      }
   }
   &.show-tooltip:hover {
      .task-tooltip {
         display: flex;
         z-index: 100;
         .task-content {
            display: block;
         }
      }
   }
   &.selected {
      border-radius: 0 !important;
      border: none;
      .task-body {
         border: 1px solid #ef8451;
      }
      cursor: grab;
      z-index: 100;
   }

   border-radius: 10px;
}

.task-mover {
   background: #ef8451;
   /* border-radius: 6px 0px 0px 6px; */
   display: flex;
   align-items: center;
   justify-content: center;
   width: 12px;
   height: 100%;
   position: relative;
   cursor: e-resize;
   .line {
      position: absolute;
      height: 17px;
      min-width: 1px;
      max-width: 1px;
      width: 1px;
      background-color: white;
      top: 50%;
      transform: translate(-50%, -50%);
   }
   .line:first-child {
      left: 70%;
   }
   .line:last-child {
      left: 30%;
   }
   /* &::after,
   &::before {
      content: "";
      position: absolute;
      height: 17px;
      min-width: 1px;
      max-width: 1px;
      background-color: white;
      top: 50%;
      transform: translate(-50%, -50%);
   } */
   &.task-mover-left {
      border-radius: 10px 0px 0px 10px;
      -webkit-border-radius: 10px 0px 0px 10px;
   }
   &.task-mover-right {
      svg {
         transform: translateX(-1px);
      }
      border-radius: 0px 10px 10px 0px;
      -webkit-border-radius: 0px 10px 10px 0px;
   }
}

.main-svg {
   background-color: transparent;
   position: absolute;
   height: calc(100% - 56px - 25px);
   width: 100%;
   top: calc(56px + 25px);
   g.close {
      opacity: 0;
      &:hover {
         opacity: 1;
      }
      transition: all 0.25s ease-in-out;
      cursor: pointer;
   }
   .invisible-path:hover {
      & + g.close {
         opacity: 0.5;
      }
   }
   path {
      stroke: #7e7e7e;
      &.highlighted {
         stroke: #ef8451;
      }
   }
   polygon {
      fill: #7e7e7e;
      stroke: #7e7e7e;
      stroke-width: 1px;
      cursor: pointer;
      &.highlighted {
         stroke: #ef8451;
         fill: #ef8451;
      }
   }
   .cross-line {
      stroke: #f5f3ee;
      stroke-width: 2;
   }
   .movement-circle {
      fill-opacity: 0;
      stroke-width: 1px;
      fill: #7e7e7e;
      cursor: pointer;
      /* &:hover {
         fill-opacity: 1;
      } */
      transition: all 0.2s ease-in-out;
   }
}
</style>
