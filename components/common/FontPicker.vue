<template>

  <div>

    <v-autocomplete :loading="loadingFonts" :search-input.sync="search" :items="fontsFiltered"
                    item-text="family"
                    item-value="family"
                    return-object prepend-icon="mdi-format-font"
                    v-model="font" :label="title"
    ></v-autocomplete>

    {{font}}



  </div>

</template>

<script>
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';

  const { Action, State } = namespace('fonts');

  export default @Component({
    components: {
    }
  })
  class Index extends Vue {
    @Prop() title;

    @State fonts;
    @State loadingFonts;

    @Action loadFonts;

    font = null;

    search = '';

    fontsFiltered = [];

    async mounted () {
      this.fontsFiltered = await this.loadFonts();
    }

    @Watch('search')
    onSearchChanged (val) {
      if (!val) {
        return this.fonts;
      }
      this.fontsFiltered = this.fonts.filter(font => {
        return font.family.indexOf(val) !== -1;
      });
    }
  }
</script>
