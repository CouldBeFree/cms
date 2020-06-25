<template>

  <swatches v-model="color" show-fallback>
    <v-text-field slot="trigger" :value="value" :label="title" readonly>
      <div slot="prepend" class="color-block vue-swatches__trigger" :style="{'background-color': value}"></div>
    </v-text-field>
  </swatches>

</template>
<style scoped lang="scss">
  .color-block {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    border: 1px solid #000;
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default @Component({
    components: {
    }
  })
  class ColorPicker extends Vue {
    @Prop() title;

    @Prop() value;

    async mounted () {
    }

    get color () {
      return this.value;
    }

    set color (val) {
      this.$emit('input', val);
    }
  }
</script>
