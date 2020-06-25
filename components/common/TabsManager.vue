<template>

  <v-card>
    <v-tabs :value="value" @change="$emit('input', $event)">
      <v-tab href="#list" ripple>List</v-tab>
      <v-tab v-for="tab, n in tabs" :key="tab._id" :href="`#${tab._id}`" ripple>
        {{tab.title}}
        <v-icon class="ml-2" small @click="closeTab(tab)">mdi-close</v-icon>
      </v-tab>
      <v-tab-item value="list">

        <slot name="list"></slot>

      </v-tab-item>
      <v-tab-item v-for="tab, n in tabs" :value="tab._id" transition="fade" reverse-transition="fade" :key="n">

        <div class="pa-3">
          <slot name="tab" :item="tab"></slot>
        </div>

      </v-tab-item>
    </v-tabs>
  </v-card>

</template>
<script>
  import Vue from 'vue';
  import { Model, Prop, Emit } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default
  @Component({
    components: {}
  })
  class TabsManager extends Vue {
    @Model('input', { default: 'list' }) value;
    @Prop(Array) tabs;
    @Prop({ type: String, default: 'List' }) firstTabTitle;

    @Emit('close-tab')
    closeTab (item) {

    }
  }
</script>
