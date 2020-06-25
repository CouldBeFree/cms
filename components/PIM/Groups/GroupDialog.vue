<template>

  <v-dialog :value="value" @input="$emit('input', $event)" persistent max-width="600px" :fullscreen="$vuetify.breakpoint.smAndDown"
            transition="dialog-bottom-transition">
    <v-card>
      <v-card-title class="primary white--text">
    <span class="headline">
        <span v-if="details._id">Edit group</span>
        <span v-else>New group</span>
    </span>
        <v-spacer />
        <v-btn text icon color="white" class="ma-0" @click="$emit('input', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-form v-model="valid" ref="form">
        <v-container class="container">
          <v-layout wrap fill-height>
            <v-flex xs12>
              <v-text-field :value="details.title" :rules="[v => !!v || 'Title is required']" @input="setDetailsParam(['title', $event])" label="Title"></v-text-field>
            </v-flex>

            <v-flex xs12 class="text-xs-right">
              <v-btn text color="primary" @click="$emit('input', false)">Cancel</v-btn>
              <v-btn color="primary" :disabled="!valid || detailsLoading" :loading="detailsLoading" @click="$emit('submit')">Save</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>

    </v-card>
  </v-dialog>

</template>
<script>
  import Vue from 'vue';
  import moment from 'moment';
  import Component, { namespace } from 'nuxt-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import { ALL_ATTRIBUTE_TYPES } from '~/server/src/shared/dataTypes';

  const { State, Mutation } = namespace('groups');

  export default @Component({
    components: {
    },
    filters: {
      formatDate (val) {
        return moment(val, 'MM-DD-YYYY').format('DD MMMM YYYY');
      }
    }
  })
  class GroupDialog extends Vue {
    @Prop() value;

    @State detailsLoading;
    @State details;

    @Mutation setDetailsParam;

    valid = true;

    data () {
      return { ALL_ATTRIBUTE_TYPES };
    }

    get executionDate () {
      if (!this.details || !this.details.ExecutionDate) {
        return null;
      }
      return moment(this.details.ExecutionDate, 'MM-DD-YYYY').format('YYYY-MM-DD');
    }
    set executionDate (val) {
      this.setDetailsParam(['ExecutionDate', moment(val, 'YYYY-MM-DD').format('MM-DD-YYYY')]);
    }
    get status () {
      return this.details.Status === 'Active';
    }
    set status (val) {
      this.setDetailsParam(['Status', val ? 'Active' : 'Inactive']);
    }

    @Watch('value')
    onShowChange () {
      this.$nextTick(() => {
        this.$refs.form.resetValidation();
      });
    }
  }
</script>
