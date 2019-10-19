<template>
  <v-app id="inspire">
    <v-tabs v-model="tab" background-color="#1e88e5" dark>
      <v-tab>Apply Leave</v-tab>
      <v-tab>View History</v-tab>

      <v-tab-item>
        <v-form>
          <v-card flat tile>
            <v-container fluid>
              <v-row align="center">
                <v-col class="d-flex" cols="12" md="2">
                  <v-select v-model="leaveType" :items="items" label="Leave Type"></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="4">
                  <v-date-picker v-model="dates" range :no-title="notitle" :events="functionEvents"></v-date-picker>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="4">
                  <v-btn
                    depressed
                    color="primary"
                    @click.prevent="applyLeave()"
                    :disabled="isFormValid() && userObj !== null"
                  >Apply Leave</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </v-tab-item>

      <v-tab-item>
        <v-app id="inspire">
          <v-data-table
            v-model="selected"
            :fixed-header="fixedHeader"
            :headers="headers"
            :items="finalGrouping"
            :sort-desc="[false, true]"
            :event-color="date => (date[9] % 2 ? 'red' : 'yellow')"
            :events="functionEvents"
            show-expand
            item-key="startDate"
            class="elevation-1"
            show-select
            :rowVal="rowVal"
            @item-selected="parentCheckboxChanged"
          >
            <!-- <template v-slot:item.action="{ item }">
              <v-icon small @click="deleteItem(item)">delete</v-icon>
            </template>-->
            <template
              v-slot:expanded-item="{ item }"
              :colspan="headers.length"
              style="margin-bottom: -30px"
            >
              <!-- <tr v-for="singleItem in item.leaveRange">
              <td>-->
              <td></td>
              <td :colspan="headers.length">
                <v-checkbox
                  v-for="singleItem in item.leaveRange"
                  v-model="individualItem"
                  :value="singleItem.id"
                  :label="singleItem.date"
                  dense
                  style="margin-bottom: -25px"
                  @change="childChanged(item)"
                />
              </td>
              <!-- </td>
                <td>{{singleItem.date}}</td>
                <td>{{singleItem.type}}</td>
              </tr>-->
            </template>
          </v-data-table>

          <!-- <v-simple-table fixed-header>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Start Date</th>
                  <th class="text-left">End Date</th>
                  <th class="text-left">Type</th>
                  <th class="text-left"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in finalGrouping" :key="item.startDate">
                  <td>
                    <v-checkbox v-model="checkboxVal" :value="item.leaveRange"></v-checkbox>
                  </td>
                  <td>{{ item.startDate }}</td>
                  <td>{{ item.endDate }}</td>
                  <td>{{ item.type[0] }}</td>
                  <td>
                    <tr>{{ item.leaveRange[0].date }}</tr>
                    <tr>{{ item.leaveRange[0].date }}</tr>
                    <tr>{{ item.leaveRange[0].date }}</tr>
                    <tr>{{ item.leaveRange[0].date }}</tr>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>-->
          <v-col cols="12" md="3">
            <v-btn color="error" @click.prevent="deleteLeaves()">Delete</v-btn>
          </v-col>
        </v-app>
      </v-tab-item>
    </v-tabs>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import leaves from "@/store/modules/leaves-store";
import moment from "moment";
import user from "@/store/modules/user.ts";
import {
  PublicHolidayResponse,
  AppliedLeavesResponse,
  RangeLeaves,
  CombinedLeave,
  LeaveType,
  Leaves
} from "@/store/models/models";
import { Computed } from "vuex";
import LeaveUtils from "@/components/commons/LeaveUtil";

@Component
export default class ApplyLeave extends Vue {
  dateformat = "yyyy-MM-dd";
  max = "2020-10-20";
  min = "";
  tab = null;
  dates = [];
  leaveType = "";
  items = ["Sick", "Vacation"]; //Object.keys(LeaveType).map((k: any) => LeaveType[k].toUpperCase());
  leavesData: AppliedLeavesResponse[] = [];
  publicHolidaysDates: any[] = [];
  leavesTakenDates: any[] = [];

  finalGrouping: RangeLeaves[] = [];
  checkboxVal: any[] = [];
  userObj = user.userObject;

  completeLeaveList: string[] = [];

  fixedHeader = false;
  notitle = true;
  headers = [
    { text: "Start date", align: "left", value: "startDate" },
    { text: "End date", align: "left", value: "endDate" },
    { text: "Type", align: "left", value: "type" },
    { text: "", align: "left", value: "data-table-expand" }
  ];

  selected = [];
  rowVal = [];
  individualItem: any[] = [];

  beforeCreate() {
    leaves.getPublicHoliday().then(publicholidays => {
      if (publicholidays) {
        LeaveUtils.groupPublicHolidays(publicholidays);
        console.log("Before create", publicholidays);
        publicholidays.forEach((val: any) => {
          console.log("Value", val.date);

          this.publicHolidaysDates.push(val.date);
        });
      }
      console.log("publicHolidaysDates", this.publicHolidaysDates);

      this.combineLeavesAndHoliday(
        leaves.leavesSummary,
        leaves.publicHolidaysList
      );
    });
  }
  created() {
    console.log("Leaves summary", leaves.leavesSummary);
    this.leavesData = leaves.leavesSummary;

    this.leavesData.forEach(data => {
      this.leavesTakenDates.push(data.date);
    });

    this.min = moment(new Date()).format(this.dateformat);
  }

  holidaysDates(val: any) {
    // console.log("Allowed", val);

    if (this.completeLeaveList.indexOf(val) > -1) {
      return 0;
    } else {
      return 1;
    }
    // console.log("Only datess", this.publicHolidays);
  }

  functionEvents(date: string) {
    let colorcode: any[] = [];

    if (this.leavesTakenDates.indexOf(date) > -1) {
      colorcode.push("green");
    } else if (this.publicHolidaysDates.indexOf(date) > -1) {
      colorcode.push("blue");
    }

    return colorcode;
  }
  deleteItem(item: any) {}

  getLeaveRange() {}

  combineLeavesAndHoliday(
    leaves: AppliedLeavesResponse[],
    holidays: PublicHolidayResponse[] | null
  ) {
    let combinedData: CombinedLeave[] = [];
    let sickDays: CombinedLeave[] = [];
    let vacationDays: CombinedLeave[] = [];

    leaves.forEach(data => {
      if (data.type === "vacation") {
        vacationDays.push({
          id: data.id,
          date: data.date,
          type: data.type
        });
      } else if (data.type === "sick") {
        sickDays.push({ id: data.id, date: data.date, type: data.type });
      }
      // combinedData.push({
      //   date: data.date,
      //   type: data.type
      // });
    });

    console.log("Sick days", sickDays);
    console.log("vacation days", vacationDays);

    console.log("public holidays");
    if (holidays) {
      holidays.forEach(data => {
        sickDays.push({
          id: -1,
          date: data.date,
          type: "PublicHoliday"
        });

        vacationDays.push({
          id: -1,
          date: data.date,
          type: "PublicHoliday"
        });
      });
    }

    // console.log("Combined DAta", combinedData);

    // combinedData = this.sortCombinedData(combinedData);

    this.sortCombinedData(sickDays);
    this.sortCombinedData(vacationDays);

    console.log("Combined Data after sort", combinedData);
    sickDays.concat(this.populateWeekends(sickDays));
    vacationDays.concat(this.populateWeekends(vacationDays));

    this.completeLeaveList = sickDays.map(data => data.date);
    this.completeLeaveList.concat(vacationDays.map(data => data.date));

    let groupedSickLeaves = LeaveUtils.preparedRangedData(
      sickDays,
      user.userObject ? user.userObject.id : -1
    );
    let groupedVacationLeaves = LeaveUtils.preparedRangedData(
      vacationDays,
      user.userObject ? user.userObject.id : -1
    );

    console.log("Combined DAta getting weekends", combinedData);
    //  this.preparedRangedData(combinedData);
    console.log("Range data groupedSickLeaves", groupedSickLeaves);
    console.log("Range data groupedVacationLeaves", groupedVacationLeaves);

    groupedSickLeaves = LeaveUtils.cleanupVacationLeaves(groupedSickLeaves);
    groupedVacationLeaves = LeaveUtils.cleanupVacationLeaves(
      groupedVacationLeaves
    );

    this.finalGrouping = groupedSickLeaves.concat(groupedVacationLeaves);
  }

  sortCombinedData(combinedData: CombinedLeave[]): CombinedLeave[] {
    combinedData.sort((date1, date2) => {
      return date1.date > date2.date ? 1 : -1;
    });

    return combinedData;
  }

  populateWeekends(combinedData: CombinedLeave[]): CombinedLeave[] {
    let startDate = moment(combinedData[0].date);
    let startDate2 = moment(combinedData[0].date);
    let endData = moment(combinedData[combinedData.length - 1].date);
    let result: CombinedLeave[] = [];

    if (endData.diff(startDate, "days") > 1) {
      let momentSaturdayDay = startDate.clone();
      while (momentSaturdayDay.day(13).isBefore(endData)) {
        combinedData.push({
          id: -1,
          date: momentSaturdayDay.clone().format("YYYY-MM-DD"),
          type: "Weekend"
        });
      }
      let momentSundayDay = startDate2.clone();

      while (momentSundayDay.day(7).isBefore(endData)) {
        combinedData.push({
          id: -1,
          date: momentSundayDay.clone().format("YYYY-MM-DD"),
          type: "Weekend"
        });
      }
    }
    console.log("Before first saturday", combinedData);

    this.sortCombinedData(combinedData);
    this.getFirstSaturday(combinedData);

    return combinedData;
  }

  getFirstSaturday(combinedData: CombinedLeave[]) {
    if (combinedData && combinedData.length > 1) {
      let firstDay = moment(combinedData[0].date);

      let firstWeekendIndex = -1;

      for (let index = 0; index <= combinedData.length - 1; index++) {
        if (combinedData[index].type === "Weekend") {
          firstWeekendIndex = index;
          break;
        }
      }

      if (firstWeekendIndex !== -1) {
        let firstSunday = moment(combinedData[firstWeekendIndex].date);

        let previousSaturday = firstSunday.subtract(1, "days");
        combinedData.push({
          id: -1,
          date: previousSaturday.clone().format("YYYY-MM-DD"),
          type: "Weekend"
        });

        console.log("After first saturday", combinedData);
        return this.sortCombinedData(combinedData);
      }
    } else return [];
  }

  splitSickLeavesAndVacation(combinedData: CombinedLeave[]) {
    let sickTest: CombinedLeave[] = [];
    let vacationTest: CombinedLeave[] = [];

    // sickTest.concat(
    //   combinedData.filter(data => {
    //     data.type === "sick";
    //   })
    // );

    combinedData.forEach(data => {
      if (data.type === "sick") {
        sickTest.push(data);
      } else {
        vacationTest.push(data);
      }
    });

    let sickLeave: RangeLeaves[] = LeaveUtils.preparedRangedData(
      sickTest,
      user.userObject ? user.userObject.id : -1
    );

    let vacationWithWeekend: RangeLeaves[] = LeaveUtils.preparedRangedData(
      vacationTest,
      user.userObject ? user.userObject.id : -1
    );

    return sickLeave.concat(vacationWithWeekend);
  }

  isFormValid() {
    if (this.leaveType && this.dates && this.dates.length > 0) {
      return false;
    }
    return true;
  }

  applyLeave() {
    console.log("completeLeaveList", this.completeLeaveList);
    let leaveType = this.leaveType;
    let leaveRange = this.dates;

    let appliedLeaveDates: Leaves[] = [];
    let endAppliedDate = null;

    let startAppliedDate = moment(leaveRange[0]);

    console.log("leaveRange[0]", leaveRange[0], startAppliedDate);

    if (leaveRange.length > 1) {
      endAppliedDate = moment(leaveRange[1]);
      console.log("endAppliedDate", leaveRange[1], endAppliedDate);

      if (startAppliedDate.isAfter(endAppliedDate)) {
        let tempDate = startAppliedDate;
        startAppliedDate = endAppliedDate;
        endAppliedDate = tempDate;
      }

      while (startAppliedDate.clone().isSameOrBefore(endAppliedDate)) {
        let tempDate = startAppliedDate.clone().format("YYYY-MM-DD");
        console.log("tempDate", tempDate);

        if (this.completeLeaveList.indexOf(tempDate) === -1) {
          appliedLeaveDates.push({
            userId: user.userObject ? user.userObject.id : -1,
            date: tempDate,
            type: leaveType.toLowerCase()
          });
        }
        startAppliedDate.add(1, "days");
      }

      if (user.userObject) {
        console.log("appliedLeaveDates", appliedLeaveDates);
        leaves.applySubmittedLeave(appliedLeaveDates);
      }
    } else {
      let submittedLeave = {} as Leaves;

      let leavesArray: Leaves[] = [];

      submittedLeave.userId = user.userObject ? user.userObject.id : -1;
      submittedLeave.date = leaveRange[0];
      submittedLeave.type = leaveType.toLowerCase();

      leavesArray.push(submittedLeave);

      leaves.applySubmittedLeave(leavesArray);
    }
  }
  parentCheckboxChanged(val: any) {
    if (val.value) {
      val.item.leaveRange.map((data: any) => {
        if (this.individualItem.indexOf(data.id) === -1)
          this.individualItem.push(data.id);
      });
      // this.individualItem.push(
      //   val.item.leaveRange.map(data => {
      //     data.id;
      //   })
      // );
    } else {
      val.item.leaveRange.map((data: any) => {
        let index = this.individualItem.indexOf(data.id);

        if (index > -1) {
          this.individualItem.splice(index, 1);
        }
      });
    }
    console.log(val);
  }

  childChanged(val: any) {
    let index = this.selected.indexOf(val);
    if (index > -1) {
      this.selected.splice(index, 1);
    }
  }
  deleteLeaves() {
    leaves.deleteLeaves(this.individualItem.toString());
  }
}
</script>

<style></style>
