import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import { login } from "@/store/api/UserApi";
import { UserResponse } from "@/store/models/UserResponse";
import { UserOnSubmit } from "@/store/models/UserOnSubmit";

@Module({
  namespaced: true,
  name: "user",
  store,
  dynamic: true
})
class UsersModule extends VuexModule {
  user: UserResponse | null = null;

  get userName() {
    return (this.user && this.user.name) || null;
  }

  get userObject() {
    return (this.user && this.user) || null;
  }

  @Mutation
  setUser(user: UserResponse) {
    this.user = user;
  }

  @Action({ commit: "setUser" })
  async loginSubmit(userOnSubmit: UserOnSubmit) {
    const user = await login(userOnSubmit);

    return user;
  }

  @Mutation
  clearUser(user: any) {
    this.user = null;
  }

  @Action({ commit: "clearUser" })
  async logout() {
    return null;
  }
}

export default getModule(UsersModule);
