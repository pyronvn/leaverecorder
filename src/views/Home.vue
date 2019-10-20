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
        <SimpleTable :data="publicHolidaysRanged" :title="simpleTableHolidaysTitle"></SimpleTable>
      </v-col>
      <v-col>
        <SimpleTable :data="leaveRanged" :title="simpleTableSickTitle"></SimpleTable>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";
import leaves from "@/store/modules/leaves-store.ts";
import Piechart from "@/components/commons/Piechart.vue";
import SimpleTable from "@/components/commons/SimpleTable.vue";
import {
  AppliedLeavesResponse,
  PublicHolidayResponse,
  RangeLeaves
} from "@/store/models/models";
import LeaveUtils from "@/components/commons/LeaveUtil";
import Snackbar from "@/components/commons/Snackbar.vue";

@Component({
  components: { Piechart, SimpleTable, Snackbar }
})
export default class Home extends Vue {
  piechartVacationLeavesTitle = "Vacation Leaves";
  piechartSickLeavesTitle = "Sick Leaves";

  simpleTableHolidaysTitle = "Holidays";
  simpleTableSickTitle = "Leaves";

  publicHolidaysDates: any[] = [];

  sickLeavesRemaining = 0;
  vacationLeavesRemaining = 0;

  totalSickLeaves = 0;
  totalVacationLeaves = 0;

  sickLeaveTaken = 0;
  vacationLeavesTaken = 0;

  publicHolidaysRanged: PublicHolidayResponse[] = [];
  leaveRanged: RangeLeaves[] = [];

  showSnackbar = false;
  color = "error";
  text = "";
  created() {
    // console.log("Setting leaves", leaves.getAppliedLeaves(user.userObject.id));
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
                console.log("resp", resp);

                console.log(
                  "this.publicHolidaysRanged",
                  this.publicHolidaysRanged
                );

                this.publicHolidaysRanged = resp || [];

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
      console.log(
        "Sick taken, vacation taken -",
        sickLeaveTaken,
        vacationLeaveTaken
      );

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

      console.log(
        "totalSickLeaves totalVacationLeaves this.sickLeavesRemaining this.vacationLeavesRemaining",
        this.totalSickLeaves,
        this.totalVacationLeaves,
        this.sickLeavesRemaining,
        this.vacationLeavesRemaining
      );
    }
  }
}
</script>
