<template>
  <svg height="20" width="20" viewBox="0 0 20 20">
    <circle r="10" cx="10" cy="10" fill="bisque"></circle>
    <circle
      r="5"
      cx="10"
      cy="10"
      fill="transparent"
      stroke="tomato"
      stroke-width="10"
      stroke-dasharray="calc(35 * 31.4 / 100) 31.4"
      transform="rotate(-90) translate(-20)"
    ></circle>
  </svg>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Piechart extends Vue {}
</script>

<style>
svg {
  height: 250px;
  width: 250px;
}
</style>
