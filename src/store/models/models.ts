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

  constructor() {
    this.startDate = "";
    this.endDate = "";
    this.type = [];
  }
}

export enum LeaveType {
  SICK = "sick",
  VACATION = "vacation"
}
