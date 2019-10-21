import axios from "axios";
import {
  UserOnSubmit,
  UserResponse,
  AppliedLeavesResponse,
  PublicHolidayResponse,
  Leaves
} from "@/store/models/models";

export const api = axios.create({
  baseURL: "https://leaves.speakup.systems/api",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    "x-api-key": "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE"
  }
});

export async function getAppliedLeaves(
  userId: number
): Promise<AppliedLeavesResponse[] | undefined> {
  try {
    const resp = await api.get("/leaves?userId=" + userId);

    return resp.data as AppliedLeavesResponse[];
  } catch (error) {
    throw error;
  }
}

export async function getPublicHolidays(): Promise<
  PublicHolidayResponse[] | undefined
> {
  try {
    const resp = await api.get("/public-holidays");

    return resp.data as PublicHolidayResponse[];
  } catch (error) {
    throw error;
  }
}

export async function applyLeave(
  appliedLeave: Leaves[]
): Promise<any | undefined> {
  try {
    let body = {
      leaves: appliedLeave
    };
    const resp = await api.post("/leaves", body);

    return resp as any;
  } catch (error) {
    throw error;
  }
}

export async function deleteLeaves(leaves: string): Promise<any | undefined> {
  try {
    const resp = await api.delete("/leaves?ids=" + leaves);

    return resp as any;
  } catch (error) {
    throw error;
  }
}
