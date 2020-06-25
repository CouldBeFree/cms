<template>

  <div class="fill-height"></div>

</template>
<script>
  import Vue from 'vue';
  import Component from 'nuxt-class-component';

  export default
  @Component({
    middleware: ['auth']
  })
  class Index extends Vue {
    mounted () {
      this.$router.push({ name: 'pim' });
    }
  }
</script>
