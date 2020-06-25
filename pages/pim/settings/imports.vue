<template>
  <v-container fluid>

    <h1 class="display-1 font-weight-thin mb-3">Imports</h1>

    <import-jobs-list
        :list="list" :loading="loading" :page="page" :count-pages="countPages"
        @change-page="setPage($event); loadData()"
        @delete="deleteItem($event)"></import-jobs-list>


  </v-container>
</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import ImportJobsList from '~/components/PIM/Import/ImportJobsList';

  const { State, Mutation, Action, Getter } = namespace('pim-import-jobs');

  export default
  @Component({
    middleware: [],
    components: {
      ImportJobsList
    }
  })
  class SettingsImportsPage extends Vue {
    @State list;
    @State loading;
    @State page;
    @State total;

    @Getter countPages;

    @Mutation setPage;

    @Action loadData;
    @Action deleteJob;

    mounted () {
      this.loadData();
    }

    async deleteItem(item) {
      await this.deleteJob(item);
      this.loadData();
    }
  }
</script>
