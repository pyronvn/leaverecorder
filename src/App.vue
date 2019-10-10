<template>
  <div>
    <Navbar></Navbar>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import Navbar from "@/components/Navbar.vue";

@Component({
  components: {
    Navbar
  }
})
export default class App extends Vue {
  clickedMethod(s) {
    console.log("Clickeddd");
  }
}
</script>
