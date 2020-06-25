<template>
  <div class="pan">

    <div class="pan-head">
      Html
    </div>

    <code-editor type="html" :source="panDetails.source" @input="updateDetails('source', $event)" @compiled="updateDetails('compiled', $event)" />
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

  export default @Component({
    components: {
      CodeEditor
    }
  })
  class HtmlPan extends Vue {
    @Prop() details;

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
