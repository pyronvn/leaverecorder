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

      <!-- <div class="field created-at">{{ datenow }}</div> -->
      <div class="flex-grow-1"></div>
      <router-link to="/">
        <v-btn v-if="loggedInUserName" text>HOME</v-btn>
      </router-link>
      <!--<v-btn  icon large>
         <v-avatar size="32px" item>
          <v-img
            src="https://cdn.vuetifyjs.com/images/logos/logo.svg"
            alt="Vuetify"
          ></v-img>
        </v-avatar>
      </v-btn>-->

      <!-- <div v-if="loggedInUserName">Welcome {{ loggedInUserName }}</div> -->
      <div v-if="loggedInUserName">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" depressed dark v-on="on"
              >Welcome {{ loggedInUserName }}</v-btn
            >
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in dropdown" :key="index" @click>
              <v-list-item-title @click="signout()">{{
                item
              }}</v-list-item-title>
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

@Component({
  components: { Snackbar }
})
export default class Navbar extends Vue {
  dropdown = ["Logoff"];

  drawer = null;
  dialog = false;

  // time = this.createdAtDisplay();

  datenow = "";
  isUserLoggedIn() {
    return user.userName;
  }

  items = [
    { icon: "contacts", text: "Dashboard", link: "/" },
    { icon: "history", text: "Apply Leave", link: "/leave" }
  ];

  get loggedInUserName() {
    return user.userName;
  }

  // mounted() {
  //   this.createdAtDisplay();
  // }

  mounted() {
    this.time();
  }

  time() {
    let self = this;
    this.datenow = moment().format("HH:mm:ss");
    setInterval(this.time, 6000);
  }

  // createdAtDisplay() {
  //   return moment(new Date()).format("YYYY-MM-DD h:mm:s A");
  // }
  // created() {
  //   this.displayTime();
  // }

  signout() {
    user.logout().then(() => {
      this.$router.push("/login");
    });
  }

  displayTime() {
    let today = new Date();
    let hour = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    minutes = this.checkTime(minutes);
    seconds = this.checkTime(seconds);

    this.time = hour + ":" + minutes + ":" + seconds;

    setInterval(this.displayTime(), 5000);
  }

  getTime() {
    this.displayTime();
    return this.time;
  }

  checkTime(i: any) {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  }
}
</script>
