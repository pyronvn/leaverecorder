import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import { UserOnSubmit, UserResponse } from "@/store/models/models";
import { login1 } from "@/store/api";

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
  async loginSubmit1(userOnSubmit: UserOnSubmit) {
    const user = await login1(userOnSubmit);
    return user;
  }
}

export default getModule(UsersModule);
