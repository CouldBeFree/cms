<template>

  <div class="upload-status-container" v-if="uploadFiles && uploadFiles.length">
    <v-card>

      <v-list>
        <v-list-item v-for="file in uploadFiles" :key="file.id" class="pb-2">
          <v-list-item-avatar @click="onItemClick(item.url)">
            <v-icon color="error" v-if="file.error">error</v-icon>
            <v-icon v-else>attachment</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-subtitle v-if="!file.error">{{file.size|humanFileSize}}</v-list-item-subtitle>
            <v-list-item-title>{{file.name}}</v-list-item-title>
            <v-progress-linear v-if="!file.error" :value="file.percent" height="2" class="ma-0"></v-progress-linear>
            <v-list-item-subtitle v-else>{{file.error}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="removeUpload(file)">
              <v-icon v-if="file.percent === 100" class="success--text">check</v-icon>
              <v-icon v-else>close</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

    </v-card>
  </div>

</template>
<style>
  .upload-status-container {
    position: fixed;
    bottom: 0;
    right: 20px;
    width: 400px;
    z-index: 1000;
  }
</style>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';

  const { Mutation, State } = namespace('files');

  export default @Component({
    components: {},
    filters: {
      humanFileSize (bytes, si = true) {
        var thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
          return bytes + ' B';
        }
        var units = si
          ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
          : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
          bytes /= thresh;
          ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
      }
    }
  })
  class Index extends Vue {
    @State uploadFiles;

    @Mutation removeUploadFile;

    intervalTimer = null;

    mounted () {
      this.intervalTimer = setInterval(() => this.checkUploadedFiles(), 1000);
    }

    beforeDestroy () {
      clearInterval(this.intervalTimer);
    }

    removeUpload (file) {
      this.removeUploadFile(file.id);
    }

    checkUploadedFiles () {
      for (let file of this.uploadFiles) {
        if (file.percent === 100) {
          setTimeout(() => this.removeUploadFile(file.id), 5000);
        }
      }
    }
  }
</script>
