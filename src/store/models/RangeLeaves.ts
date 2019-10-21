import { AppliedLeavesResponse } from "@/store/models/AppliedLeaveResponse";

export class RangeLeaves {
  startDate: string;
  endDate: string;
  type: string[];
  leaveRange: AppliedLeavesResponse[];

  constructor() {
    this.startDate = "";
    this.endDate = "";
    this.type = [];
    this.leaveRange = [];
  }
}
