import {
  PublicHolidayResponse,
  PublicHolidayGrouped,
  RangeLeaves,
  CombinedLeave,
  AppliedLeavesResponse
} from "@/store/models/models";
import user from "@/store/modules/user.ts";

import moment from "moment";

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
    console.log("getHolidayRanges", result);
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
    console.log("publicHolidaysDateRangeList", publicHolidaysDateRangeList);

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

      if (leaveData.type.indexOf("sick") > -1) {
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
        while (leaveData.type[startIndex] !== "sick") {
          startDate.clone().add(1, "days");
          startIndex++;
        }

        while (leaveData.type[endIndex] !== "sick") {
          endDate = endDate
            .clone()
            .subtract(1, "days")
            .clone();
          endIndex--;
        }
        rangedData.startDate = startDate.clone().format("YYYY-MM-DD");
        rangedData.endDate = endDate.clone().format("YYYY-MM-DD");
        rangedData.type[0] = "sick";
        rangedData.leaveRange = leaveData.leaveRange;
        finalGroupedData.push(rangedData);

        // finalGroupedData.push(leaveData);
      } else if (leaveData.type.indexOf("vacation") > -1) {
        let startDate = moment(leaveData.startDate).clone();
        let endDate = moment(leaveData.endDate).clone();

        let startIndex = 0;
        let endIndex = leaveData.type.length - 1;
        while (leaveData.type[startIndex] !== "vacation") {
          startDate = startDate
            .clone()
            .add(1, "days")
            .clone();
          startIndex++;
        }

        while (leaveData.type[endIndex] !== "vacation") {
          endDate = endDate
            .clone()
            .subtract(1, "days")
            .clone();
          endIndex--;
        }
        rangedData.startDate = startDate.clone().format("YYYY-MM-DD");
        rangedData.endDate = endDate.clone().format("YYYY-MM-DD");
        rangedData.type[0] = "vacation";
        rangedData.leaveRange = leaveData.leaveRange;

        finalGroupedData.push(rangedData);
      }
    });
    console.log("Removed weekends", finalGroupedData);
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

    LeaveUtils.sortCombinedData(sickDays);
    LeaveUtils.sortCombinedData(vacationDays);

    console.log("Combined Data after sort", combinedData);
    sickDays.concat(this.populateWeekends(sickDays));
    vacationDays.concat(this.populateWeekends(vacationDays));

    console.log("this.completeLeaveList brfore", this.completeLeaveList);
    this.completeLeaveList = sickDays.map(data => data.date);
    console.log("this.completeLeaveList  only sick", this.completeLeaveList);

    this.completeLeaveList = this.completeLeaveList.concat(
      vacationDays.map(data => data.date)
    );
    console.log("this.completeLeaveList  both", this.completeLeaveList);

    console.log("completeLeaveList after merge", this.completeLeaveList);

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

    return groupedSickLeaves.concat(groupedVacationLeaves);
  }

  static getFirstSaturday(combinedData: CombinedLeave[]) {
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
        return LeaveUtils.sortCombinedData(combinedData);
      }
    } else return [];
  }

  static populateWeekends(combinedData: CombinedLeave[]): CombinedLeave[] {
    if (combinedData.length > 0) {
      let startDate = moment(combinedData[0].date);
      let startDate2 = moment(combinedData[0].date);
      let endData = moment(combinedData[combinedData.length - 1].date);

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

      LeaveUtils.sortCombinedData(combinedData);
      LeaveUtils.getFirstSaturday(combinedData);

      return combinedData;
    }
    return [];
  }
}
