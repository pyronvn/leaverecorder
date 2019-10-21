import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import ApplyLeave from "./views/ApplyLeave.vue";
import user from "@/store/modules/user.ts";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      beforeEnter: (to, from, next) => {
        if (!user.userObject) {
          next({
            name: "login"
          });
        } else {
          next();
        }
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      beforeEnter: (to, from, next) => {
        if (user.userObject) {
          next({
            name: "home"
          });
        } else {
          next();
        }
      }
    },
    {
      path: "/leave",
      name: "leave",
      component: ApplyLeave,
      beforeEnter: (to, from, next) => {
        if (!user.userObject) {
          next({
            name: "login"
          });
        } else {
          next();
        }
      }
    }
  ]
});
