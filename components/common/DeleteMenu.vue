<template>

  <v-menu left :close-on-content-click="false" :nudge-width="250" offset-y v-model="showDeleteMenu">
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on">
        <v-btn icon ripple @click.prevent v-on="on">
          <v-icon color="grey lighten-1">delete</v-icon>
        </v-btn>
      </slot>
    </template>

    <v-card dark color="error">
      <v-card-text><slot>Are you sure to delete this?</slot></v-card-text>
      <v-card-actions class="d-block text-xs-right">
        <v-btn text :loading="loading" :disabled="loading" @click="$emit('delete')">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

</template>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default @Component({
    components: {
    }
  })
  class ColorPicker extends Vue {
    @Prop(Boolean) loading;

    showDeleteMenu = false;
  }
</script>
