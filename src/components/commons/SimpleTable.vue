<template>
  <v-card>
    <v-card-text>
      <v-list-item-title align="center" justify="center" style="justify-content: center;">{{title}}</v-list-item-title>
    </v-card-text>
    <v-simple-table height="250px">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Start date</th>
            <th class="text-left">End date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.startDate">
            <td>{{ item.name || item.type[0].toUpperCase() }}</td>
            <td>{{ item.startDate }}</td>
            <td>{{ item.endDate }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<script lang ='ts'>
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class SimpleTable extends Vue {
  @Prop()
  title!: string;

  @Prop()
  data!: any[];
}
</script>

<style>
</style>
