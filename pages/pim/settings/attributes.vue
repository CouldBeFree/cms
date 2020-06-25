<template>
  <v-container fluid>
    <v-snackbar v-model="showSuccess" :bottom="false" color="success">
      Task has been saved
      <v-btn color="white" text @click="showSuccess = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar v-model="showError" :bottom="false" color="error">
      {{ error }}
      <v-btn color="white" text @click="showError = false">
        Close
      </v-btn>
    </v-snackbar>

    <h2 class="mb-3">Attributes</h2>

    <v-card class="pt-3">
      <v-list>

        <draggable class="p-4" v-model="attributes" :options="{group:'attributes'}" handle=".handle"
                   @add="onAttributeMove($event, null)"
                   @remove="onAttributeMove($event, null)"
                   @update="onAttributeMove($event, null)">
        <v-list-item v-for="attribute in attributes" :key="attribute._id" @click="editItem(attribute)">
          <v-list-item-avatar>
            <v-icon class="handle">mdi-drag</v-icon>
          </v-list-item-avatar>

          <v-list-item-content v-if="attribute.dataType === 's'">
            <v-list-item-title>{{ attribute.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ attribute.label }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon ripple><v-icon color="grey lighten-1">edit</v-icon></v-btn>
          </v-list-item-action>

          <v-list-item-action>
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

    <attribute-dialog
            v-model="isCreateDialogShow"
            @submit="saveItem"
    />
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
  import Component, { namespace } from 'nuxt-class-component';
  import AttributeDialog from '~/components/PIM/Attributes/AttributeDialog';
  import DeleteMenu from '~/components/common/DeleteMenu';

  const { State, Mutation, Action } = namespace('attributes');

  export default
  @Component({
    middleware: [],
    components: {
      draggable,
      AttributeDialog,
      DeleteMenu
    }
  })
  class PimCategoriesPage extends Vue {
    @State error;
    @State attributes;
    @State attributeGroups;

    @Mutation setDetails;

    @Action loadAttributes;
    @Action saveAttribute;
    @Action deleteAttribute;

    isCreateDialogShow = false;
    showError = false;
    showSuccess = false;

    deleting = false;

    mounted () {
      this.loadAttributes();
    }

    createNewItem () {
      this.setDetails({});

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

      this.loadAttributes();
    }

    async onDeleteAttribute (attr) {
      this.deleting = true;

      await this.deleteAttribute([attr._id]);
      await this.loadAttributes();

      this.deleting = false;
    }

    async onAttributeMove ({ newIndex, oldIndex, type }, group) {
      console.info('onAttributeMove', type, newIndex, oldIndex, group);

      if (group) {
        await this.$axios.$put(`/api/v1/attributes-groups/${group._id}`, group);
      }
    }
  }
</script>
