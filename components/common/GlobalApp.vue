<template>
  <div class="fill-height">
    <slot></slot>

    <v-snackbar v-model="isShowSuccess" :bottom="false" color="success" :timeout="0">
      {{ successMessage }}
      <v-btn color="white" text @click="isShowSuccess = false">
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>
<script>
  import Vue from 'vue';
  import { Provide } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default @Component({
    components: {
    }
  })
  class GlobalApp extends Vue {
    @Provide() globalApp = this;

    isShowSuccess = false;
    successMessage = '';

    showSuccess(message) {
      this.successMessage = message;
      this.isShowSuccess = true;
    }
  }
</script>
