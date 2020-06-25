<template>
  <div>
    <v-dialog :value="value" @input="$emit('input', $event)" persistent max-width="600px" :fullscreen="fullscreen || $vuetify.breakpoint.smAndDown"
              transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="primary white--text">
          <span class="headline">
              <span v-if="details.Id">Edit item</span>
              <span v-else>New item</span>
          </span>
          <v-spacer />
          <v-btn icon dark @click="fullscreen = !fullscreen">
            <v-icon v-if="!fullscreen">mdi-fullscreen</v-icon>
            <v-icon v-else>mdi-fullscreen-exit</v-icon>
          </v-btn>
          <v-btn text icon color="white" class="ma-0" @click="$emit('input', false)">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-layout wrap fill-height>
          <v-flex xs12>
            <v-alert class="mt-0" v-model="showError" type="error" dismissible>{{ errorMessage }}</v-alert>
          </v-flex>

          <v-flex xs12>
            <v-card-text>
              <v-form v-model="validForm">
                <slot></slot>
              </v-form>
            </v-card-text>
          </v-flex>

          <v-flex xs12 class="text-xs-right pt-4 px-2 pb-2">
            <v-btn text color="primary" @click="$emit('input', false)">Cancel</v-btn>

            <v-btn color="primary" :disabled="!validForm || loading" :loading="loading" @click="submitSaveItem">Save</v-btn>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  import Vue from 'vue';
  import { Model, Prop, Inject } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default @Component({
    components: {
    }
  })
  class ItemEditor extends Vue {
    @Inject('globalApp') globalApp;

    @Model('input') value;
    @Prop({ type: String, default: 'Item has been saved' }) successMessage;
    @Prop() saveFunc;

    loading = false;
    fullscreen = false;
    validForm = false;

    showError = false;

    errorMessage = null;

    details = {};

    async submitSaveItem () {
      this.loading = true;
      this.showError = false;

      try {
        const data = await this.saveFunc();

        this.$emit('saved', data);

        this.$emit('input', false);

        this.globalApp.showSuccess(this.successMessage);
      } catch (err) {
        this.errorMessage = (err.response && err.response.data) ? err.response.data.message : 'Network problem';

        this.showError = true;
      }
      this.loading = false;
    }
  }
</script>
