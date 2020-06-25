<template>

  <v-container fluid fill-height>

    <v-layout>

      <v-flex xs12 md2>

        <folders-tree />

      </v-flex>
      <v-flex xs12 md10>
        <v-card>
          <files-list show-type :folder="currentFolder" />
        </v-card>


      </v-flex>

    </v-layout>

  </v-container>

</template>


<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  // import AuthMixin from '@biznestream/nuxt-base/mixins/auth';
  import FoldersTree from '~/components/files/FoldersTree';
  import FilesList from '~/components/files/FilesList';

  const { State } = namespace('folders');

  export default @Component({
    components: {
      FoldersTree,
      FilesList
    }
    // middleware: ['auth'],
    // mixins: [AuthMixin]
  })
  class Index extends Vue {
    @State currentFolder;

    @State files;

    selected = [];

    get folderPath () {
      if (!this.currentFolder || !this.currentFolder.path) {
        return [];
      }
      return [...this.currentFolder.path, this.currentFolder];
    }
  }
</script>
