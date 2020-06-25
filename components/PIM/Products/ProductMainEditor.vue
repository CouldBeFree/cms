<template>

  <v-layout>
    <v-flex xs2>

      <file-selector v-model="details.images"></file-selector>

    </v-flex>
    <v-flex xs2>
      <v-text-field label="SKU" :value="details.sku"></v-text-field>
    </v-flex>
    <v-flex xs8>

      <v-text-field label="Title" :value="details.title"></v-text-field>


    </v-flex>
  </v-layout>

</template>
<style lang="scss">
</style>
<script>
  import { Vue, Prop, Component } from 'vue-property-decorator';
  import FileSelector from '~/components/files/FileSelector';

  export default @Component({
    components: {
      FileSelector
    }
  })
  class ProductMainEditor extends Vue {
    @Prop() details;
  }
</script>
