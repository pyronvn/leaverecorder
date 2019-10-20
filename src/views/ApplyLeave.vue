<template>
  <v-app id="applyleave">
    <div v-if="showSnackbar">
      <Snackbar :color="color" :text="text"></Snackbar>
    </div>
    <v-tabs v-model="tab" background-color="#1e88e5" dark lazy>
      <v-tab>Apply Leave</v-tab>
      <v-tab>View History</v-tab>

      <v-tab-item lazy>
        <div>
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
                    <v-card flat>
                      <v-list-item three-line>
                        <v-list-item-content>
                          <v-row>
                            <v-col>
                              <v-date-picker
                                range
                                :min="new Date().toISOString().substr(0, 10)"
                                :max="lastDateOfThisYear"
                                :no-title="notitle"
                                v-model="dates"
                                :events="functionEvents"
                                :allowed-dates="holidaysDates"
                              ></v-date-picker>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col align="center" justify="center">
                              <ul class="legend">
                                <li>
                                  <span class="publicHolidays"></span>
                                  Public Holiday
                                </li>
                                <li>
                                  <span class="leaves"></span>
                                  Leaves
                                </li>
                              </ul>
                            </v-col>
                          </v-row>
                        </v-list-item-content>
                      </v-list-item>
                    </v-card>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="4">
                    <v-btn
                      depressed
                      color="primary"
                      @click.prevent="applyLeave()"
                      :disabled="isFormInValid() && userObj !== null"
                    >Apply Leave</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-form>
        </div>
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
                  :disabled="disablePreviousDay(singleItem.date)"
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
            <v-btn
              color="error"
              :disabled="!individualItem.length > 0"
              @click.prevent="deleteLeaves()"
            >Delete</v-btn>
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
import Snackbar from "@/components/commons/Snackbar.vue";

@Component({
  components: {
    Snackbar
  }
})
export default class ApplyLeave extends Vue {
  dateformat = "yyyy-MM-dd";
  // lastDateOfThisYear = moment(
  //   new Date(new Date().getFullYear(), 11, 31).toString()
  // ).format("YYYY-MM-DD");
  lastDateOfThisYear = new Date().getFullYear() + "-12-31";
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

  showSnackbar = false;
  color = "";
  text = "";

  beforeCreate() {}
  created() {
    console.log("lastDateOfThisYear", this.lastDateOfThisYear);

    this.initialisePage();
  }

  initialisePage() {
    this.showSnackbar = false;
    leaves
      .getAppliedLeaves(user.userObject ? user.userObject.id : -1)
      .then(resp => {
        this.completeLeaveList = [];
        leaves.getPublicHoliday().then(
          publicholidays => {
            if (publicholidays) {
              LeaveUtils.groupPublicHolidays(publicholidays);
              console.log("Before create", publicholidays);
              publicholidays.forEach((val: any) => {
                console.log("Value", val.date);

                this.publicHolidaysDates.push(val.date);
              });
            }
            console.log("publicHolidaysDates", this.publicHolidaysDates);

            this.finalGrouping = LeaveUtils.combineLeavesAndHoliday(
              leaves.leavesSummary,
              leaves.publicHolidaysList
            );

            this.completeLeaveList = LeaveUtils.completeLeaveList;

            this.updateCalendar();
          },
          (error: any) => {
            this.color = "error";
            this.text = "Something went wrong";
            this.showSnackbar = true;
          }
        );
      });
  }

  updateCalendar() {
    this.leavesData = [];
    this.leavesTakenDates = [];
    console.log("Leaves summary", leaves.leavesSummary);
    this.leavesData = leaves.leavesSummary;

    this.leavesData.forEach(data => {
      this.leavesTakenDates.push(data.date);
    });
  }

  holidaysDates(val: any) {
    console.log("Allowed", val);

    if (LeaveUtils.completeLeaveList.indexOf(val) > -1) {
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

  isFormInValid() {
    if (this.leaveType && this.dates && this.dates.length > 0) {
      return false;
    }
    return true;
  }

  applyLeave() {
    console.log("completeLeaveList", this.completeLeaveList);
    this.showSnackbar = false;

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
    } else {
      let submittedLeave = {} as Leaves;
      this.showSnackbar = false;

      submittedLeave.userId = user.userObject ? user.userObject.id : -1;
      submittedLeave.date = leaveRange[0];
      submittedLeave.type = leaveType.toLowerCase();

      appliedLeaveDates.push(submittedLeave);
    }

    if (this.verifyLeaveCount(leaveType, appliedLeaveDates)) {
      if (user.userObject) {
        console.log("appliedLeaveDates", appliedLeaveDates);
        leaves.applySubmittedLeave(appliedLeaveDates).then(
          (resp: any) => {
            this.initialisePage();
            this.color = "green";
            this.text = "Leave applied successfully!";
            this.showSnackbar = true;

            this.leaveType = "";
            this.dates = [];
          },
          (error: any) => {
            this.color = "error";
            this.text = "Leave applied successfully!";
            this.showSnackbar = true;
          }
        );
      }
    } else {
      this.color = "error";
      this.text = "You dont jave sufficient leaves";
      this.showSnackbar = true;
    }
  }
  parentCheckboxChanged(val: any) {
    if (val.value) {
      val.item.leaveRange.map((data: AppliedLeavesResponse) => {
        if (!this.disablePreviousDay(data.date)) {
          if (this.individualItem.indexOf(data.id) === -1)
            this.individualItem.push(data.id);
        }
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
    this.showSnackbar = false;
    leaves.deleteLeaves(this.individualItem.toString()).then(
      resp => {
        this.initialisePage();
        this.text = "Leaves delete successfully!";
        this.color = "green";
        this.showSnackbar = true;
      },
      (error: any) => {
        this.text = "Some thing went wrong";
        this.color = "error";
        this.showSnackbar = true;
      }
    );
  }

  disablePreviousDay(date: string) {
    if (moment(date).isBefore(moment())) {
      return true;
    } else return false;
  }

  verifyLeaveCount(leaveType: string, appliedLeaveDates: any[]) {
    if (user.userObject) {
      if (leaveType.toLowerCase() === LeaveType.SICK) {
        if (appliedLeaveDates.length > user.userObject.sickdays) {
          return false;
        }
      }

      if (leaveType.toLowerCase() === LeaveType.VACATION) {
        if (appliedLeaveDates.length > user.userObject.holidays) {
          return false;
        }
      }

      return true;
    }

    return false;
  }
}
</script>

<style scoped>
.legend {
  list-style: none;
}
.legend li {
  float: left;
  margin-right: 10px;
}
.legend span {
  border: 1px solid #ccc;
  float: left;
  width: 12px;
  height: 12px;
  margin: 2px;
}
/* your colors */
.legend .publicHolidays {
  background-color: #2196f3;
}
.legend .leaves {
  background-color: #4caf50;
}
</style>
