<template>
  <v-app id="inspire">
    <v-tabs v-model="tab" background-color="#1e88e5" dark>
      <v-tab>Apply Leave</v-tab>
      <v-tab>View History</v-tab>

      <v-tab-item>
        <v-card flat tile>
          <v-container fluid>
            <v-row align="center">
              <v-col class="d-flex" cols="12" md="2">
                <v-select :items="items" label="Leave Type"></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-date-picker
                  v-model="dates"
                  range
                  :no-title="notitle"
                  :allowed-dates="holidaysDates"
                  :events="functionEvents"
                ></v-date-picker>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-btn depressed color="primary">Apply Leave</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-app id="inspire">
          <v-data-table
            :fixed-header="fixedHeader"
            :headers="headers"
            :items="leavesData"
            :sort-by="['calories', 'fat']"
            :sort-desc="[false, true]"
            :event-color="date => (date[9] % 2 ? 'red' : 'yellow')"
            :events="functionEvents"
            multi-sort
            class="elevation-1"
          >
            <template v-slot:item.action="{ item }">
              <v-icon small @click="deleteItem(item)">delete</v-icon>
            </template>
          </v-data-table>
        </v-app>
      </v-tab-item>
    </v-tabs>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import leaves from "@/store/modules/leaves-store";
import moment from "moment";
import {
  PublicHolidayResponse,
  AppliedLeavesResponse,
  RangeLeaves,
  CombinedLeave,
  LeaveType
} from "@/store/models/models";
import { Computed } from "vuex";

@Component
export default class ApplyLeave extends Vue {
  dateformat = "yyyy-MM-dd";
  max = "2020-10-20";
  min = "";
  tab = null;
  dates = [];
  items = Object.keys(LeaveType).map((k: any) => LeaveType[k].toUpperCase());
  leavesData: AppliedLeavesResponse[] = [];
  publicHolidaysDates: any[] = [];
  leavesTakenDates: any[] = [];

  fixedHeader = false;
  notitle = true;
  headers = [
    {
      text: "ID",
      align: "left",
      value: "id",
      width: "1%"
    },
    { text: "Type", align: "left", value: "type", width: "1%" },
    { text: "Date", align: "left", value: "date", width: "1%" },
    { text: "Action", align: "left", value: "action", width: "1%" }
  ];

  beforeCreate() {
    leaves.getPublicHoliday().then(publicholidays => {
      if (publicholidays) {
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

    if (this.publicHolidaysDates.indexOf(val) > -1) {
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

    leaves.forEach(data => {
      combinedData.push({
        date: data.date,
        type: data.type
      });
    });

    console.log("public holidays", holidays);
    if (holidays) {
      holidays.forEach(data => {
        combinedData.push({
          date: data.date,
          type: "PublicHoliday"
        });
      });
    }

    console.log("Combined DAta", combinedData);

    combinedData = this.sortCombinedData(combinedData);
    console.log("Combined DAta after sort", combinedData);
    combinedData.concat(this.populateWeekends(combinedData));

    let groupedLeaves = this.splitSickLeavesAndVacation(combinedData);

    // console.log("Combined DAta getting weekends", combinedData);
    //  this.preparedRangedData(combinedData);
    console.log("Range data", groupedLeaves);

    this.removeUnnecessaryWeekends(groupedLeaves);
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
          date: momentSaturdayDay.clone().format("YYYY-MM-DD"),
          type: "Weekend"
        });
      }
      let momentSundayDay = startDate2.clone();

      while (momentSundayDay.day(7).isBefore(endData)) {
        combinedData.push({
          date: momentSundayDay.clone().format("YYYY-MM-DD"),
          type: "Weekend"
        });
      }
    }
    console.log("Before first saturday", combinedData);

    this.sortCombinedData(combinedData);
    this.getFirstSaturday(combinedData);
    this.sortCombinedData(combinedData);

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
          date: previousSaturday.clone().format("YYYY-MM-DD"),
          type: "Weekend"
        });

        console.log("After first saturday", combinedData);

        return this.sortCombinedData(combinedData);
      }
    } else return [];
  }

  preparedRangedData(combinedData: CombinedLeave[]): RangeLeaves[] {
    let groupedLeaves: RangeLeaves[] = [];

    let leaveType: string[] = [];

    if (combinedData.length === 0) {
      return [];
    }
    if (combinedData.length === 1) {
      groupedLeaves.push({
        startDate: combinedData[0].date,
        endDate: combinedData[0].date,
        type: [combinedData[0].type]
      });
    } else {
      let startindexCounter = 0;
      for (let index = 0; index < combinedData.length - 1; index++) {
        let tempStartDate = moment(combinedData[index].date);
        let tempEndDate = moment(combinedData[index + 1].date);

        if (tempEndDate.diff(tempStartDate, "days") === 1) {
          leaveType.push(combinedData[index].type);
          if (index === combinedData.length - 2) {
            let rangeLeave = new RangeLeaves();
            rangeLeave.startDate = combinedData[startindexCounter].date;
            rangeLeave.endDate = combinedData[index + 1].date;
            leaveType.push(combinedData[index + 1].type);
            rangeLeave.type = leaveType;

            groupedLeaves.push(rangeLeave);

            leaveType = [];
            startindexCounter = index + 1;
          } else {
            continue;
          }
        } else {
          let rangeLeave = new RangeLeaves();
          leaveType.push(combinedData[index].type);
          rangeLeave.startDate = combinedData[startindexCounter].date;
          rangeLeave.endDate = combinedData[index].date;
          rangeLeave.type = leaveType;
          groupedLeaves.push(rangeLeave);
          leaveType = [];
          startindexCounter = index + 1;
        }
      }
    }
    return groupedLeaves;
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

    let sickLeave: RangeLeaves[] = this.preparedRangedData(sickTest);

    let vacationWithWeekend: RangeLeaves[] = this.preparedRangedData(
      vacationTest
    );

    return sickLeave.concat(vacationWithWeekend);
  }

  removeUnnecessaryWeekends(groupedLeaves: RangeLeaves[]) {
    let finalGroupedData: RangeLeaves[] = [];
    if (groupedLeaves.length > 0) {
      groupedLeaves.forEach((data: RangeLeaves) => {
        if (data.type.indexOf("sick") > 0) {
          finalGroupedData.push(data);
        } else if (data.type.length > 2) {
          console.log("test");
        } else {
          console.log("test");
        }
      });
    }
    return finalGroupedData;
  }
}
</script>

<style></style>
