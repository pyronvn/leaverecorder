<template>
  <div>{{ loggedInUserObj }}</div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";

@Component
export default class Home extends Vue {
  loggedInUserObj = user.loggedInUserObj;
}
</script>
