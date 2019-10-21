<template>
  <div>
    <div v-if="showSnackbar">
      <Snackbar :color="color" :text="text"></Snackbar>
    </div>
    <v-row>
      <v-col>
        <Piechart
          :title="piechartVacationLeavesTitle"
          :takenLeaves="vacationLeavesTaken"
          :remainingLeaves="vacationLeavesRemaining"
        ></Piechart>
      </v-col>
      <v-col>
        <Piechart
          :title="piechartSickLeavesTitle"
          :takenLeaves="sickLeaveTaken"
          :remainingLeaves="sickLeavesRemaining"
        ></Piechart>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DataTable
          :data="publicHolidays"
          :title="simpleTableHolidaysTitle"
        ></DataTable>
      </v-col>
      <v-col>
        <DataTable
          :data="leaveRanged"
          :title="simpleTableLeaveTitle"
        ></DataTable>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";
import leaves from "@/store/modules/leaves-store.ts";
import Piechart from "@/components/commons/views/Piechart.vue";
import DataTable from "@/components/commons/views/DataTable.vue";

import LeaveUtils from "@/components/commons/LeaveUtil";
import Snackbar from "@/components/commons/views/Snackbar.vue";
import { PublicHolidayResponse } from "@/store/models/PublicHolidayResponse";
import { RangeLeaves } from "@/store/models/RangeLeaves";
import { AppliedLeavesResponse } from "@/store/models/AppliedLeaveResponse";
import { Constants } from "@/components/commons/Constants";

@Component({
  components: { Piechart, DataTable, Snackbar }
})
export default class Home extends Vue {
  piechartVacationLeavesTitle = Constants.VACATION_LEAVES;
  piechartSickLeavesTitle = Constants.SICK_LEAVES;

  simpleTableHolidaysTitle = Constants.HOLIDAYS;
  simpleTableLeaveTitle = Constants.LEAVES;

  publicHolidaysDates: any[] = [];

  sickLeavesRemaining = 0;
  vacationLeavesRemaining = 0;

  totalSickLeaves = 0;
  totalVacationLeaves = 0;

  sickLeaveTaken = 0;
  vacationLeavesTaken = 0;

  publicHolidays: PublicHolidayResponse[] = [];
  leaveRanged: RangeLeaves[] = [];

  showSnackbar = false;
  color = Constants.COLOR_ERROR;
  text = "";

  /**
   * Populating all leave records count for table and date ranges for the table
   */
  created() {
    if (user.userObject) {
      leaves.getAppliedLeaves(user.userObject.id).then(appliedLeaves => {
        let leaveData = this.calculateLeaveData(appliedLeaves);
        if (leaveData) {
          this.calculateLeaveCountForPiechart(leaveData[0], leaveData[1]);

          leaves.getPublicHoliday().then(
            (publicholidays: any) => {
              if (publicholidays) {
                let resp: any[] = LeaveUtils.groupPublicHolidays(
                  publicholidays
                );
                this.publicHolidays = resp || [];

                this.leaveRanged = LeaveUtils.combineLeavesAndHoliday(
                  leaves.leavesSummary,
                  leaves.publicHolidaysList
                );
              }
            },
            (error: any) => {
              this.text = error;
              this.showSnackbar = true;
              console.error(error.toString());
            }
          );
        }
      }),
        (error: any) => {};
    }
  }

  /**
   * CalCualting number of sick and vacation leaves
   */
  calculateLeaveData(appliedLeaves: AppliedLeavesResponse[] | undefined) {
    let sickLeaveTaken = 0;
    let vacationLeaveTaken = 0;

    if (appliedLeaves) {
      appliedLeaves.filter(val => {
        if (val.type === "sick") {
          sickLeaveTaken++;
        } else if (val.type === "vacation") {
          vacationLeaveTaken++;
        }
      });
      leaves.updateLeaveCount(sickLeaveTaken, vacationLeaveTaken);
      return [sickLeaveTaken, vacationLeaveTaken];
    }
  }

  calculateLeaveCountForPiechart(
    sickLeaveTaken: number,
    vacationLeaveTaken: number
  ) {
    if (user.userObject) {
      this.sickLeavesRemaining = user.userObject.sickdays;
      this.vacationLeavesRemaining = user.userObject.holidays;

      this.sickLeaveTaken = sickLeaveTaken;
      this.vacationLeavesTaken = vacationLeaveTaken;

      this.totalSickLeaves = this.sickLeavesRemaining + this.sickLeaveTaken;
      this.totalVacationLeaves =
        this.vacationLeavesRemaining + this.vacationLeavesTaken;
    }
  }
}
</script>
