<template>

  <v-btn-toggle multiple mandatory v-model="pans">
    <v-btn text @click.prevent="togglePan('details')" value="details">Details</v-btn>
    <v-btn text @click.prevent="togglePan('html')" value="html">Html</v-btn>
    <v-btn text @click.prevent="togglePan('css')" value="css">CSS</v-btn>
    <v-btn text @click.prevent="togglePan('js')" value="js">JS</v-btn>
  </v-btn-toggle>

</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';

  const Blocks = namespace('blocks');
  const { Mutation, State } = namespace('pans');

  export default @Component({
    components: {}
  })
  class DeviceSelector extends Vue {
    @State visiblePans;

    @Mutation togglePan;

    @Blocks.Mutation setDetailsPans;

    get pans () {
      return this.visiblePans;
    }

    set pans (val) {
      this.setDetailsPans(this.visiblePans);
    }
  }
</script>
