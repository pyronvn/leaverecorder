<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-if="isUserLoggedIn()"
      v-model="drawer"
      :clipped="$vuetify.breakpoint.lgAndUp"
      app
    >
      <v-list dense>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
            <v-col cols="6" class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          ></v-list-group>
          <v-list-item v-else :key="item.text" @click.prevent>
            <router-link :to="item.link">
              <v-list-item-action>
                <v-icon @click="clickedMethod($event)">{{ item.icon }}</v-icon>
              </v-list-item-action>
            </router-link>
            <router-link :to="item.link">
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </router-link>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app
      color="blue darken-3"
      dark
    >
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <v-app-bar-nav-icon
          v-if="isUserLoggedIn()"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>
        <span class="hidden-sm-and-down">Leave Recorder</span>
      </v-toolbar-title>

      <!-- <div v-if="loggedInUserName" class="field created-at">
        {{ getTime() }}
      </div>-->

      <div class="flex-grow-1"></div>

      <div v-if="loggedInUserName" class="pr-5">{{ displayTime }}</div>
      <router-link to="/">
        <v-btn v-if="loggedInUserName" text>HOME</v-btn>
      </router-link>

      <div v-if="loggedInUserName">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" depressed dark v-on="on"
              >Welcome {{ loggedInUserName }}</v-btn
            >
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in dropdown" :key="index" @click>
              <v-list-item-title @click="signout()">
                {{ item }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" md="12">
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user";
import Snackbar from "@/components/commons/views/Snackbar.vue";
import moment from "moment";
import { Constants } from "@/components/commons/Constants";

@Component({
  components: { Snackbar }
})
export default class Navbar extends Vue {
  dropdown = ["Logoff"];

  drawer = null;
  dialog = false;

  time: string = "";

  datenow = new Date();

  hours = this.datenow.getHours();
  minutes = this.datenow.getMinutes();

  displayTime = "00:00";

  items = [
    { icon: "contacts", text: "Dashboard", link: "/" },
    { icon: "history", text: "Leave", link: "/leave" }
  ];

  isUserLoggedIn() {
    return user.userName;
  }

  get loggedInUserName() {
    return user.userName;
  }

  created() {
    this.calculateTime();
  }
  signout() {
    user.logout().then(() => {
      this.$router.push("/login");
    });
  }

  calculateTime() {
    this.displayTime =
      (this.hours < 10 ? "0" + this.hours : this.hours) +
      ":" +
      (this.minutes < 10 ? "0" + this.minutes : this.minutes);

    setInterval(() => {
      this.minutes++;
      if (this.minutes === 60) {
        this.minutes = 0;
        this.hours++;
        if (this.hours === 24) {
          this.hours = 0;
        }
      }

      this.displayTime =
        (this.hours < 10 ? "0" + this.hours : this.hours) +
        ":" +
        (this.minutes < 10 ? "0" + this.minutes : this.minutes);
    }, 60000);
  }
}
</script>
