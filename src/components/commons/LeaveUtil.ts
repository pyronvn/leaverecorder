import user from "@/store/modules/user.ts";

import moment from "moment";
import { PublicHolidayResponse } from "@/store/models/PublicHolidayResponse";
import { PublicHolidayGrouped } from "@/store/models/PublicHolidayGrouped";
import { RangeLeaves } from "@/store/models/RangeLeaves";
import { CombinedLeave } from "@/store/models/CombinedLeave";
import { AppliedLeavesResponse } from "@/store/models/AppliedLeaveResponse";
import { Constants } from "@/components/commons/Constants";
import { LeaveType } from "@/store/models/LeaveType";

export default class LeaveUtils {
  static completeLeaveList: string[] = [];
  static groupPublicHolidays(publicHoliday: PublicHolidayResponse[]) {
    let result: Map<string, any[]> = this.groupBy(
      publicHoliday,
      obj => obj.name
    );

    return this.getHolidayRanges(result);
  }

  static groupBy<T extends any, K extends keyof T>(
    array: T[],
    key: K | { (obj: T): string }
  ): Map<string, T[]> {
    const keyFn = key instanceof Function ? key : (obj: T) => obj[key];
    return array.reduce(
      (objectsByKeyValue, obj) => {
        const value = keyFn(obj);
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
      },
      {} as Map<string, T[]>
    );
  }

  static getHolidayRanges(result: Map<string, any[]>) {
    let publicHolidaysDateRangeList: PublicHolidayGrouped[] = [];

    Object.keys(result).forEach(key => {
      let element: any[] | undefined = result[key];

      if (element) {
        element.sort((data1, data2) => {
          return (
            new Date(data1.date).getTime() - new Date(data2.date).getTime()
          );
        });

        let pulicHolidaysDateRange = {} as PublicHolidayGrouped;
        pulicHolidaysDateRange.name = key;
        pulicHolidaysDateRange.startDate = element[0].date;
        pulicHolidaysDateRange.endDate = element[element.length - 1].date;
        publicHolidaysDateRangeList.push(pulicHolidaysDateRange);
      }
    });

    return publicHolidaysDateRangeList;
  }

  static custom_sort(a: any, b: any) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }

  static preparedRangedData(
    combinedData: CombinedLeave[],
    id: number
  ): RangeLeaves[] {
    let groupedLeaves: RangeLeaves[] = [];

    let leaveType: string[] = [];

    if (combinedData.length === 0) {
      return [];
    }
    if (combinedData.length === 1) {
      let leaveRange: AppliedLeavesResponse[] = [];
      leaveRange.push({
        id: combinedData[0].id,
        date: combinedData[0].date,
        type: combinedData[0].type,
        user_id: id
      });
      groupedLeaves.push({
        startDate: combinedData[0].date,
        endDate: combinedData[0].date,
        type: [combinedData[0].type],
        leaveRange: leaveRange
      });
    } else {
      let startindexCounter = 0;
      let allLeaves: AppliedLeavesResponse[] = [];

      for (let index = 0; index < combinedData.length - 1; index++) {
        let tempStartDate = moment(combinedData[index].date);
        let tempEndDate = moment(combinedData[index + 1].date);

        if (tempEndDate.diff(tempStartDate, "days") === 1) {
          leaveType.push(combinedData[index].type);
          if (combinedData[index].id > -1) {
            allLeaves.push({
              id: combinedData[index].id,
              date: combinedData[index].date,
              type: combinedData[index].type,
              user_id: id
            });
          }

          if (index === combinedData.length - 2) {
            let rangeLeave = new RangeLeaves();

            rangeLeave.startDate = combinedData[startindexCounter].date;
            rangeLeave.endDate = combinedData[index + 1].date;
            leaveType.push(combinedData[index + 1].type);
            rangeLeave.type = leaveType;
            rangeLeave.leaveRange = allLeaves;
            groupedLeaves.push(rangeLeave);

            leaveType = [];
            allLeaves = [];
            startindexCounter = index + 1;
          } else {
            continue;
          }
        } else {
          // if (
          //   combinedData[index].type === "vacation" ||
          //   combinedData[startindexCounter].type === "sick"
          // ) {
          let rangeLeave = new RangeLeaves();

          leaveType.push(combinedData[index].type);
          if (combinedData[index].id > -1) {
            allLeaves.push({
              id: combinedData[index].id,
              date: combinedData[index].date,
              type: combinedData[index].type,
              user_id: id
            });
          }
          rangeLeave.startDate = combinedData[startindexCounter].date;
          rangeLeave.endDate = combinedData[index].date;
          rangeLeave.type = leaveType;
          rangeLeave.leaveRange = allLeaves;
          groupedLeaves.push(rangeLeave);
          leaveType = [];
          allLeaves = [];
          startindexCounter = index + 1;
        }
      }
      // }
      // }
    }
    return groupedLeaves;
  }

  static cleanupVacationLeaves(groupedLeaves: RangeLeaves[]) {
    let finalGroupedData: RangeLeaves[] = [];
    groupedLeaves.forEach(leaveData => {
      let rangedData = new RangeLeaves();

      if (leaveData.type.indexOf(LeaveType.SICK.toLowerCase()) > -1) {
        let startDate = moment(leaveData.startDate).clone();
        let endDate = moment(leaveData.endDate).clone();

        let startIndex = 0;
        let endIndex = leaveData.type.length - 1;
        // while (startDate.clone().isSameOrBefore(endDate)) {
        //   startDate = moment(leaveData.startDate)
        //     .clone()
        //     .add(1, "days")
        //     .clone();
        //   startIndex++;
        // }
        while (leaveData.type[startIndex] !== LeaveType.SICK.toLowerCase()) {
          startDate.clone().add(1, "days");
          startIndex++;
        }

        while (leaveData.type[endIndex] !== LeaveType.SICK.toLowerCase()) {
          endDate = endDate
            .clone()
            .subtract(1, "days")
            .clone();
          endIndex--;
        }
        rangedData.startDate = startDate.clone().format(Constants.DATE_FORMAT);
        rangedData.endDate = endDate.clone().format(Constants.DATE_FORMAT);
        rangedData.type[0] = LeaveType.SICK.toLowerCase();
        rangedData.leaveRange = leaveData.leaveRange;
        finalGroupedData.push(rangedData);

        // finalGroupedData.push(leaveData);
      } else if (
        leaveData.type.indexOf(LeaveType.VACATION.toLowerCase()) > -1
      ) {
        let startDate = moment(leaveData.startDate).clone();
        let endDate = moment(leaveData.endDate).clone();

        let startIndex = 0;
        let endIndex = leaveData.type.length - 1;
        while (
          leaveData.type[startIndex] !== LeaveType.VACATION.toLowerCase()
        ) {
          startDate = startDate
            .clone()
            .add(1, "days")
            .clone();
          startIndex++;
        }

        while (leaveData.type[endIndex] !== LeaveType.VACATION.toLowerCase()) {
          endDate = endDate
            .clone()
            .subtract(1, "days")
            .clone();
          endIndex--;
        }
        rangedData.startDate = startDate.clone().format(Constants.DATE_FORMAT);
        rangedData.endDate = endDate.clone().format(Constants.DATE_FORMAT);
        rangedData.type[0] = LeaveType.VACATION.toLowerCase();
        rangedData.leaveRange = leaveData.leaveRange;

        finalGroupedData.push(rangedData);
      }
    });
    return finalGroupedData;
  }

  static sortCombinedData(combinedData: CombinedLeave[]): CombinedLeave[] {
    combinedData.sort((date1, date2) => {
      return date1.date > date2.date ? 1 : -1;
    });

    return combinedData;
  }

  static combineLeavesAndHoliday(
    leaves: AppliedLeavesResponse[],
    holidays: PublicHolidayResponse[] | null
  ) {
    let combinedData: CombinedLeave[] = [];
    let sickDays: CombinedLeave[] = [];
    let vacationDays: CombinedLeave[] = [];

    leaves.forEach(data => {
      if (data.type === LeaveType.VACATION.toLowerCase()) {
        vacationDays.push({
          id: data.id,
          date: data.date,
          type: data.type
        });
      } else if (data.type === LeaveType.SICK.toLowerCase()) {
        sickDays.push({ id: data.id, date: data.date, type: data.type });
      }
      // combinedData.push({
      //   date: data.date,
      //   type: data.type
      // });
    });

    if (holidays) {
      holidays.forEach(data => {
        sickDays.push({
          id: -1,
          date: data.date,
          type: Constants.PUBLIC_HOLIDAY
        });

        vacationDays.push({
          id: -1,
          date: data.date,
          type: Constants.PUBLIC_HOLIDAY
        });
      });
    }

    LeaveUtils.sortCombinedData(sickDays);
    LeaveUtils.sortCombinedData(vacationDays);

    sickDays.concat(this.populateWeekends(sickDays));
    vacationDays.concat(this.populateWeekends(vacationDays));

    this.completeLeaveList = sickDays.map(data => data.date);

    this.completeLeaveList = this.completeLeaveList.concat(
      vacationDays.map(data => data.date)
    );

    let groupedSickLeaves = LeaveUtils.preparedRangedData(
      sickDays,
      user.userObject ? user.userObject.id : -1
    );
    let groupedVacationLeaves = LeaveUtils.preparedRangedData(
      vacationDays,
      user.userObject ? user.userObject.id : -1
    );

    //  this.preparedRangedData(combinedData);

    groupedSickLeaves = LeaveUtils.cleanupVacationLeaves(groupedSickLeaves);
    groupedVacationLeaves = LeaveUtils.cleanupVacationLeaves(
      groupedVacationLeaves
    );

    return groupedSickLeaves.concat(groupedVacationLeaves);
  }

  static getFirstSaturday(combinedData: CombinedLeave[]) {
    if (combinedData && combinedData.length > 1) {
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
          date: previousSaturday.clone().format(Constants.DATE_FORMAT),
          type: "Weekend"
        });

        return LeaveUtils.sortCombinedData(combinedData);
      }
    } else return [];
  }

  static populateWeekends(combinedData: CombinedLeave[]): CombinedLeave[] {
    if (combinedData.length > 0) {
      let startDate = moment(new Date().getFullYear() + "-01-01");
      let startDateTemp = moment(new Date().getFullYear() + "-01-01");
      let endData = moment(new Date().getFullYear() + "-12-31");

      if (endData.diff(startDate, "days") > 1) {
        let momentSaturdayDay = startDate.clone();
        while (momentSaturdayDay.day(13).isBefore(endData)) {
          combinedData.push({
            id: -1,
            date: momentSaturdayDay.clone().format(Constants.DATE_FORMAT),
            type: "Weekend"
          });
        }
        let momentSundayDay = startDateTemp.clone();

        while (momentSundayDay.day(7).isBefore(endData)) {
          combinedData.push({
            id: -1,
            date: momentSundayDay.clone().format(Constants.DATE_FORMAT),
            type: "Weekend"
          });
        }
      }
      this.sortCombinedData(combinedData);
      this.getFirstSaturday(combinedData);

      return combinedData;
    }
    return [];
  }
}
