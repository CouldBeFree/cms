<template>

  <div>
      <v-container fluid>
        <no-ssr v-if="details">

            <v-card-text>


              <v-text-field :value="details.name" @input="setDetailsField(['name', $event])" label="Domain name"></v-text-field>


              <v-select :value="details.template" @input="setDetailsField(['template', $event])" :items="templates" item-text="title" return-object
                      label="Template"
              ></v-select>
            </v-card-text>

            <v-card-actions>
              <v-btn color="blue darken-1" dark :loading="loading" :disabled="loading" @click="saveTemplate">Save</v-btn>

              <v-snackbar v-model="saved">
                Domain saved!
                <v-btn dark text @click="saved = false">
                  Close
                </v-btn>
              </v-snackbar>
            </v-card-actions>

        </no-ssr>
      </v-container>

  </div>

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
  import Component, { namespace } from 'nuxt-class-component';
  import HtmlPreview from '~/components/editors/HtmlPreview';
  import ColorPicker from '~/components/common/ColorPicker';
  import FontPicker from '~/components/common/FontPicker';
  import DragZone from '~/components/common/DragZone';
  import DragHandle from '~/components/common/DragHandle';

  const { Action, State, Mutation } = namespace('domains');

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
    @Action loadDomains;
    @Action loadDomainDetails;
    @Action saveDomainDetails;

    @Mutation setDetailsField;

    @State details;

    templates = [];

    cssCode = '';

    compiling = false;

    loading = false;

    saved = false;

    get domainId () {
      return this.$route.params.domainId;
    }

    async mounted () {
      await this.loadDomainDetails(this.domainId);

      this.templates = await this.$axios.$get('/api/v1/templates', { params: {} });
    }

    async saveTemplate () {
      this.loading = true;
      await this.saveDomainDetails();

      this.saved = true;
      this.loading = false;
    }
  }
</script>
