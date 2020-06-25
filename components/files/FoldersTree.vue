<template>

  <div>
    <v-snackbar v-model="folderCreated" color="success" :timeout="5000">Folder created</v-snackbar>
    <v-snackbar v-model="folderRenamed" color="success" :timeout="5000">Folder renamed</v-snackbar>
    <v-snackbar v-model="folderDeleted" color="success" :timeout="5000">Folder deleted</v-snackbar>

    <div class="pr-3 pb-2">

      <v-layout>
        <v-flex xs8>

          <folder-action-menu
                  title="Create new folder"
                  action-title="Create"
                  @action="createFolderAction"
                  :include-current="true"
                  :open.sync="isOpenCreateFolderMenu"
                  :disabled="!newFolderName || loadingCreation"
                  :loading="loadingCreation">

            <template  v-slot:activator="{ on }">
              <v-btn block outlined color="secondary" v-on="on" style="border-top-right-radius: 0; border-bottom-right-radius: 0">
                <v-icon left>mdi-folder-plus</v-icon>
                Create
              </v-btn>
            </template>

            <v-text-field outline required autofocus counter="25"
                          label="Folder name" v-model="newFolderName" :error-messages="creationError ? [creationError] : []"
                          :rules="[
                              () => !!newFolderName || 'This field is required',
                              () => newFolderName.length <= 25 || 'This field max length is 25',
                              () => (!!(newFolderName || '').match(/^[a-z0-9\-_ ]+$/i)) || 'Name contains invalid symbols, allowed only a-z, 0-9, -, _, space'
                          ]"
            ></v-text-field>

          </folder-action-menu>
        </v-flex>
        <v-flex xs2>

          <folder-action-menu title="Renaming of folder" action-title="Rename" @action="renameFolderAction"
                              :open.sync="isOpenRenameFolderMenu" :disabled="!renameFolderName || loadingRenaming"
                              :loading="loadingRenaming">

            <template v-slot:activator="{ on }">
              <v-btn :disabled="!currentFolderId" v-on="on" block outlined style="min-width: 0; margin-left: -1px; border-radius: 0">
                <v-icon>mdi-folder-edit</v-icon>
              </v-btn>
            </template>

            <v-text-field outline required autofocus counter="25"
                          label="New folder name" v-model="renameFolderName" :error-messages="renamingError ? [renamingError] : []"
                          :rules="[
                              () => !!renameFolderName || 'This field is required',
                              () => renameFolderName.length <= 25 || 'This field max length is 25',
                              () => (!!(renameFolderName || '').match(/^[a-z0-9\-_ ]+$/i)) || 'Name contains invalid symbols, allowed only a-z, 0-9, -, _, space'
                          ]"
            ></v-text-field>

          </folder-action-menu>

        </v-flex>
        <v-flex xs2>

          <folder-action-menu title="Deleting of folder" action-title="Delete" @action="deleteFolderAction" :include-current="true"
                              action-color="error"
                              :open.sync="isOpenDeleteFolderMenu" :disabled="loadingDeleting" :loading="loadingDeleting">

            <template v-slot:activator="{ on }">
              <v-btn :disabled="!currentFolderId" v-on="on" block outlined style="min-width: 0; border-top-left-radius: 0; border-bottom-left-radius: 0">
                <v-icon color="error">mdi-folder-remove</v-icon>
              </v-btn>
            </template>

            Are you sure want to delete current folder?

          </folder-action-menu>
        </v-flex>

      </v-layout>
    </div>


    <v-progress-linear v-if="loadingTree" :indeterminate="true" height="2" style="margin: -2px 0 0"></v-progress-linear>
    <v-treeview disabled
                v-model="tree"
                :open="open"
                :items="foldersTree"
                activatable hoverable transition
                :active.sync="activeFolders"
                item-key="_id"
                item-text="title"
    >
      <template slot="prepend" slot-scope="{ item, open, leaf }">
        <v-icon>
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
      </template>
    </v-treeview>
  </div>

</template>
<style lang="scss">
  .v-breadcrumbs.theme--light {
    padding: 0;
    display: inline-block;
  }
  .theme--light.v-treeview .v-treeview-node--active {
    background: transparent;

    & > .v-treeview-node__root {
      background: rgba(0, 0, 0, 0.12)
    }
  }
</style>
<script>
  import Vue from 'vue';
  import { Watch } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import FolderActionMenu from '~/components/files/FolderActionMenu';

  const { Action, Mutation, State } = namespace('folders');

  export default @Component({
    components: {
      FolderActionMenu
    }
  })
  class Index extends Vue {
    @Action loadFoldersTree;
    @Action createFolder;
    @Action renameFolder;
    @Action deleteFolder;

    @Mutation setCurrentFolderId;

    @State foldersTree;
    @State loadingTree;
    @State currentFolder;
    @State currentFolderId;

    loadingCreation = false;
    loadingRenaming = false;
    loadingDeleting = false;

    tree = [];
    open = [];
    activeFolders = [];

    isOpenCreateFolderMenu = false;
    isOpenRenameFolderMenu = false;
    isOpenDeleteFolderMenu = false;
    creationError = false;
    renamingError = false;
    folderCreated = false;
    folderRenamed = false;
    folderDeleted = false;

    newFolderName = '';
    renameFolderName = '';

    mounted () {
      this.loadFoldersTree();
    }

    get folderPath () {
      if (!this.currentFolder) {
        return [];
      }

      return [...this.currentFolder.path, this.currentFolder];
    }

    @Watch('activeFolders')
    async onActiveFoldersChanged ([activeFolder]) {
      if (!activeFolder && this.currentFolderId) {
        this.activeFolders = [this.currentFolderId];
        return;
      }
      this.setCurrentFolderId(activeFolder);
    }

    async createFolderAction () {
      this.loadingCreation = true;
      this.creationError = false;
      try {
        await this.createFolder(this.newFolderName);

        this.isOpenCreateFolderMenu = false;
        this.folderCreated = true;
        this.newFolderName = '';
        this.loadFoldersTree();
      } catch ({ response }) {
        this.creationError = response.data.message;
      }
      this.loadingCreation = false;
    }

    async renameFolderAction () {
      this.loadingRenaming = true;
      this.renamingError = false;
      try {
        await this.renameFolder(this.renameFolderName);

        this.isOpenRenameFolderMenu = false;
        this.folderRenamed = true;
        this.loadFoldersTree();
      } catch ({ response }) {
        this.renamingError = response.data.message;
      }
      this.loadingRenaming = false;
    }

    async deleteFolderAction () {
      this.loadingDeleting = true;
      try {
        await this.deleteFolder();

        this.isOpenDeleteFolderMenu = false;
        this.folderDeleted = true;
        this.activeFolders = [];
        this.loadFoldersTree();
      } catch ({ response }) {
        // this.renamingError = response.data.message;
      }
      this.loadingDeleting = false;
    }

    showRenameMenu () {
      this.renameFolderName = this.currentFolder.title;
      this.isOpenRenameFolderMenu = true;
    }
  }
</script>
