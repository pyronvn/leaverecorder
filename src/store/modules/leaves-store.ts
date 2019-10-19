import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import {
  AppliedLeavesResponse,
  PublicHolidayResponse,
  Leaves
} from "@/store/models/models";
import {
  getAppliedLeaves,
  getPublicHolidays,
  applyLeave,
  deleteLeaves
} from "@/store/api";

@Module({
  namespaced: true,
  name: "leaves",
  store,
  dynamic: true
})
class LeavesModule extends VuexModule {
  leaveResp: AppliedLeavesResponse[] | null = null;
  sickLeaveApplied: number = 0;
  vacationLeaveApplied: number = 0;
  publicHolidays: PublicHolidayResponse[] | null = null;

  get leavesSummary() {
    return this.leaveResp || [];
  }

  get sickLeavesCount() {
    return this.sickLeaveApplied;
  }

  get vacationLeavesCount() {
    return this.vacationLeaveApplied;
  }

  get publicHolidaysList(): PublicHolidayResponse[] | null {
    return this.publicHolidays || null;
  }

  @Mutation
  setAppliedLeaves(appliedLeaves: AppliedLeavesResponse[]) {
    this.leaveResp = appliedLeaves;

    //this.setLeavesCount(appliedLeaves);
  }

  @Action({ commit: "setAppliedLeaves" })
  async getAppliedLeaves(userId: number) {
    const appliedLeaves = await getAppliedLeaves(userId);

    console.log("action getting leaves", appliedLeaves);

    return appliedLeaves;
  }

  @Mutation
  setLeavesCount(leaveTakenCounts: number[]) {
    this.sickLeaveApplied = leaveTakenCounts[0];
    this.vacationLeaveApplied = leaveTakenCounts[1];
  }

  @Action({ commit: "setLeavesCount" })
  updateLeaveCount(sickleave: number, vacationLeave: number) {
    return [sickleave, vacationLeave];
  }

  @Mutation
  setPublicHoliday(publicHolidays: PublicHolidayResponse[]) {
    console.log("Set public holiday", publicHolidays);

    this.publicHolidays = publicHolidays;
  }

  @Action({ commit: "setPublicHoliday" })
  async getPublicHoliday() {
    const publicHolidays = await getPublicHolidays();

    return publicHolidays;
  }

  @Action
  async applySubmittedLeave(appliedLeave: Leaves[]) {
    const resp = await applyLeave(appliedLeave);
  }

  @Action
  async deleteLeaves(leave: string) {
    const resp = await deleteLeaves(leave);
  }
}

export default getModule(LeavesModule);
