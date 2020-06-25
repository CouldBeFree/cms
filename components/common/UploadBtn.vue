<template>

  <v-btn color="primary" @click="chooseFile" :disabled="disabled || loading">
    <slot>
      <v-icon>attach_file</v-icon>
    </slot>
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
  class UploadBtn extends Vue {
    @Prop({ type: String, default: '/api/v1/files/upload' }) endpoint;

    @Prop({ default: '*' }) accept;

    @Prop(Boolean) multiple;

    @Prop(Boolean) disabled;

    @Prop(String) folderId;

    @Action uploadFiles;

    loading = false;

    chooseFile () {
      this.$refs.fileInput.click();
    }

    async onFileChange ($event) {
      const files = $event.target.files || $event.dataTransfer.files;

      this.$emit('start-uploading');
      this.loading = true;
      try {
        const result = await this.uploadFiles({
          endpoint: this.endpoint,
          folderId: this.folderId,
          files
        });
        console.info(result);
        this.$emit('uploaded', result);
      } catch (err) {

      }
      this.$emit('end-uploading');
      this.loading = false;
    }
  }
</script>
