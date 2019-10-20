<template>
  <div>
    <div v-if="showSnackbar">
      <Snackbar :color="color" :text="text"></Snackbar>
    </div>
    <v-app id="loginpage">
      <v-form ref="form">
        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12" md="3">
              <v-text-field v-model="userId" label="User ID" required :rules="rule.invalidUser"></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn
                @click.prevent="loginSubmit()"
                depressed
                color="primary"
                :disabled="!userId || !userId.length > 0"
              >Login</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-app>
  </div>
</template>
<script>
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";
import { UserOnSubmit, UserResponse, SnackbarObj } from "@/store/models/models";
import Piechart from "@/components/commons/Piechart.vue";
import Snackbar from "@/components/commons/Snackbar.vue";

@Component({
  components: {
    Piechart,
    Snackbar
  }
})
export default class Login extends Vue {
  userId = "";
  color = "";
  text = "";
  userIdError = false;
  error = false;
  showSnackbar = false;
  rule = {
    invalidUser: [val => (val && val.length !== 0) || "Enter User ID"]
  };
  loginSubmit() {
    this.showSnackbar = false;
    console.log("Login called", this.userId, user);

    let userSubmit = { userid: this.userId };
    console.log("this.SnackbarModule", this.snackbarstore);

    const userResponse = user.loginSubmit1(userSubmit).then(user => {
      if (user.id > 0) {
        this.userIdError = false;
        this.$router.push("/");
      } else {
        this.color = "error";
        this.text = "Invalid user ID!";
        this.showSnackbar = true;
        this.$refs.form.reset();
      }
    });

    console.log(userResponse);
  }
}
</script>
