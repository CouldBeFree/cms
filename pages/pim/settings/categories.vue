<template>
  <v-container fluid>

    <h1 class="display-1 font-weight-thin mb-3">Categories</h1>

    <categories-list :list="categories" @import-settings="importSettingsDialog" @run="runImport" />

    <create-import-flow ref="createFlow" @input="saveSettings"></create-import-flow>
  </v-container>
</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import CategoriesList from '~/components/PIM/Categories/CategoriesList';
  import CreateImportFlow from '~/components/PIM/Import/CreateImportFlow';

  const { State, Action } = namespace('data');

  export default
  @Component({
    middleware: [],
    components: {
      CategoriesList,
      CreateImportFlow
    }
  })
  class PimCategoriesPage extends Vue {
    @State categories;

    @Action loadCategories;
    @Action saveCategorySettings;
    @Action runImport;

    category = null;

    mounted () {
      this.loadCategories();
    }

    importSettingsDialog(category) {
      this.category = category;
      this.$refs.createFlow.startCreation(category);
    }

    async saveSettings(settings) {
      await this.saveCategorySettings({ categoryId: this.category._id, settings });
      this.loadCategories();
    }
  }
</script>
