<template>
  <v-snackbar
    v-model="snackbar"
    :bottom="y === 'bottom'"
    :color="color"
    :left="x === 'left'"
    :right="x === 'right'"
    :timeout="timeout"
    :top="y === 'top'"
  >
    {{ text }}
    <v-btn dark text @click="snackbar = false">Close</v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Snackbar extends Vue {
  x = "0";
  y = "top";
  timeout = 6000;

  // @Prop()
  snackbar: boolean = true;

  @Prop()
  color!: string;

  @Prop()
  text!: string;
}
</script>

<style></style>
