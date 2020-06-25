<template>

  <v-layout fill-height>
    <v-flex xs2>

      <v-list class="fill-height" nav dense>
        <v-subheader>Categories</v-subheader>
        <v-list-item :to="{ name: 'pim' }" exact>
          All products
        </v-list-item>
        <v-list-item v-for="category in categories" :key="category._id" :to="{ name: 'pim', query: { category: category._id }}" exact>
          {{category.title}}
        </v-list-item>
      </v-list>

    </v-flex>
    <v-flex xs10>

      <v-container fluid>
      <h1 class="display-1 font-weight-thin mb-3">Products</h1>

      <tabs-manager first-tab-title="Entries" :value="currentTab" @input="setTab" :tabs="tabs" @close-tab="closeTab">

        <template #list>

          <v-btn absolute dark fab top right color="action" @click="showCreateDialog = true">
            <v-icon>add</v-icon>
          </v-btn>

          <products-list :items="data" @edit="openTab"></products-list>

          <item-editor v-model="showCreateDialog" :save-func="saveProduct">
            <v-text-field :rules="[emptyValidation]" label="Title" :value="details.title" @input="setDetailsParam(['title', $event])"></v-text-field>
            <v-text-field :rules="[emptyValidation]" label="SKU" :value="details.sku" @input="setDetailsParam(['sku', $event])"></v-text-field>

            <category-selector :value="details.category" @input="setDetailsParam(['category', $event])"></category-selector>
          </item-editor>
        </template>
        <template #tab="{ item }">

          <product-editor :id="item._id" @save="getCategories"></product-editor>

        </template>

      </tabs-manager>

      </v-container>

    </v-flex>
  </v-layout>

</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import { Watch } from 'vue-property-decorator';
  import TabsManager from '~/components/common/TabsManager';
  import ProductsList from '~/components/PIM/Products/ProductsList';
  import ProductEditor from '~/components/PIM/Products/ProductEditor';
  import ItemEditor from '~/components/common/ItemEditor';
  import CategorySelector from '~/components/common/CategorySelector';

  const { State, Mutation, Action } = namespace('pim-products');

  export default
  @Component({
    middleware: [],
    components: {
      TabsManager,
      ProductEditor,
      ProductsList,
      ItemEditor,
      CategorySelector
    }
  })
  class PimPage extends Vue {
    @State tabs;
    @State data;
    @State details;
    @State categories;
    @State currentTab;

    @Mutation openTab;
    @Mutation closeTab;
    @Mutation setTab;
    @Mutation setCategoryId;
    @Mutation setDetailsParam;

    @Action loadData;
    @Action loadCategories;
    @Action saveProduct;

    showCreateDialog = false;

    emptyValidation = v => !!v || 'Field is required';

    productForm = {};

    isProductModalVisible = false;

    async refreshLists () {
      this.products = await this.$axios.$get('/api/v1/data');
    }

    mounted () {
      this.getCategories();
    }

    @Watch('$route')
    trackRoute (to) {
      const { category } = to.query;
      this.setCategoryId(category);
      this.loadData();
      this.setTab('index');
    }

    getCategories () {
      const { category } = this.$route.query;
      if (category) {
        this.setCategoryId(category);
      }

      this.loadData();
      this.loadCategories();
    }
  }
</script>

<style lang="scss">
  .v-window__container{
    height: 100%!important;

    &--is-active{
      overflow: unset!important;
    }
  }
</style>
