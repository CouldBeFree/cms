<template>
  <div class="pan">

    <div class="pan-head">
      Javascript

      <file-dropdown-selector :files="panDetails.files" @input="updateDetails('files', $event)"></file-dropdown-selector>
    </div>

    <code-editor type="js" :source="panDetails.source" @input="updateDetails('source', $event)" @compiled="updateDetails('compiled', $event)" />
  </div>
</template>
<style>
  .pan {
    position: absolute;
    top: 0;
    bottom: 0;
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';
  import CodeEditor from '~/components/editors/CodeEditor';
  import FileDropdownSelector from '~/components/files/FileDropdownSelector';

  export default @Component({
    components: {
      CodeEditor,
      FileDropdownSelector
    }
  })
  class JavascriptPan extends Vue {
    @Prop() details;

    isFileDialogOpen = false;

    get panDetails () {
      return this.details;
    }

    async mounted () {
    }

    updateDetails (field, value) {
      const det = { ...this.details };
      det[field] = value;
      this.$emit('input', det);
    }
  }
</script>
