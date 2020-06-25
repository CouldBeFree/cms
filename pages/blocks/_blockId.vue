<template>

  <div class="fill-height">
    <div v-if="loading">
      Loading...
    </div>
    <div class="fill-height" v-else-if="details._id">

      <div>
        <v-toolbar card prominent>
          <v-btn icon :to="{name: 'blocks'}">
            <v-icon>navigate_before</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{details.title}}
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <pan-selector />

          <v-spacer></v-spacer>

          <device-selector />

          <v-btn :disabled="!isDirty" color="primary" @click="saveBlock">Save</v-btn>
        </v-toolbar>
      </div>
        <drag-zone class="fill-height" style="position: relative; height: calc(100% - 66px)" v-if="details">
          <block-details v-if="visiblePans.indexOf('details') !== -1" @input="setDetailsField(['attributes', $event])" :attributes="details.attributes" />

          <html-pan :details="details.html" @input="setDetailsField(['html', $event])" v-if="visiblePans.indexOf('html') !== -1" />

          <css-pan :details="details.css" @input="setDetailsField(['css', $event])" v-if="visiblePans.indexOf('css') !== -1" />

          <js-pan :details="details.js" @input="setDetailsField(['js', $event])" v-if="visiblePans.indexOf('js') !== -1" />

          <output-editor :code="details" />
        </drag-zone>

    </div>
  </div>
</template>
<style lang="scss">

</style>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import BlockDetails from '~/components/editors/BlockDetails';
  import CodeEditor from '~/components/editors/CodeEditor';
  import OutputEditor from '~/components/editors/Output';
  import DeviceSelector from '~/components/editors/DeviceSelector';
  import PanSelector from '~/components/editors/PanSelector';
  import DragZone from '~/components/common/DragZone';
  import DragHandle from '~/components/common/DragHandle';
  import CssPan from '~/components/Pans/CSSPan';
  import JsPan from '~/components/Pans/JsPan';
  import HtmlPan from '~/components/Pans/HtmlPan';
  import { loadSass } from '~/utils/transformer';

  const { Action, Mutation, State } = namespace('blocks');
  const Pans = namespace('pans');

  export default @Component({
    // middleware: ['auth'],
    components: {
      BlockDetails,
      CodeEditor,
      OutputEditor,
      DeviceSelector,
      PanSelector,
      DragZone,
      DragHandle,
      CssPan,
      JsPan,
      HtmlPan
    }
  })
  class Index extends Vue {
    @Action loadBlockDetails;
    @Action saveBlockDetails;

    @Mutation setCompiledCode;
    @Mutation setCode;
    @Mutation setDetailsField;

    @State isDirty;
    @State details;
    @Pans.Mutation setVisiblePans;
    @Pans.State visiblePans;

    loading = false;

    get accountId () {
      return this.$route.params.companyId;
    }

    get blockId () {
      return this.$route.params.blockId;
    }

    async mounted () {
      this.loading = true;

      await loadSass();
      await this.loadBlockDetails(this.blockId);

      if (this.details.pans) {
        this.setVisiblePans(this.details.pans);
      }

      this.loading = false;
    }

    updateDetails (type, details) {
      this.setDetails(type, details);
    }

    updateCompiledCode (code) {
      this.setCompiledCode(code);
    }

    saveBlock () {
      this.saveBlockDetails();
    }
  }
</script>
