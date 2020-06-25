<template>

  <v-btn text @click="chooseFile" :disabled="disabled">
    <v-icon>mdi-upload</v-icon> Upload
    <input type="file"
           :accept="accept"
           :multiple="multiple"
           :disabled="disabled"
           ref="fileInput" @change="onFileChange">
  </v-btn>

</template>
<style scoped>
  input[type=file] {
    position: absolute;
    left: -99999px;
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';

  const { Action } = namespace('files');

  export default @Component({
    components: {
    }
  })
  class Index extends Vue {
    @Prop({ default: '*' }) accept;

    @Prop(Boolean) multiple;

    @Prop(Boolean) disabled;

    @Prop(String) folderId;

    @Action uploadFiles;

    chooseFile () {
      this.$refs.fileInput.click();
    }

    onFileChange ($event) {
      const files = $event.target.files || $event.dataTransfer.files;

      this.uploadFiles({ endpoint: '/api/v1/files/upload', folderId: this.folderId, files });
    }
  }
</script>
