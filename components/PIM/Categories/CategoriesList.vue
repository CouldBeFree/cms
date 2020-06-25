<template>

  <div>

    <v-card id="projects-list" class="mt-1">
      <v-progress-linear v-if="loading" style="margin-top: -3px" class="mb-0" :height="3" indeterminate></v-progress-linear>

      <div>
        <v-btn @click="addNewCategory" color="pink" dark absolute top right fab v-if="!showCategoryDialog">
          <v-icon>add</v-icon>
        </v-btn>
        <add-category
                v-model="showCategoryDialog"
                @submit="saveCurrentCategory"
        />
      </div>

      <v-list v-if="!loading && list && list.length">
        <v-list-item v-for="category in list" :key="category._id" @click="">
          <v-list-item-action>
            <v-icon v-if="category.importSettings && category.importSettings.currentStatus && category.importSettings.currentStatus.state === 'inprocess'">mdi-spin mdi-loading</v-icon>
            <v-icon v-else>mdi-file-tree</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title :class="category.Status === 'Inactive' ? 'grey--text text--lighten-1' : 'font-weight-bold'">{{category.title}}</v-list-item-title>
            <v-list-item-subtitle v-if="category.importSettings && category.importSettings.currentStatus">
              {{category.importSettings.currentStatus.text}}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click.prevent="editCategory(category)">
              <v-icon color="grey lighten-1">edit</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action class="ml-3" v-if="category.importSettings.enabledAutoImport">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon @click.prevent="$emit('run', category)" :disabled="category.importSettings && category.importSettings.currentStatus && category.importSettings.currentStatus.state === 'inprocess'">
                  <v-icon color="grey lighten-1">mdi-play</v-icon>
                </v-btn>
              </template>
              <span>Run import</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action class="ml-3">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon @click.prevent="$emit('import-settings', category)">
                  <v-icon color="grey lighten-1">mdi-file-upload</v-icon>
                </v-btn>
              </template>
              <span>Setup import</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action>

            <delete-menu :loading="loadingDeleting" @delete="onDeleteProjectClick(category)">
              Are you sure to delete this category?
            </delete-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <div v-else-if="!loading" class="pa-5 align-center card-item">

        <v-icon left>mdi-receipt</v-icon>

        <span class="title">No categorys</span>

      </div>
      <div v-else class="pa-5 align-center">

        <v-icon left class="mdi-spin">mdi-loading</v-icon>
        <span class="title">Loading</span>

      </div>

      <v-pagination class="pa-2" v-if="countPages > 1"
                    :value="page"
                    @input="setPage($event);
                    $emit('update-list');
                    $vuetify.goTo('#categorys-list',
                    { easing: 'easeInOutCubic' })"
                    :length="countPages"></v-pagination>

    </v-card>

    <v-snackbar v-model="showError" :bottom="false" color="error">
      {{ error }}
      <v-btn color="white" text @click="showError = false">
        Close
      </v-btn>
    </v-snackbar>
    <v-snackbar v-model="showSuccess" :bottom="false" color="success">
      Category has been saved
      <v-btn color="white" text @click="showSuccess = false">Close</v-btn>
    </v-snackbar>
  </div>

</template>
<script>
  import groupBy from 'lodash/groupBy';
  import { Vue, Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import AddCategory from '~/components/PIM/Categories/AddCategory';
  import DeleteMenu from '~/components/common/DeleteMenu';

  // const { State } = namespace('attributes');
  const { State, Action, Mutation } = namespace('data');
  // import ProjectIcon from '~/components/Projects/ProjectIcon';

  export default @Component({
    components: {
      // ProjectIcon
      DeleteMenu,
      AddCategory
    },
    middleware: 'auth'
  })
  class ProjectsList extends Vue {
    @Prop() list;
    @Prop() loading;

    @State countPages;
    @State error;

    @Action deleteGroup;
    @Action loadCategories;
    @Action saveCategory;

    @Mutation setDetails;

    loadingDeleting = false;
    showCategoryDialog = false;
    showError = false;
    showSuccess = false;

    get projectGroups () {
      return groupBy(this.projects, 'ClientName');
    }

    addNewCategory () {
      this.showCategoryDialog = !this.showCategoryDialog;
      this.setDetails({});
    }

    editCategory (cat) {
      this.setDetails({ ...cat });
      this.showCategoryDialog = !this.showCategoryDialog;
    }

    editImportSettings (cat) {
      this.setDetails({ ...cat });
      this.showCategoryDialog = !this.showCategoryDialog;
    }

    async saveCurrentCategory () {
      this.showError = false;

      await this.saveCategory();

      this.showError = this.error !== null;

      if (this.showError) {
        return;
      }

      this.showCategoryDialog = false;
      this.showSuccess = true;

      await this.loadCategories();
    }

    async onDeleteProjectClick (project) {
      this.showError = false;
      this.loadingDeleting = true;

      await this.deleteGroup(project._id);
      await this.loadCategories();

      this.loadingDeleting = false;
    }
  }
</script>
