<template>

  <div>

    <product-main-editor :details="details"></product-main-editor>

    <product-attribute-editor
            :groups="attributeGroups"
            v-model="details.attributes">
    </product-attribute-editor>

    <v-btn @click.prevent="saveProduct" color="primary">Save</v-btn>
    <v-btn @click="closeCurrentTab(details)" text color="primary">Cancel</v-btn>

  </div>

</template>
<style lang="scss">
</style>
<script>
  import { Vue, Prop, Component } from 'vue-property-decorator';
  import { namespace } from 'nuxt-class-component';
  import ProductMainEditor from './ProductMainEditor';
  import ProductAttributeEditor from './ProductAttributeEditor';

  const { Mutation } = namespace('pim-products');

  export default @Component({
    components: {
      ProductAttributeEditor,
      ProductMainEditor
    }
  })
  class ProductEditor extends Vue {
    @Prop() id;

    @Mutation closeTab;

    details = {};

    attributeGroups = [];

    async mounted() {
      if (!this.id) {
        return;
      }

      this.loading = true;
      try {
        this.details = await this.$axios.$get(`/api/v1/data/${this.id}`);

        if (this.details.category) {
          this.attributeGroups = await this.$axios.$get(`/api/v1/categories/${this.details.category._id}/groups`);
        }
      } catch (err) {
        if (err.message.indexOf('404') !== -1) {
          this.$emit('close-product');
        }
      }
      this.loading = false;
    }

    async saveProduct() {
      this.loading = true;
      try {
        await this.$axios.$put(`/api/v1/data/${this.details._id}`, this.details);

        // this.$message.success('Saved');
      } catch (err) {
        // this.$message.error(err.message);
      }
      this.loading = false;
      this.$emit('save', true);
    }

    closeCurrentTab (tabId) {
      this.closeTab(tabId);
    }
  }
</script>
