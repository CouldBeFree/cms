<template>

  <items-list :items="items" :total="total" :page="page" :per-page="perPage" :loading="loading"
              @set-page="$emit('set-page', $event)" @update-list="$emit('update-list')">
    <template #header>

      <v-btn absolute dark fab top right color="action" @click="$emit('create')">
        <v-icon>add</v-icon>
      </v-btn>

    </template>
    <template #item="{ item }">

      <v-list-item>
        <v-list-item-action>
          <v-checkbox v-model="selected" :value="item._id"></v-checkbox>
        </v-list-item-action>

        <v-list-item-content class="md6">
          <v-list-item-title :class="item.noindex ? 'grey--text text--darken-1' : 'font-weight-bold'">
            {{ item.title }} -  {{ item.sku }}
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon @click.prevent="$emit('edit', item)">
            <v-icon color="grey lighten-1">edit</v-icon>
          </v-btn>
        </v-list-item-action>

        <v-list-item-action>
          <v-btn icon @click.prevent="$emit('clone', item)">
            <v-icon color="grey lighten-1">mdi-content-copy</v-icon>
          </v-btn>
        </v-list-item-action>

        <v-list-item-action>
          <delete-menu :loading="loadingDeleting" @delete="$emit('delete-items', [item.id])">
            Are you sure you want to delete this?
          </delete-menu>
        </v-list-item-action>
      </v-list-item>
    </template>
    <template #actions>
      <delete-menu :loading="loadingDeleting" @delete="$emit('delete-items', [...selected]); selected = []">
        <template v-slot:activator="{ on }">
        <v-btn v-on="on" text color="error" :disabled="!selected || !selected.length">Delete selected<span v-if="selected && selected.length">&nbsp;({{selected.length}})</span></v-btn>
        </template>
        Are you sure you want to delete selected pages?
      </delete-menu>
    </template>
  </items-list>

</template>
<style lang="scss">
</style>
<script>
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import ItemsList from '~/components/common/ItemsList';
import DeleteMenu from '~/components/common/DeleteMenu';

export default @Component({
  components: {
    ItemsList,
    DeleteMenu
  }
})
class AdaptersList extends Vue {
  @Prop(Array) items;
  @Prop(Boolean) loading;
  @Prop(Boolean) loadingDeleting;

  @Prop({ type: Number, default: 1 }) page;
  @Prop({ type: Number, default: 0 }) total;
  @Prop({ type: Number, default: 20 }) perPage;

  selectedIds = [];

  get selected() {
    return this.selectedIds || [];
  }
  set selected(items) {
    console.info(items);
    this.selectedIds = items || [];
  }
}
</script>
