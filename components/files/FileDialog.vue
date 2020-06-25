<template>

  <v-dialog scrollable v-model="isOpen" max-width="800" transition="dialog-bottom-transition">
    <v-card tile>
      <v-toolbar flat dark color="primary">
        <v-toolbar-title>Select <span v-if="!multiple">a</span> file<span v-if="multiple">s</span></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="isOpen = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
      <v-layout style="min-height: 500px;" wrap fill-height align-space-between justify-space-between>

        <v-flex xs12 md3>

          <folders-tree />

        </v-flex>
        <v-flex xs12 md9>

          <files-list style="margin-top: -14px" selectable :multiple="multiple" :accept="accept" :folder="currentFolder" v-model="selected" />

        </v-flex>
      </v-layout>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isOpen = false">Cancel</v-btn>
        <v-btn color="primary" :disabled="!selected || !selected.length" @click="selectFiles">Select</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>
<script>
  import Vue from 'vue';
  import { Model, Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import FoldersTree from '~/components/files/FoldersTree';
  import FilesList from '~/components/files/FilesList';

  const Folders = namespace('folders');
  const { State, Action } = namespace('files');

  export default @Component({
    components: {
      FoldersTree,
      FilesList
    }
  })
  class Index extends Vue {
    @Model('input') selectedFiles;

    @Prop(Boolean) open;
    @Prop(Array) accept;
    @Prop(Boolean) multiple;

    @Action uploadFiles;

    @Folders.State currentFolder;

    @State files;

    selected = [];

    mounted () {
      this.selected = this.selectedFiles;
    }

    get isOpen () {
      return this.open;
    }
    set isOpen (val) {
      this.$emit('update:open', val);
    }

    get folderPath () {
      if (!this.currentFolder || !this.currentFolder.path) {
        return [];
      }
      return [...this.currentFolder.path, this.currentFolder];
    }

    selectFiles () {
      this.isOpen = false;

      this.$emit('input', this.selected);
    }
  }
</script>
