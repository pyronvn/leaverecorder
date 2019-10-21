<template>
  <div>
    <v-card>
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title
            align="center"
            justify="center"
            style="justify-content: center;"
            >{{ title }}</v-list-item-title
          >
          <v-row>
            <v-col align="center">
              <svg height="20" width="20" viewBox="0 0 20 20">
                <circle r="10" cx="10" cy="10" fill="bisque">
                  <title v-if="remainingLeaves >= 0">
                    Leaves remaining : {{ remainingLeaves }}
                  </title>
                </circle>

                <circle
                  r="5"
                  cx="10"
                  cy="10"
                  fill="transparent"
                  stroke="tomato"
                  stroke-width="10"
                  :stroke-dasharray="calculateSectorArea"
                  transform="rotate(-90) translate(-20)"
                >
                  <title v-if="takenLeaves > 0">
                    Leaves applied : {{ takenLeaves }}
                  </title>
                </circle>
              </svg>
            </v-col>
          </v-row>
          <v-row>
            <v-col align="center" justify="center">
              <ul class="legend">
                <li>
                  <span class="totalleaves"></span>
                  Leaves Remaining : {{ remainingLeaves }}
                </li>
                <li>
                  <span class="leavestaken"></span>
                  Leaves Applied : {{ takenLeaves }}
                </li>
              </ul>
            </v-col>
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Piechart extends Vue {
  @Prop()
  title!: string;

  @Prop()
  takenLeaves!: number;

  @Prop()
  remainingLeaves!: number;

  get calculateSectorArea() {
    return (
      (this.takenLeaves / (this.takenLeaves + this.remainingLeaves)) * 31.4 +
      " " +
      31.4
    );
  }
}
</script>

<style scoped>
svg {
  height: 250px;
  width: 250px;
}

.legend {
  list-style: none;
}
.legend li {
  float: left;
  margin-right: 10px;
}
.legend span {
  border: 1px solid #ccc;
  float: left;
  width: 12px;
  height: 12px;
  margin: 2px;
}
/* your colors */
.legend .totalleaves {
  background-color: bisque;
}
.legend .leavestaken {
  background-color: tomato;
}
</style>
