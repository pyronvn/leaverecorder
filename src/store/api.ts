import axios from "axios";
import {
  UserOnSubmit,
  UserResponse,
  AppliedLeavesResponse,
  PublicHolidayResponse,
  SubmittedLeave
} from "@/store/models/models";

export const api = axios.create({
  baseURL: "https://leaves.speakup.systems/api",
  headers: [
    { "Content-type": "application/json;charset=utf-8" },
    { "x-api-key": "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE" }
  ]
});

export async function login1(
  user: UserOnSubmit
): Promise<UserResponse | undefined> {
  axios.defaults.baseURL = "https://leaves.speakup.systems/api";
  axios.defaults.headers.get["Content-type"] = "application/json;charset=utf-8";
  axios.defaults.headers.get["x-api-key"] =
    "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE";

  try {
    console.log("Async login", user.userid);
    const resp = await axios.get("/users?name=" + user.userid);

    return resp.data as UserResponse;
  } catch (error) {
    console.log(error);
  }
}

export async function getAppliedLeaves(
  userId: number
): Promise<AppliedLeavesResponse[] | undefined> {
  axios.defaults.baseURL = "https://leaves.speakup.systems/api";
  axios.defaults.headers.get["Content-type"] = "application/json;charset=utf-8";
  axios.defaults.headers.get["x-api-key"] =
    "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE";

  try {
    const resp = await axios.get("/leaves?userId=" + userId);

    return resp.data as AppliedLeavesResponse[];
  } catch (error) {
    console.log(error);
  }
}

export async function getPublicHolidays(): Promise<
  PublicHolidayResponse[] | undefined
> {
  axios.defaults.baseURL = "https://leaves.speakup.systems/api";
  axios.defaults.headers.get["Content-type"] = "application/json;charset=utf-8";
  axios.defaults.headers.get["x-api-key"] =
    "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE";

  try {
    const resp = await axios.get("/public-holidays");

    return resp.data as PublicHolidayResponse[];
  } catch (error) {
    console.log(error);
  }
}

export async function applyLeave(
  appliedLeave: SubmittedLeave,
  id: number
): Promise<any | undefined> {
  axios.defaults.baseURL = "https://leaves.speakup.systems/api";
  axios.defaults.headers.get["Content-type"] = "application/json;charset=utf-8";
  axios.defaults.headers.get["x-api-key"] =
    "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE";

  try {
    const resp = await axios.post("/public-holidays");

    return resp.data as any;
  } catch (error) {
    console.log(error);
  }
}
