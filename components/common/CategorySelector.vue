<template>

  <v-autocomplete :value="value" @input="onValueChange"
                  :items="categories" :rules="rules"
                  color="primary" return-object
                  :label="placeholder"
                  item-text="title"
                  item-value="_id"
  ></v-autocomplete>

</template>
<script>
  import { Vue, Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';

  const { State, Action } = namespace('pim-products');

  export default @Component({
    components: {
    }
  })
  class CategorySelector extends Vue {
    @Prop() value;
    @Prop(Boolean) disabled;
    @Prop(Array) rules;
    @Prop({ type: String, default: 'Category' }) placeholder;

    @State categories;
    @State loading;

    @Action loadCategories;

    search = '';

    mounted() {
      this.loadCategories();
    }

    onValueChange(val) {
      this.$emit('input', val);
    }
  }
</script>

