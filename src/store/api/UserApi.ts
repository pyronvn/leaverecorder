import axios from "axios";
import { UserOnSubmit } from "@/store/models/UserOnSubmit";
import { UserResponse } from "@/store/models/UserResponse";

export const userApi = axios.create({
  baseURL: "https://leaves.speakup.systems/api",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    "x-api-key": "grdcJnsPdRac8aor66yV46ySis5xDKbZ3KNinTqE"
  }
});

export async function login(
  user: UserOnSubmit
): Promise<UserResponse | undefined> {
  try {
    const resp = await userApi.get("/users?name=" + user.userid);

    return resp.data as UserResponse;
  } catch (error) {
    throw error;
  }
}
