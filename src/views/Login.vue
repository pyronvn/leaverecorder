<template>
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
import Piechart from "@/components/commons/Piechart.vue";

@Component({
  components: {
    Piechart
  }
})
export default class Login extends Vue {
  userId = "";

  loginSubmit() {
    console.log("Login called", this.userId, user);

    let userSubmit: UserOnSubmit = { userid: this.userId };
    const userResponse = user.loginSubmit1(userSubmit).then((user: any) => {
      if (user.id > 0) {
        this.$router.push("/");
      } else {
        this.$router.push("/login");
      }
    });

    // if (userResponse.id > 0) {
    // }

    console.log(userResponse);
  }
}
</script>
