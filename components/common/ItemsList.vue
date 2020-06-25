<template>

  <v-card id="items-list">
    <v-progress-linear v-if="loading" style="margin-top: 0px" class="mb-0" :height="3" indeterminate />
    <slot name="header"></slot>

    <div v-if="loading" class="pt-3">
      <content-placeholders :rounded="true">
        <v-list-item v-for="n in (items ? items.length : 10)" :key="n" @click="">
          <v-list-item-action>
            <v-avatar color="grey lighten-3" size="40">
              <content-placeholders-img />
            </v-avatar>
          </v-list-item-action>

          <v-list-item-content class="pt-2">
            <v-list-item-title>
              <content-placeholders-heading />
            </v-list-item-title>

            <v-list-item-subtitle>
              <content-placeholders-text :lines="1" />
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

      </content-placeholders>
    </div>
    <div v-else>

      <div v-if="!items || !items.length" class="py-3 px-4">
        The list is empty
      </div>
      <v-list v-else class="pt-3">
        <div v-for="item, n in items" :key="`item${n}`">
          <slot name="item" :item="item"></slot>
        </div>
      </v-list>
    </div>

    <v-card-actions>
    <v-layout>
      <v-flex>
        <slot name="actions"></slot>
      </v-flex>
      <v-flex class="align-end text-xs-right">
          <v-pagination
            v-if="countPages > 1"
            class="pa-2"
            :value="page"
            :length="countPages"
            @input="$emit('set-page', $event); $emit('update-list'); $vuetify.goTo('#items-list', { easing: 'easeInOutCubic' })"
          />
      </v-flex>
    </v-layout>
    </v-card-actions>
  </v-card>

</template>
<style>
  .vue-content-placeholders-img {
    height: 40px;
    border-radius: 50% !important;
  }
  .vue-content-placeholders-heading__title {
    width: 150px !important;
  }
  .vue-content-placeholders-text__line {
    width: 200px !important;
  }
</style>
<script>
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import DeleteMenu from '~/components/common/DeleteMenu';

export default @Component({
  components: {
    DeleteMenu
  }
})
class ItemsList extends Vue {
  @Prop(Array) items;
  @Prop(Boolean) loading;
  @Prop(Boolean) loadingDeleting;

  @Prop({ type: Number, default: 1 }) page;
  @Prop({ type: Number, default: 0 }) total;
  @Prop({ type: Number, default: 20 }) perPage;

  get countPages () {
    if (!this.perPage) {
      return 1;
    }
    return Math.ceil(this.total / this.perPage);
  }
}
</script>
