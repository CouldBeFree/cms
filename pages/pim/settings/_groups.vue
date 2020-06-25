<template>
  <v-container fluid>
    <v-snackbar v-model="showSuccess" :bottom="false" color="success">
      Attribute has been saved
      <v-btn color="white" text @click="showSuccess = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar v-model="showError" :bottom="false" color="error">
      {{ error }}
      <v-btn color="white" text @click="showError = false">
        Close
      </v-btn>
    </v-snackbar>

    <h1 class="display-1 font-weight-thin mb-3">Attributes Group<span v-if="details"> "{{details.title}}"</span></h1>

    <v-card class="pt-3">
      <v-list>

        <draggable class="p-4" v-model="groupAttributes" :options="{group:'attributes'}" handle=".handle">
          <v-list-item v-for="attribute in groupAttributes" :key="attribute._id" @click>
            <v-list-item-avatar>
              <v-icon class="handle">mdi-drag</v-icon>
            </v-list-item-avatar>

            <v-list-item-content v-if="attribute.dataType === 'separator'" @click="editItem(attribute)">
              <v-list-item-title><strong>{{ attribute.title }}</strong></v-list-item-title>
              <v-divider style="width: 100%"></v-divider>
            </v-list-item-content>
            <v-list-item-content v-else @click="editItem(attribute)">
              <v-list-item-title>{{ attribute.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ attribute.label }}</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action @click="editItem(attribute)">
              <v-btn icon ripple><v-icon color="grey lighten-1">edit</v-icon></v-btn>
            </v-list-item-action>

            <v-list-item-action @click.prevent>
              <delete-menu :loading="deleting" @delete="onDeleteAttribute(attribute)">
                Are you sure to delete this attribute?
              </delete-menu>
            </v-list-item-action>
          </v-list-item>
        </draggable>
      </v-list>

      <v-btn @click="createNewItem" color="pink" dark absolute top right fab>
        <v-icon>add</v-icon>
      </v-btn>
    </v-card>

    <attribute-dialog v-model="isCreateDialogShow" @submit="saveItem" />
  </v-container>
</template>
<style>
  .handle {
    cursor: ns-resize;
  }
</style>
<script>
  import Vue from 'vue';
  import draggable from 'vuedraggable';
  import sortBy from 'lodash/sortBy';
  import pick from 'lodash/pick';
  import Component, { namespace } from 'nuxt-class-component';
  import AttributeDialog from '~/components/PIM/Attributes/AttributeDialog';
  import DeleteMenu from '~/components/common/DeleteMenu';

  const { State, Mutation, Action } = namespace('attributes');
  const { State: GroupState, Mutation: GroupMutation, Action: GroupAction } = namespace('groups');

  export default
  @Component({
    middleware: [],
    components: {
      draggable,
      AttributeDialog,
      DeleteMenu
    },
    watch: {
      $route (to, from) {
        let route = this.$route.params.groups;
        this.$store.commit('attributes/setGroupId', route);
        this.$store.dispatch('groups/loadDetails', route);
        this.$store.dispatch('attributes/loadAttributes');
      }
    }
  })
  class PimCategoriesPage extends Vue {
    @State error;
    @State attributes;
    @GroupState details;

    @Mutation setGroupId;
    @Mutation setDetails;
    @GroupMutation setDetailsParam;

    @Action loadAttributes;
    @Action saveAttribute;
    @Action deleteAttribute;
    @GroupAction loadDetails;
    @GroupAction saveGroup;

    isCreateDialogShow = false;
    showError = false;
    showSuccess = false;

    deleting = false;

    get groupAttributes () {
      if (!this.details) {
        return;
      }
      const ids = (this.details.attributes || []).map(attr => attr._id);
      return sortBy(this.attributes || [], attr => ids.indexOf(attr._id) === -1 ? 1000 : ids.indexOf(attr._id));
    }

    set groupAttributes (val) {
      const attrs = val.map(attr => pick(attr, ['_id', 'title']));
      this.setDetailsParam(['attributes', attrs]);
      this.saveGroup();
    }

    mounted () {
      this.loadData(this.$route.params.groups);
    }

    beforeRouteUpdate (to, from, next) {
      this.loadData(to.params.groups);
      next();
    }

    createNewItem () {
      this.setDetails({ dataList: [] });

      this.isCreateDialogShow = true;
    }

    editItem (item) {
      this.setDetails({ ...item });

      this.isCreateDialogShow = true;
    }

    async saveItem () {
      this.showError = false;

      await this.saveAttribute();

      this.showError = this.error !== null;

      if (this.showError) {
        return;
      }
      this.isCreateDialogShow = false;
      this.showSuccess = true;

      await this.loadAttributes();
      this.groupAttributes = [...this.groupAttributes];
    }

    async onDeleteAttribute (attr) {
      this.deleting = true;

      await this.deleteAttribute([attr._id]);

      this.groupAttributes = this.groupAttributes.filter(item => item._id !== attr._id);

      await this.loadAttributes();

      this.deleting = false;
    }

    async loadData (groupId) {
      this.setGroupId(groupId);
      this.loadDetails(groupId);
      this.loadAttributes();
    }
  }
</script>
