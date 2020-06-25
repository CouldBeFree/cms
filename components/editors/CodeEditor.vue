<template>

  <textarea ref="editor">{{ source }}</textarea>

</template>
<script>
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';
  import { transformers } from '~/utils/transformer';

  export default @Component({
    components: {
    }
  })
  class CodeEditor extends Vue {
    @Prop({ type: String, default: 'css' }) type;

    @Prop(String) source;

    ignoreChanges = false;

    async mounted () {
      let editor;
      switch (this.type) {
        case 'html':
          editor = {
            mode: 'htmlmixed',
            autoCloseTags: true
          };
          break;
        case 'css':
          editor = {
            mode: 'sass',
            autoCloseBrackets: true
          };
          break;
        case 'js':
          editor = {
            mode: 'jsx',
            autofocus: true,
            autoCloseBrackets: true
          };
          break;
      }

      this.editor = await this.$createEditor(this.$refs.editor, {
        ...editor,
        readOnly: 'readonly' in this.$route.query
      });

      this.editor.on('change', e => {
        this.ignoreChanges = true;
        this.$emit('input', e.getValue());

        if (this.type === 'css') {
          transformers.get('sass').compile(e.getValue(), {
            indentedSyntax: false // scss
          }, result => {
            this.$emit('compiled', result.text);
          });
        }

        setTimeout(() => (this.ignoreChanges = false), 10);
      });
    }

    @Watch('source')
    onCodeUpdate (val) {
      if (this.ignoreChanges) {
        return;
      }
      this.editor.setValue(val);
      this.editor.refresh();
    }
  }
</script>
