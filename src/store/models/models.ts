export interface UserResponse {
  id: number;
  name: string;
  holidays: number;
  sickdays: number;
}

export interface UserOnSubmit {
  userid: string;
}

export interface AppliedLeavesResponse {
  id: number;
  date: string;
  user_id: number;
  type: string;
}

export interface PublicHolidayResponse {
  id: number;
  date: string;
  name: string;
}

export interface CombinedLeave {
  id: number;
  date: string;
  type: string;
}

export interface SnackbarObj {
  text: string;
  color: string;
}

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

export enum LeaveType {
  SICK = "sick",
  VACATION = "vacation"
}

export interface Leaves {
  userId: number;
  type: string;
  date: string;
}

export interface PublicHolidayGrouped {
  startDate: string;
  name: string;
  endDate: string;
}

export interface DeleteLeave {
  ids: string;
}
