<template>

  <v-btn-toggle mandatory v-model="selectedDevice">
    <v-btn text v-for="device in devices" :key="device.icon" :value="device.key">
      <v-icon>{{device.icon}}</v-icon>
    </v-btn>
  </v-btn-toggle>

</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import { DEVICE_SMALL_MOBILE, DEVICE_MOBILE, DEVICE_TABLET, DEVICE_LAPTOP, DEVICE_DESKTOP } from '../../store/pans';

  const { Mutation, State } = namespace('pans');

  export default @Component({
    components: {}
  })
  class DeviceSelector extends Vue {
    @State currentDevice;

    @Mutation setDevice;

    devices = [
      { icon: 'mdi-cellphone-basic', key: DEVICE_SMALL_MOBILE },
      { icon: 'mdi-cellphone', key: DEVICE_MOBILE },
      { icon: 'mdi-tablet-ipad', key: DEVICE_TABLET },
      { icon: 'mdi-laptop', key: DEVICE_LAPTOP },
      { icon: 'mdi-monitor', key: DEVICE_DESKTOP }
    ];

    get selectedDevice () {
      return this.currentDevice;
    }

    set selectedDevice (val) {
      this.setDevice(val);
    }
  }
</script>
