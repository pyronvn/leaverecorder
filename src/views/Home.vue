<template>
  <div>
    <Piechart />
    <Piechart />
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import user from "@/store/modules/user.ts";
import Piechart from "@/components/commons/Piechart.vue";

@Component({
  components: { Piechart }
})
export default class Home extends Vue {
  getUserObj() {
    return user.loggedInUserObj;
  }
}
</script>
