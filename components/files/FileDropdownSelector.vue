<template>

  <v-menu :close-on-content-click="false" v-model="isMenuOpen"
          :nudge-width="200"
          offset-y left
  >
    <template v-slot:activator="{ on }">
      <span v-on="on">Files ({{files.length}})</span>
    </template>

    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon class="grey lighten-1 white--text">mdi-file-multiple</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>Attached files</v-list-item-title>
            <!--<v-list-item-subtitle>Founder of Vuetify.js</v-list-item-subtitle>-->
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon @click="isFileDialogOpen = true; isMenuOpen = false">
              <v-icon>add</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-divider v-if="files.length"></v-divider>

      <v-list v-if="files.length">
        <v-list-item v-for="(file, index) in files" :key="index">
          <v-list-item-avatar>
            <file-icon :content-type="file.contentType" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{file.filename}}</v-list-item-title>
            <v-list-item-subtitle>{{file.contentType}}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon @click="removeFile(file)">
              <v-icon>remove</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>

    <file-dialog :open.sync="isFileDialogOpen" :value="files" @input="$emit('input', $event)" />
  </v-menu>

</template>
<script>
  import Vue from 'vue';
  import without from 'lodash/without';
  import { Model } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';
  import FileDialog from '../files/FileDialog';
  import FileIcon from './FileIcon';

  export default @Component({
    components: {
      FileDialog,
      FileIcon
    }
  })
  class FileDropdownSelector extends Vue {
    @Model('input', { type: Array }) files;

    isMenuOpen = false;
    isFileDialogOpen = false;

    removeFile (file) {
      this.$emit('input', without(this.files, file));
    }
  }
</script>
