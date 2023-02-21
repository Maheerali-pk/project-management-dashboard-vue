<template>
   <div class="wrapper" :class="{ open: open, up: opendir === 'up', down: opendir === 'down' }">
      <div class="body">
         <div class="header">
            <div class="btn">+ Start Date</div>
            <div class="btn">Due Date</div>
         </div>
         <vc-date-picker
            v-if="selectedDatepicker === 0"
            :disabled-dates="{ weekdays: [1, 7] }"
            :first-day-of-week="2"
            v-model="date1"
         >
         </vc-date-picker>
         <vc-date-picker
            v-if="selectedDatepicker === 1"
            :disabled-dates="{ weekdays: [1, 7] }"
            :first-day-of-week="2"
            v-model="date2"
         >
         </vc-date-picker>
      </div>
      <div v-on:click="onIconClick" class="icon">
         <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
               d="M6.78571 2.875H13.2143V1.07812C13.2143 0.48291 13.692 0 14.2857 0C14.8795 0 15.3571 0.48291 15.3571 1.07812V2.875H17.1429C18.7188 2.875 20 4.16201 20 5.75V20.125C20 21.7107 18.7188 23 17.1429 23H2.85714C1.27902 23 0 21.7107 0 20.125V5.75C0 4.16201 1.27902 2.875 2.85714 2.875H4.64286V1.07812C4.64286 0.48291 5.12054 0 5.71429 0C6.30804 0 6.78571 0.48291 6.78571 1.07812V2.875ZM2.14286 20.125C2.14286 20.5203 2.4625 20.8438 2.85714 20.8438H17.1429C17.5357 20.8438 17.8571 20.5203 17.8571 20.125V8.625H2.14286V20.125Z"
               fill="#0F393B"
            />
         </svg>
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

export default Vue.extend({
   name: "TaskDetails",

   data() {
      return { date1: new Date(), date2: new Date(), open: false, opendir: "down", selectedDatepicker: 0 };
   },

   methods: {
      onIconClick() {
         this.open = !this.open;
      },
   },
});
</script>

<style lang="scss"></style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrapper {
   position: relative;
   width: fit-content;

   .body {
      background: #f5f3ee;
      border-radius: 10px;
      z-index: 101;
      display: none;
      position: absolute;
      left: 50%;
      flex-direction: column;
      border: 1px solid #ced9d2;
      .header {
         display: flex;
         width: 100%;
         gap: 1rem;
         .btn {
            text-align: center;
            width: 100%;
            opacity: 0.5;
         }
      }
   }
   &.up {
      .body {
         top: 0px;
         transform: translate(-50%, -100%) !important;
      }
   }
   &.down {
      .body {
         bottom: 0px;
         transform: translate(-50%, 100%) !important;
      }
   }
   .icon {
      display: block;
      cursor: pointer;
   }
   &.open {
      .body {
         display: flex;
      }
   }
}
</style>
