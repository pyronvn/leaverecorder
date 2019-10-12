import axios from "axios";
import { UserOnSubmit, UserResponse } from "@/store/models/models";

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
