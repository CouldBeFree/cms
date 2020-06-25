<template>

  <v-container fill-height grid-list-md fluid>

    <drag-zone class="fill-height">
      <v-container fluid>
        <no-ssr v-if="details.variables">

          <v-text-field prepend-icon="mdi-brush" :value="details.title" @input="setDetailsField(['title', $event])" label="Template title"></v-text-field>

          <v-card>
            <v-list two-line subheader>
              <v-subheader>Fonts</v-subheader>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <font-picker title="Headers font" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    <font-picker title="Main font" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Base font size</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-layout row>
                    <v-flex>

                      <v-slider :value="details.variables.fontSizeBase" @input="setDetailsField(['variables.fontSizeBase', $event])"
                                :min="8" :max="50" label=""></v-slider>

                    </v-flex>

                    <v-flex shrink style="width: 70px">
                      <v-text-field v-model="details.variables.fontSizeBase" class="mt-0" hide-details single-line type="number"
                                    suffix="px"></v-text-field>
                    </v-flex>
                    </v-layout>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list
                    subheader
                    two-line
            >
              <v-subheader>Colors</v-subheader>

              <v-list-item>
                <v-list-item-content class="overflow-visible">
                  <v-list-item-subtitle>
                    <color-picker title="Background color" :value="details.variables.bodyBgColor" @input="setDetailsField(['variables.bodyBgColor', $event])" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content class="overflow-visible">
                  <v-list-item-subtitle>
                    <color-picker title="Text color" :value="details.variables.bodyColor" @input="setDetailsField(['variables.bodyColor', $event])" />
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

          <v-list subheader>
            <v-subheader>Options</v-subheader>

            <v-list-item @click="">
              <v-list-item-action>
                <v-checkbox v-model="enableRounded"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content @click="enableRounded = !enableRounded">
                <v-list-item-title>Enable rounded</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="">
              <v-list-item-action>
                <v-checkbox v-model="enableGradients"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content @click="enableGradients = !enableGradients">
                <v-list-item-title>Enable gradients</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>

            <v-card-actions>
              <v-btn color="blue darken-1" dark :loading="loading" :disabled="loading" @click="saveTemplate">Save</v-btn>

              <v-snackbar v-model="saved">
                Template saved!
                <v-btn dark text @click="saved = false">
                  Close
                </v-btn>
              </v-snackbar>
            </v-card-actions>
          </v-card>

        </no-ssr>
      </v-container>

      <html-preview :loading="compiling" :css-code="cssCode" :html-code="htmlCode" />
    </drag-zone>

  </v-container>

</template>
<style lang="scss">
  .overflow-visible.v-list__tile__content {
    overflow: visible;
    & .v-list__tile__sub-title {
      overflow: visible;
    }
    .vue-swatches__container {
      white-space: normal;
    }
  }
</style>
<script>
  import Vue from 'vue';
  import { Watch } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import HtmlPreview from '~/components/editors/HtmlPreview';
  import ColorPicker from '~/components/common/ColorPicker';
  import FontPicker from '~/components/common/FontPicker';
  import DragZone from '~/components/common/DragZone';
  import DragHandle from '~/components/common/DragHandle';
  import { transformers, loadSass } from '~/utils/transformer';
  import previewTmpl from './preview.tmpl.html';

  const { Action, State, Mutation } = namespace('templates');

  const template = typeof atob !== 'undefined' ? atob(previewTmpl.replace('data:text/html;base64,', '')) : '';

  export default @Component({
    // middleware: ['auth'],
    components: {
      HtmlPreview,
      ColorPicker,
      FontPicker,
      DragZone,
      DragHandle
    }
  })
  class Index extends Vue {
    @Action loadTemplates;
    @Action loadTemplateDetails;
    @Action saveTemplateDetails;

    @Mutation setDetailsField;
    @State templates;

    @State details;

    htmlCode = template;

    cssCode = '';

    compiling = false;

    loading = false;

    saved = false;

    get templateId () {
      return this.$route.params.templateId;
    }

    async mounted () {
      await loadSass();

      await this.loadTemplateDetails(this.templateId);
    }

    async saveTemplate () {
      this.loading = true;
      await this.saveTemplateDetails();

      this.saved = true;
      this.loading = false;
    }

    @Watch('details.variables', { deep: true })
    rebuildTemplate (variables) {
      if (this.compiling || !variables) {
        return;
      }
      console.info(variables);
      this.compiling = true;
      let code =
        `$body-color: ${variables.bodyColor};` +
        `$enable-rounded: ${variables.enableRounded};` +
        `$enable-gradients: ${variables.enableGradients};` +
        `$font-size-base: ${variables.fontSizeBase / 16}rem;` +
        `$body-bg: ${variables.bodyBgColor};`;

      code += '@import "bootstrap/scss/functions";\n' +
        '@import "bootstrap/scss/variables";\n' +
        '@import "bootstrap/scss/mixins";\n' +
        '@import "bootstrap/scss/reboot";\n' +
        '@import "bootstrap/scss/type";\n' +
        '@import "bootstrap/scss/images";\n' +
        '@import "bootstrap/scss/buttons";\n' +
        '@import "bootstrap/scss/nav";\n' +
        '@import "bootstrap/scss/navbar";\n' +
        '@import "bootstrap/scss/dropdown";\n' +
        '@import "bootstrap/scss/utilities";\n' +
        '@import "bootstrap/scss/forms";\n' +
        '@import "bootstrap/scss/grid";\n';

      transformers.get('sass').compile(code + '.test {}', {
        indentedSyntax: false
      }, result => {
        console.info(result);

        this.cssCode = result.text;

        this.compiling = false;
      });
    }

    get enableRounded () {
      return this.details.variables.enableRounded;
    }

    set enableRounded (val) {
      this.setDetailsField(['variables.enableRounded', val]);
    }

    get enableGradients () {
      return this.details.variables.enableGradients;
    }

    set enableGradients (val) {
      this.setDetailsField(['variables.enableGradients', val]);
    }
  }
</script>
