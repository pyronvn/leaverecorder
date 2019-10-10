<template>
  <!-- <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Login</h1>

          <ul class="error-messages"></ul>

          <form>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                v-model="userId"
                placeholder="User ID"
              />
            </fieldset>
            <button
              @click="loginSubmit()"
              :disabled="!userId.length > 0"
              class="btn btn-lg btn-primary pull-xs-right"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>-->

  <div>
    <v-app id="loginpage">
      <v-form>
        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12" md="3">
              <v-text-field
                v-model="userId"
                label="Enter User ID"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn @click.prevent="loginSubmit()" depressed color="primary"
                >Login</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-app>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";
import { UserOnSubmit, UserResponse } from "@/store/models/models";

@Component
export default class Login extends Vue {
  userId = "";

  loginSubmit() {
    console.log("Login called", this.userId, user);

    let userSubmit: UserOnSubmit = { userid: this.userId };
    const userResponse = user.loginSubmit1(userSubmit);

    // if (userResponse.id > 0) {
    // }

    console.log(userResponse);
  }
}
</script>
