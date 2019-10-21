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
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";
import Piechart from "@/components/commons/views/Piechart.vue";
import Snackbar from "@/components/commons/views/Snackbar.vue";

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
    invalidUser: [(val: string) => (val && val.length !== 0) || "Enter User ID"]
  };

  loginSubmit() {
    this.showSnackbar = false;
    let userSubmit = { userid: this.userId };

    const userResponse = user.loginSubmit(userSubmit).then(user => {
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
  }
}
</script>
