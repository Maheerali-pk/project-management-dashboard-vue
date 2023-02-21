import {
   areTasksOverlapped,
   compareDates,
   getCompleteDateList,
   getLinePath,
   getTrianglePoints,
   getUserWithRow,
   scalePoints,
} from "@/utils/helpers";
import Vue from "vue";
import Vuex, { Store } from "vuex";
import { MyStore } from "..";

Vue.use(Vuex);

const getters = {
   getProjects(state: IState) {
      return state.projects;
   },
   getActiveProject(state: IState) {
      return state.projects.find((x) => x.id === state.activeProjectId) as IProject;
   },
   getActiveTask(state: IState) {
      const activeProject = state.projects.find((x) => x.id === state.activeProjectId);
      return activeProject?.tasks.find((task) => task.selected);
   },
   getMovingTask(state: IState) {
      const activeProject = state.projects.find((x) => x.id === state.activeProjectId);
      return activeProject?.tasks.find((x) => x.moving);
   },
   getLinksWithPaths(state: IState) {
      const activeProject = state.projects.find((x) => x.id === state.activeProjectId);

      console.log("Get links with paths called");
      if (activeProject) {
         const res = activeProject.links.map((link) => {
            const task1 = activeProject.tasks.find((x) => x.id === link.task1) as ITask;
            const task2 = activeProject.tasks.find((x) => x.id === link.task2) as ITask;
            const point1 = [task1?.endCol * 38 - 38, task1.row * 55 - 55 / 2];
            let point2 = [task2?.startCol * 38 - 38, task2.row * 55 - 55 / 2];

            return { ...link, point1, point2 };
         });
         return res;
      }
      return [];
   },
} as const;

const mutations = {
   selectTaskById(state: IState, taskId: string) {
      const activeProject = state.projects.find((x) => x.id === state.activeProjectId);
      if (activeProject) {
         const clickedTask = activeProject.tasks.find((task) => task.id === taskId) as ITask;
         const selectedBefore = clickedTask?.selected;
         activeProject.tasks.forEach((task) => {
            task.selected = false;
         });
         if (selectedBefore && !clickedTask.moving && !state.taskMoved) {
            state.showTaskDetails = true;
         } else {
            state.showTaskDetails = false;
         }
         if (clickedTask) {
            clickedTask.selected = true;
         }
      }
   },
   mouseDownOnMover(state: IState, dir: MoverDirection) {
      state.resizingTask = true;
      state.resizingDir = dir;
   },
   mouseDownOnTaskBody(state: IState, { task, grabColOffset }: { task: ITask; grabColOffset: number }) {
      store.getters.getActiveProject?.tasks.forEach((x) => {
         x.moving = false;
      });
      store.getters.getActiveProject.tasks.find((x) => x.id === task.id)!.moving = true;
      // console.log("Mouse down on task", task);
      state.movingTask = true;
      state.grabColOffset = grabColOffset;
      state.mouseDownPos = { ...state.mouse };
      state.taskMoved = false;

      // console.log("mouse down on body");
   },
   deleteRow(state: IState, row: number) {
      const activeProject = store.getters.getActiveProject;
      activeProject.tasks.filter((x) => x.row > row).forEach((task) => task.row--);
      const userWithDeletedRow = getUserWithRow(state, row);
      userWithDeletedRow!.noOfRows--;
   },
   mouseDownOnArrow(state: IState, linkId: string) {
      state.movingArrow = linkId;
   },
   mouseDownOnCircle(state: IState, linkId: string) {
      console.log("moving circle changed", linkId);
      state.movingCircle = linkId;
   },
   deleteLink(state: IState, linkId: string) {
      const activeProject = store.getters.getActiveProject;
      const index = activeProject.links.findIndex((x) => x.id === linkId);
      activeProject.links.splice(index, 1);
   },
   onMouseUp(state: IState, customTask?: ITask) {
      const activeProject = store.getters.getActiveProject as IProject;
      const changedTask = state.resizingTask
         ? activeProject.tasks.find((x) => x.selected)
         : activeProject.tasks.find((x) => x.moving) || customTask;
      // console.log(changedTask, changedTask);
      if (changedTask) {
         const changedRowTasks = activeProject.tasks.filter((x) => x.row === changedTask.row);
         const isOverlapped = changedRowTasks
            .filter((x) => x.id !== changedTask.id)
            .some((x) => x.startCol < changedTask.endCol && changedTask.startCol < x.endCol);
         const overlappedTask = changedRowTasks
            .filter((x) => x.id !== changedTask.id)
            .find((x) => x.startCol < changedTask.endCol && changedTask.startCol < x.endCol);
         if (isOverlapped) {
            const row = changedTask.row;
            const afterRows = activeProject.tasks.filter((x) => x.row > row);
            const destinationUser = activeProject.users.find((x) => x.id === overlappedTask!.userId) as IUser;

            // const userIndex = activeProject.users.findIndex((x) => x.id === changedTask.userId);
            // const user = activeProject.users[userIndex];

            destinationUser.noOfRows++;
            afterRows.forEach((x) => {
               x.row++;
            });

            changedTask.userId = destinationUser.id;
            changedTask.row++;
         } else {
            const tempUsers = activeProject.users.map((x, i) => {
               const startRow = activeProject.users.slice(0, i).reduce((ac, a) => ac + a.noOfRows, 0) + 1;
               return { ...x, startRow, endRow: startRow + x.noOfRows };
            });
            // console.log(tempUsers);
            const destinationUser = tempUsers.find(
               (x) => x.startRow <= changedTask.row && x.endRow > changedTask.row
            ) as IUser;
            // console.log("destination user", destinationUser);
            changedTask.userId = destinationUser.id;
            // console.log(changedTask);
         }
         //Remove empty rows
         // activeProject.users.forEach(user => {
         //    if(user.noOfRows > 1){
         //       const emptyRows =
         //    }
         // })

         const totalRows = activeProject.users.reduce((ac, a) => ac + a.noOfRows, 0);
         const allRows = [...Array(totalRows)].map((x, i) => i + 1);
         // console.log(allRows, "All rows");
         const tempUsers = activeProject.users.map((x, i) => {
            const startRow = activeProject.users.slice(0, i).reduce((ac, a) => ac + a.noOfRows, 0) + 1;
            return { ...x, startRow, endRow: startRow + x.noOfRows };
         });
         // console.log(activeProject.users);
         // console.log(tempUsers, "Temp users");
         const emptyRows = allRows.filter((row) => {
            const rowContainsTask = activeProject.tasks.some((x) => x.row === row);
            // console.log("row: ", row, "user", getUserWithRow(state, row));
            const destinationUser = tempUsers.find((x) => x.startRow <= row && x.endRow > row) as IUser;
            const isFirstRow =
               destinationUser.startRow === row && destinationUser.endRow === destinationUser.startRow + 1;
            const isUnassignedRow = destinationUser.id === "-1";

            return !(rowContainsTask || isFirstRow || isUnassignedRow);
         });
         // console.log(emptyRows, "emptyRows");
         emptyRows.forEach((x) => {
            store.commit("deleteRow", x);
         });
      }
      if (state.movingArrow) {
         const col = Math.ceil(state.mouse.x / 38);
         const row = Math.ceil(state.mouse.y / 55);
         const destTask = activeProject.tasks.find((x) => x.row === row && x.startCol <= col && x.endCol > col);
         if (destTask) {
            const changedLink = activeProject.links.find((x) => x.id === state.movingArrow) as ILink;
            if (destTask.id !== changedLink.task1) {
               changedLink.task2 = destTask.id;
            }
         }
      }

      if (state.movingCircle) {
         const col = Math.ceil(state.mouse.x / 38);
         const row = Math.ceil(state.mouse.y / 55);
         const destTask = activeProject.tasks.find((x) => x.row === row && x.startCol <= col && x.endCol > col);
         if (destTask) {
            const changedLink = activeProject.links.find((x) => x.id === state.movingCircle) as ILink;
            if (destTask.id !== changedLink.task2) {
               changedLink.task1 = destTask.id;
            }
         }
      }

      state.resizingTask = false;
      state.movingTask = false;
      store.getters.getActiveProject?.tasks.forEach((x) => {
         x.moving = false;
      });
      state.movingArrow = undefined;
      state.movingCircle = undefined;
      activeProject.links.forEach((x) => {
         x.point1[0] = 0;
         x.point1[1] = 0;
         x.point2[0] = 0;
         x.point2[1] = 0;
      });
      state.grabColOffset = undefined;
      if (state.mouse.x === state.mouseDownPos.x && state.mouse.y === state.mouseDownPos.y) {
         state.taskMoved = false;
      } else {
         state.taskMoved = true;
      }
   },
   updateDateOfSelectedTask(state: IState, payload: { type: "start" | "end"; date: Date }) {
      const activeProject = store.getters.getActiveProject;
      const activeTask = activeProject.tasks.find((x) => x.selected) as ITask;
      const allDates = getCompleteDateList(activeProject.startDate, activeProject.endDate);
      const col = allDates.findIndex((x) => compareDates(payload.date, x)) + 1;
      if (payload.type === "end") {
         activeTask.endCol = col + 1;
      } else {
         activeTask.startCol = col;
      }
      store.commit("updateLinks", undefined);
   },
   updateLinks(state: IState) {
      const activeProject = store.getters.getActiveProject;
      const offsetY = 0;
      activeProject.links.forEach((link) => {
         const task1 = activeProject.tasks.find((x) => x.id === link.task1) as ITask;
         const task2 = activeProject.tasks.find((x) => x.id === link.task2) as ITask;
         let point1 = [task1?.endCol * 38 - 38, task1.row * 55 - 55 / 2 + offsetY] as [number, number];
         let point2 = [task2?.startCol * 38 - 38, task2.row * 55 - 55 / 2 + offsetY] as [number, number];

         if (state.movingCircle === link.id) {
            point1 = [state.mouse.x, state.mouse.y + offsetY];
         }
         if (state.movingArrow === link.id) {
            point2 = [state.mouse.x, state.mouse.y + offsetY];
         }

         link.point1 = point1;
         link.point2 = point2;

         link.midPoint = [
            link.point1[0] + (link.point2[0] - link.point1[0]) / 2,
            link.point1[1] + (link.point2[1] - link.point1[1]) / 2,
         ];

         link.trianglePoints = getTrianglePoints(link.point2[0], link.point2[1]);
         link.path = getLinePath(link.point1[0], link.point1[1], link.point2[0] - 5, link.point2[1]);
      });
   },
   onMouseMove(state: IState, cell: [number, number]) {
      const activeProject = store.getters.getActiveProject;
      const activeTask = store.getters.getActiveTask;
      if (activeTask && state.resizingTask) {
         let startCol = activeTask.startCol;
         let endCol = activeTask.endCol;
         if (state.resizingDir === "left") {
            startCol = Math.ceil(cell[0] / 38);
         }
         if (state.resizingDir === "right") {
            endCol = Math.ceil(cell[0] / 38) + 1;
         }
         if (endCol - startCol <= 0) {
            return;
         }
         activeTask.endCol = endCol;
         activeTask.startCol = startCol;
      }
      // console.log(state.movingTask);
      // console.log(store.getters.getMovingTask);
      if (state.movingTask) {
         const movingTask = store.getters.getActiveProject?.tasks.find((x) => x.moving);
         if (movingTask) {
            let width = movingTask.endCol - movingTask.startCol;
            let prevStartCol = movingTask.startCol;
            const col = Math.ceil(cell[0] / 38) - (state.grabColOffset as number);
            if (col <= 0) {
               return;
            }
            const row = Math.ceil(cell[1] / 55);
            movingTask.row = row;
            movingTask.startCol = col;
            movingTask.endCol = col + width;
            if (prevStartCol !== movingTask.startCol) {
               const allDates = getCompleteDateList(getStartDate(), getEndDate());
               const scrollX = movingTask.startCol * 38;
               const grid = document.querySelector("#grid-wrapper") as HTMLElement;
               const startCol = Math.floor(grid?.scrollLeft / 38);
               console.log(allDates[startCol], "Start date");
               console.log(startCol, movingTask.startCol - 1);
               const endCol = startCol + Math.floor(grid.clientWidth / 38);

               console.log("endDate", allDates[endCol]);
               if (movingTask.startCol - 1 < startCol) {
                  grid.scrollTo({ left: (movingTask.startCol - 1) * 38, behavior: "smooth" });
               }
               if (movingTask.endCol - 1 > endCol) {
                  grid.scrollTo({
                     left: (movingTask.endCol - 1) * 38 - Math.floor(grid.clientWidth),
                     behavior: "smooth",
                  });
               }
            }
         }
      }
      // if (state.movingArrow) {
      //    const movingArrowObj = activeProject.links.find((x) => x.id === state.movingArrow);
      //    if (movingArrowObj) {
      //       console.log("p2 is chaning");
      //       movingArrowObj.point2[0] = cell[0];
      //       movingArrowObj.point2[1] = cell[1];
      //    }
      // }
      state.mouse.x = cell[0];
      state.mouse.y = cell[1];
      if (state.movingTask) {
         state.taskMoved = true;
      }
      store.commit("updateLinks", undefined);
   },
   deselectAllTasks(state: IState) {
      // console.log("De select all tasks called");
      const activeProject = state.projects.find((x) => x.id === state.activeProjectId);
      if (activeProject) {
         activeProject.tasks.forEach((task) => {
            task.selected = false;
         });
      }
      state.showTaskDetails = false;
      // console.log("Show task details is changed");
   },
   setGridScroll(state: IState, scroll: number) {
      state.gridScrollX = scroll;
   },
   addNewTask(state: IState) {
      const activeProject = store.getters.getActiveProject;
      const row = activeProject.users.slice(0, -1).reduce((ac, a) => ac + a.noOfRows, 0) + 1;

      const allDates = getCompleteDateList(activeProject.startDate, activeProject.endDate);
      const colNo = allDates.findIndex((x) => compareDates(x, new Date()));
      activeProject.tasks.push({
         fileList: [],
         userId: "-1",
         row,
         id: Math.random().toFixed(10),
         startCol: colNo + 1,
         endCol: colNo + 7,
         text: "New Task",
         selected: false,
         subtasks: [],
         completed: false,
      });
      store.commit("onMouseUp", activeProject.tasks[activeProject.tasks.length - 1]);
   },
   addLinkToSelectedTask(state: IState, taskId: string) {
      const activeProject = store.getters.getActiveProject;
      const selectedTask = activeProject.tasks.find((x) => x.selected) as ITask;
      activeProject.links.push({
         id: Math.random().toString(),
         midPoint: [0, 0],
         path: "",
         point1: [0, 0],
         point2: [0, 0],
         task1: selectedTask.id,
         task2: taskId,
         trianglePoints: "",
      });
      store.commit("updateLinks", undefined);
   },
   removeLinkFromSelectedTask(state: IState, taskId: string) {
      const activeProject = store.getters.getActiveProject;
      const selectedTask = activeProject.tasks.find((x) => x.selected) as ITask;
      const linkToRemove = activeProject.links.findIndex((x) => x.task1 === selectedTask.id && x.task2 === taskId);
      activeProject.links.splice(linkToRemove, 1);
      store.commit("updateLinks", undefined);
   },
   addDescriptionToSelectionTask(state: IState, text: string) {
      const activeProject = store.getters.getActiveProject;
      const selectedTask = activeProject.tasks.find((x) => x.selected) as ITask;
      selectedTask.description = text;
   },
   updateSubTask(state: IState, subtaskProps: Partial<ISubTask>) {
      const activeProject = store.getters.getActiveProject;
      const selectedTask = activeProject.tasks.find((x) => x.selected) as ITask;
      const subtask = selectedTask.subtasks.find((x) => x.id === subtaskProps.id) as ISubTask;
      // console.log(subtask, subtaskProps);
      if (subtaskProps.selected !== undefined) {
         selectedTask.subtasks.forEach((x) => (x.selected = false));
      }
      for (let k in subtaskProps) {
         //@ts-ignore
         subtask[k as keyof ISubTask] = subtaskProps[k as keyof ISubTask];
      }
   },
   addSubtaskToSelectedTask(state: IState) {
      const activeProject = store.getters.getActiveProject;
      const selectedTask = activeProject.tasks.find((x) => x.selected) as ITask;
      selectedTask.subtasks.push({
         id: Math.random().toString(),
         isCompleted: false,
         selected: false,
         text: "New subtask",
      });
   },
   hideTaskDetails(state: IState) {
      state.showTaskDetails = false;
   },
   selectProjectById(state: IState, id: string) {
      // console.log("Active project id", id);
      state.activeProjectId = id;
   },
   openProjectDialog(state: IState, id?: string) {
      state.newProjectDialog = true;
   },
   createNewProject(state: IState, projectName: string) {
      state.newProjectDialog = false;
      state.projects.push({
         id: Math.random().toString(),
         startDate: getStartDate(),
         endDate: getEndDate(),
         links: [],
         name: projectName,
         tasks: [],
         users: [{ id: "-1", img: "", name: "Unassigned", noOfRows: 8, startRow: 5, endRow: 13, email: "" }],
      });
      state.activeProjectId = state.projects.slice(-1)[0].id;
   },
   scrollToToday() {
      const activeProject = store.getters.getActiveProject;
      const allDates = getCompleteDateList(activeProject.startDate, activeProject.endDate);
      const colNo = allDates.findIndex((x) => compareDates(x, new Date()));
      const width = colNo * 38;
      const grid = document.querySelector("#grid-wrapper");
      grid?.scrollTo({ left: width, behavior: "smooth" });
      // console.log(width, "widthg");
   },
   toggleCompleteTask() {
      const activeProject = store.getters.getActiveProject;
      const activeTask = activeProject.tasks.find((x) => x.selected);
      if (activeTask) {
         activeTask.completed = !activeTask.completed;
      }
   },
   addUserToActiveProject(state: IState, userId: string) {
      const user = state.allUsers.find((x) => x.id === userId);
      const activeProject = store.getters.getActiveProject;
      const index = activeProject.users.findIndex((x) => x.id === userId);
      if (index === -1) {
         activeProject.users.splice(-1, 0, { ...user, noOfRows: 1, startRow: 0, endRow: 0 } as IUser);
      } else {
         activeProject.users.splice(index, 1);
      }
      store.commit("onMouseUp", undefined);
   },
   updateTaskText(state: IState, { id, text }: { text: string; id: string }) {
      const activeTask = store.getters.getActiveProject.tasks.find((x) => x.id === id);
      // console.log("Update task called");
      if (activeTask) {
         console.log("Task text changed");
         activeTask.text = text;
      }
   },
   changeTaskFile(state: IState, { e, id }: { id: string; e: Event }) {
      console.log(e, "Event");
      const file = (e.target as HTMLInputElement).files![0];
      const activeProject = store.getters.getActiveProject;
      const task = activeProject.tasks.find((x) => x.selected) as ITask;
      //@ts-ignore
      const objectURL = URL.createObjectURL(file);
      task.fileList.push({ url: objectURL, name: file.name });
   },
   deleteSubtask(state: IState, subTaskId: string) {
      const activeProject = store.getters.getActiveProject;
      const task = activeProject.tasks.find((x) => x.selected) as ITask;
      const subtaskIndex = task.subtasks.findIndex((x) => x.id === subTaskId);
      task.subtasks.splice(subtaskIndex, 1);
   },
   removeFile(state: IState, fileName: string) {
      const activeProject = store.getters.getActiveProject;
      const task = activeProject.tasks.find((x) => x.selected) as ITask;
      const fileIndex = task.fileList.findIndex((x) => x.name === fileName);
      task.fileList.splice(fileIndex, 1);
   },
   removeTask(state: IState, taskId: string) {
      const activeProject = store.getters.getActiveProject;
      const taskIndex = activeProject.tasks.findIndex((x) => x.id === taskId);
      activeProject.tasks.splice(taskIndex, 1);
      activeProject.links = activeProject.links.filter((x) => x.task1 !== taskId && x.task2 !== taskId);
   },
};
export const getStartDate = () => {
   const dateNow = new Date();
   dateNow.setMonth(dateNow.getMonth() - 3);
   return dateNow;
};
export const getEndDate = () => {
   const dateNow = new Date();
   dateNow.setMonth(dateNow.getMonth() + 3);
   return dateNow;
};
const initialState: IState = {
   mouseDownPos: { x: 0, y: 0 },
   activeProjectId: "0",
   mouse: { x: 0, y: 0 },
   gridScrollX: 0,
   currentUserId: "1",
   showTaskDetails: false,
   taskMoved: false,
   newProjectDialog: false,
   allUsers: [
      {
         id: "0",
         img: "https://thumbs.dreamstime.com/b/handsome-man-black-suit-white-shirt-posing-studio-attractive-guy-fashion-hairstyle-confident-man-short-beard-125019349.jpg",
         name: "Jake Gyllenhaal",
         email: "dianelarsson@email..com",
      },
      {
         id: "1",
         img: "https://media.istockphoto.com/photos/smiling-indian-man-looking-at-camera-picture-id1270067126?k=20&m=1270067126&s=612x612&w=0&h=ZMo10u07vCX6EWJbVp27c7jnnXM2z-VXLd-4maGePqc=",
         name: "Llewyn Davies",

         email: "mariakovalchuk@email.com",
      },
      {
         id: "2",
         img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiewXcyqeDVxaqnyVt9fWQJ8FWlm3YZ0yY6A&usqp=CAU",
         name: "Maria Kovalchuk",
         email: "llewyndavies@email..com",
      },
      {
         id: "3",
         img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiewXcyqeDVxaqnyVt9fWQJ8FWlm3YZ0yY6A&usqp=CAU",
         name: "Maria Kovalchuk",
         email: "llewyndavies@email..com",
      },
   ],
   projects: [
      {
         id: "1",
         startDate: getStartDate(),
         endDate: getEndDate(),
         links: [],
         name: "Project 2",
         tasks: [],
         users: [{ id: "-1", img: "", name: "Unassigned", noOfRows: 8, startRow: 5, endRow: 13, email: "" }],
      },
      {
         id: "2",
         startDate: getStartDate(),
         endDate: getEndDate(),
         links: [],
         name: "Project 3",
         tasks: [],
         users: [{ id: "-1", img: "", name: "Unassigned", noOfRows: 8, startRow: 5, endRow: 13, email: "" }],
      },
      {
         id: "0",
         startDate: getStartDate(),
         endDate: getEndDate(),
         name: "First project",
         users: [
            {
               id: "0",
               img: "https://thumbs.dreamstime.com/b/handsome-man-black-suit-white-shirt-posing-studio-attractive-guy-fashion-hairstyle-confident-man-short-beard-125019349.jpg",
               name: "Jake Gyllenhaal",
               noOfRows: 1,
               startRow: 1,
               endRow: 2,
               email: "dianelarsson@email..com",
            },
            {
               id: "1",
               img: "https://media.istockphoto.com/photos/smiling-indian-man-looking-at-camera-picture-id1270067126?k=20&m=1270067126&s=612x612&w=0&h=ZMo10u07vCX6EWJbVp27c7jnnXM2z-VXLd-4maGePqc=",
               name: "Llewyn Davies",

               noOfRows: 1,
               startRow: 2,
               endRow: 3,
               email: "mariakovalchuk@email.com",
            },
            {
               id: "2",
               img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiewXcyqeDVxaqnyVt9fWQJ8FWlm3YZ0yY6A&usqp=CAU",
               name: "Maria Kovalchuk",
               startRow: 3,
               endRow: 4,
               noOfRows: 1,
               email: "llewyndavies@email..com",
            },
            {
               id: "3",
               img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiewXcyqeDVxaqnyVt9fWQJ8FWlm3YZ0yY6A&usqp=CAU",
               name: "Maria Kovalchuk",
               startRow: 3,
               endRow: 4,
               noOfRows: 1,
               email: "llewyndavies@email..com",
            },

            { id: "-1", img: "", name: "Unassigned", noOfRows: 8, startRow: 5, endRow: 13, email: "" },
         ],
         tasks: [
            {
               fileList: [],
               completed: false,
               startCol: 1,
               row: 1,
               endCol: 9,
               selected: false,
               text: "Task 1",
               id: "0",
               userId: "0",
               subtasks: [
                  { isCompleted: true, text: "Do this", id: Math.random().toString(), selected: false },
                  { isCompleted: false, text: "Do that", id: Math.random().toString(), selected: false },
                  { isCompleted: false, text: "Don’t do this", id: Math.random().toString(), selected: false },
               ],
            },
            {
               fileList: [],
               startCol: 11,
               row: 2,
               endCol: 17,
               selected: false,
               text: "Task 2",
               id: "1",
               userId: "1",
               subtasks: [],
               completed: false,
            },
            {
               fileList: [],
               startCol: 19,
               row: 3,
               endCol: 25,
               selected: false,
               text: "Task 3",
               id: "2",
               userId: "2",
               subtasks: [],
               completed: false,
            },
            {
               fileList: [],
               startCol: 29,
               row: 1,
               endCol: 40,
               selected: false,
               text: "Task r",
               id: "3",
               userId: "0",
               subtasks: [],
               completed: false,
            },
         ],
         links: [
            {
               task1: "0",
               task2: "1",
               id: "0",
               point1: [0, 0],
               point2: [0, 0],
               midPoint: [0, 0],
               path: "",
               trianglePoints: "",
            },
            {
               task1: "1",
               task2: "2",
               id: "1",
               point1: [0, 0],
               point2: [0, 0],
               midPoint: [0, 0],
               path: "",
               trianglePoints: "",
            },
            {
               task1: "2",
               task2: "3",
               id: "2",
               point1: [0, 0],
               point2: [0, 0],
               midPoint: [0, 0],
               path: "",
               trianglePoints: "",
            },
            // {
            //    task1: "1",
            //    task2: "2",
            //    id: "1",
            //    point1: [0, 0],
            //    point2: [0, 0],
            //    midPoint: [0, 0],
            //    path: "",
            //    trianglePoints: "",
            // },
            // {
            //    task1: "1",
            //    task2: "3",
            //    id: "2",
            //    point1: [0, 0],
            //    point2: [0, 0],
            //    midPoint: [0, 0],
            //    path: "",
            //    trianglePoints: "",
            // },
         ],
      },
   ],
};

const store = new Vuex.Store({
   state: initialState,
   getters,
   mutations,
   actions: {},
   modules: {},
}) as MyStore;

export type GettersType = { [k in keyof typeof getters]: ReturnType<typeof getters[k]> };
type TempCommitType = { [k in keyof typeof mutations]: (name: k, payload: Parameters<typeof mutations[k]>[1]) => void };
export type CommitType = UnionToIntersection<TempCommitType[keyof TempCommitType]>;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export default store;
