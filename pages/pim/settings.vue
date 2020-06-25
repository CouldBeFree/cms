<template>

  <v-layout fill-height wrap>

    <v-flex xs12 md2  fill-height>
    <v-navigation-drawer
        :value="true"
        class="pb-0"
        floating
        hide-overlay
        stateless
    >
      <v-list nav dense>
        <v-subheader>Settings</v-subheader>

        <v-list-item v-for="link in links" :key="link.title" :to="link.to">
          <v-list-item-title v-text="link.title"></v-list-item-title>
        </v-list-item>

        <v-subheader class="pr-0">
          Attributes Groups
          <v-spacer></v-spacer>
          <v-btn icon @click="showCreateDialog">
            <v-icon>add</v-icon>
          </v-btn>
        </v-subheader>

        <v-list-item v-for="group in groups" :key="group._id" :to="{ name: 'pim-settings-groups', params: { groups: group._id } }">
          <v-list-item-title v-text="group.title"></v-list-item-title>
        </v-list-item>
      </v-list>

    </v-navigation-drawer>
    </v-flex>

    <v-flex xs12 md10>

    <nuxt-child />

    </v-flex>
    <group-dialog v-model="isCreateDialogShow" @submit="createGroup"></group-dialog>

    <v-snackbar v-model="showSuccess" :bottom="false" color="success">
      Group has been saved
      <v-btn color="white" text @click="showSuccess = false">Close</v-btn>
    </v-snackbar>
    <v-snackbar v-model="showError" :bottom="false" color="error">
      {{ error }}
      <v-btn color="white" text @click="showError = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-layout>

</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import GroupDialog from '~/components/PIM/Groups/GroupDialog';

  const { State, Mutation, Action } = namespace('groups');

  export default
  @Component({
    components: {
      GroupDialog
    }
  })
  class PimPage extends Vue {
    @Action loadGroups;
    @Action saveGroup;

    @Mutation setDetails;

    @State error;
    @State groups;

    links = [
      { title: 'Categories', to: { name: 'pim-settings-categories' } },
      { title: 'Imports', to: { name: 'pim-settings-imports' } }
    ];

    isCreateDialogShow = false;
    showError = false;
    showSuccess = false;

    mounted () {
      this.loadGroups();
      if (this.$route.name === 'pim-settings') {
        this.$router.push({ name: 'pim-settings-categories' });
      }
    }

    showCreateDialog () {
      this.isCreateDialogShow = true;
      this.setDetails({});
    }

    async createGroup () {
      this.showError = false;

      await this.saveGroup();

      this.showError = this.error !== null;

      if (this.showError) {
        return;
      }
      this.isCreateDialogShow = false;
      this.showSuccess = true;

      this.loadGroups();
    }
  }
</script>
