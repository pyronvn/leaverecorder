<template>
  <v-app id="inspire">
    <v-tabs v-model="tab" background-color="accent-4" class="elevation-2" dark>
      <v-tab>Apply Leave</v-tab>
      <v-tab>View History</v-tab>

      <v-tab-item>
        <v-card flat tile>
          <v-container fluid>
            <v-row align="center">
              <v-col class="d-flex" cols="12" md="4">
                <v-select :items="items" label="Leave Type"></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-date-picker v-model="dates" range></v-date-picker>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-btn depressed color="primary">Apply Leave</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-app id="inspire">
          <v-data-table
            :fixed-header="fixedHeader"
            :headers="headers"
            :items="leavesData"
            :sort-by="['calories', 'fat']"
            :sort-desc="[false, true]"
            multi-sort
            class="elevation-1"
          >
            <template v-slot:item.action="{ item }">
              <v-icon small @click="deleteItem(item)">delete</v-icon>
            </template>
          </v-data-table>
        </v-app>
      </v-tab-item>
    </v-tabs>
  </v-app>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component
export default class ApplyLeave extends Vue {
  tab = null;
  dates = [new Date().toISOString().substr(0, 10)];
  items = ["Sick Leave", "Vacation Leave"];

  fixedHeader = false;
  headers = [
    {
      text: "ID",
      align: "left",
      value: "id",
      width: "1%"
    },
    { text: "Type", align: "left", value: "type", width: "1%" },
    { text: "Date", align: "left", value: "date", width: "1%" },
    { text: "Action", align: "left", value: "action", width: "1%" }
  ];
  leavesData = [
    {
      id: 150,
      date: "2019-10-04",
      user_id: 3,
      type: "vacation"
    },
    {
      id: 151,
      date: "2019-10-09",
      user_id: 3,
      type: "vacation"
    },
    {
      id: 152,
      date: "2019-10-22",
      user_id: 3,
      type: "sick"
    },
    {
      id: 153,
      date: "2019-10-23",
      user_id: 3,
      type: "sick"
    },
    {
      id: 154,
      date: "2019-10-24",
      user_id: 3,
      type: "sick"
    },
    {
      id: 155,
      date: "2019-10-25",
      user_id: 3,
      type: "sick"
    }
  ];

  deleteItem(item) {}
}
</script>

<style></style>
