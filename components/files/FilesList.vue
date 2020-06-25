<template>

  <div>
    <v-radio-group v-model="selectedFiles" hide-details class="files-radio ma-0 pa-0">
    <v-toolbar color="white" flat>
      <v-toolbar-title>
        <file-upload-btn class="mr-2" :disabled="!folder" :folder-id="folder && folder._id"></file-upload-btn>

        <v-icon left>mdi-folder</v-icon>

        <span v-if="folder">
          <v-breadcrumbs large :items="folderPath">
            <template v-slot:item="{ item }">
              <li>{{ item.title }}</li>
            </template>
          </v-breadcrumbs>
        </span>
        <span v-else>Root</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>view_module</v-icon>
      </v-btn>
    </v-toolbar>

    <v-progress-linear v-if="loadingFiles" :indeterminate="true" height="2" style="margin: -2px 0 0"></v-progress-linear>

    <v-data-table
        :server-items-length="totalItems"
        :headers="headers"
        :items="files"
        :items-per-page="25"
        :show-select="selectable"
        item-key="_id"
        :single-select="!multiple"
        v-model="selectedFiles" @update:options="onOptionsUpdated"
    >
      <template v-slot:item.data-table-select="{ item, props, on }">

        <v-simple-checkbox :disabled="!isCanAccept(item.contentType)" v-on="on" v-bind="props" hide-details></v-simple-checkbox>

      </template>
      <template v-slot:item.preview="{ item }">
        <v-avatar :size="32" color="grey lighten-4">
          <file-icon :id="item._id" :content-type="item.contentType" :has-preview="TYPES_WITH_PREVIEW.indexOf(item.contentType) !== -1" />
        </v-avatar>
      </template>
      <template v-slot:item.length="{ item }">
        {{ item.length | humanFileSize }}
      </template>
      <template v-slot:item.actions="{ item }">
        <delete-menu :loading="loadingFiles" @delete="onDeleteItem(item)">
          Are you sure to delete this file?
        </delete-menu>
      </template>
    </v-data-table>

    </v-radio-group>
  </div>
</template>
<style lang="scss">
  .b-file-item {
    padding: 3px 5px;
    position: relative;

    .b-file-select {
      position: absolute;
    }
  }
  .files-radio {
    .v-input__control {
      width: 100%;
    }
  }
</style>
<script>
  import Vue from 'vue';
  import moment from 'moment';
  import { Model, Watch, Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import FileIcon from './FileIcon';
  import FileUploadBtn from './FileUploadBtn';
  import { humanFileSize } from '~/helpers/formaters';
  import DeleteMenu from '~/components/common/DeleteMenu';

  const { Action, Mutation, State } = namespace('files');

  const TYPES_WITH_PREVIEW = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

  export default @Component({
    components: {
      DeleteMenu,
      FileIcon,
      FileUploadBtn
    },
    filters: {
      formatDate (date) {
        return moment(date).format('DD.MM.YYYY HH:mm');
      },
      humanFileSize
    }
  })
  class Index extends Vue {
    @Model('input', { type: Array, default: () => [] }) value;

    @Prop() folder;
    @Prop({ default: '*' }) accept;
    @Prop(Boolean) selectable;
    @Prop(Boolean) multiple;
    @Prop(Boolean) showType;

    @Mutation setFiles;
    @Mutation setPage;
    @Action loadFiles;
    @Action removeFile;

    @State files;
    @State totalItems;

    @State loadingFiles;

    isCanAccept(type) {
      if (this.accept === '*' || !Array.isArray(this.accept)) {
        return true;
      }
      return this.accept.indexOf(type) !== -1;
    }

    get headers() {
      const columns = [
        { text: '', value: 'preview', width: 32 },
        { text: 'Name', value: 'filename' }
      ];
      if (this.showType) {
        columns.push({ text: 'Type', value: 'contentType', width: 100 });
      }
      columns.push({ text: 'Size', value: 'length', width: 100 });
      columns.push({ text: '', value: 'actions', width: 32 });
      return columns;
    }

    get selectedFiles () {
      return Array.isArray(this.value) ? this.value : [this.value];
    }

    set selectedFiles (val) {
      if (!val) {
        return this.$emit('input', undefined);
      }
      if (!Array.isArray(val)) {
        val = [val];
      }
      this.$emit('input', val);
    }

    data() {
      return { TYPES_WITH_PREVIEW };
    }

    mounted () {
    }

    get folderPath () {
      if (!this.folder || !this.folder.path) {
        return [];
      }
      return [...this.folder.path, this.folder];
    }

    @Watch('folder')
    onFolderChanged (val) {
      if (!val) {
        this.setFiles([]);
        return;
      }
      this.loadFiles(val._id);
    }

    async onDeleteItem(file) {
      await this.removeFile(file._id);
      this.loadFiles(this.folder && this.folder._id);
    }

    onOptionsUpdated(options) {
      if (!this.folder) {
        return;
      }
      this.setPage(options.page);
      this.loadFiles(this.folder._id);
    }
  }
</script>
