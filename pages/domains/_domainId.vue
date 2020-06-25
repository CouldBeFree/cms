<template>

  <v-container fluid>

    <v-card>

      <v-toolbar color="blue-grey lighten-5" tabs>

        <v-toolbar-title>{{details.name}}</v-toolbar-title>

        <template slot="extension">
          <v-tabs color="blue-grey lighten-5"
              slider-color="cyan" v-if="details._id">
            <v-tab ripple :to="{ name: 'domains-domainId', params: { domainId: details._id } }" nuxt>Pages</v-tab>
            <v-tab ripple :to="{ name: 'domains-domainId-edit', params: { domainId: details._id } }" nuxt>Domain info</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>

    <nuxt />

    </v-card>

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
