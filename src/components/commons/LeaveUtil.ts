import {
  PublicHolidayResponse,
  PublicHolidayGrouped,
  RangeLeaves
} from "@/store/models/models";
import moment from "moment";

export default class LeaveUtils {
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

  static cleanupVacationLeaves(groupedLeaves: RangeLeaves[]) {
    let finalGroupedData: RangeLeaves[] = [];
    let rangedData = new RangeLeaves();
    groupedLeaves.forEach(leaveData => {
      if (leaveData.type.indexOf("sick") > 0) {
        finalGroupedData.push(leaveData);
      } else if (leaveData.type.indexOf("vacation") > 0) {
        let startDate = moment(leaveData.startDate);
        let endDate = moment(leaveData.endDate);

        let startIndex = 0;
        let endIndex = leaveData.type.length - 1;
        while (leaveData.type[startIndex] !== "vacation") {
          startDate = moment(leaveData.startDate)
            .clone()
            .add(1, "days");
          startIndex++;
        }

        while (leaveData.type[endIndex] !== "vacation") {
          endDate = moment(leaveData.startDate)
            .clone()
            .subtract(1, "days");
          endIndex--;
        }
        rangedData.startDate = startDate.clone().format("YYYY-MM-DD");
        rangedData.startDate = endDate.clone().format("YYYY-MM-DD");
        rangedData.startDate = "vacation";

        finalGroupedData.push(rangedData);
      }
    });
    console.log("Removed weekends", finalGroupedData);
    return finalGroupedData;
  }
}
