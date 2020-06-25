<template>

  <v-dialog :value="value" @input="$emit('input', $event)" persistent max-width="600px" :fullscreen="$vuetify.breakpoint.smAndDown"
            transition="dialog-bottom-transition">
    <v-card style="overflow: hidden">
      <v-card-title class="primary white--text">
    <span class="headline">
        <span v-if="details._id">Edit attribute</span>
        <span v-else>New attribute</span>
    </span>
        <v-spacer />
        <v-btn text icon color="white" class="ma-0" @click="$emit('input', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-form v-model="valid" ref="form">
        <v-container class="container">
          <v-layout wrap fill-height>
            <v-flex xs12 md6>
              <v-text-field hide-details :value="details.title" :rules="[v => !!v || 'Title is required']" @input="setDetailsParam(['title', $event])" label="Title"></v-text-field>
            </v-flex>
            <v-flex xs12 md6>
              <v-text-field hide-details :value="details.label" @input="setDetailsParam(['label', $event])" label="Label"></v-text-field>
            </v-flex>
            <v-flex xs12 md12>
              <v-text-field :value="details.suffix" @input="setDetailsParam(['suffix', $event])" label="Suffix"></v-text-field>
            </v-flex>
            <v-flex xs12 md12>

              <v-select class="pt-0" :value="details.dataType" @input="setDetailsParam(['dataType', $event])" :rules="[v => !!v || 'Data type is required']"
                        :items="ALL_ATTRIBUTE_TYPES" item-value="key" item-text="title" label="Data type"></v-select>

            </v-flex>

            <v-flex xs12 md12 class="pt-0">

              <attribute-default-editor
                      required
                      :value="details.defaultValue"
                      @input="handler"
                      :type="details.dataType"/>

            </v-flex>

            <v-flex xs12 class="text-xs-right">
              <v-btn text color="primary" @click="$emit('input', false)">Cancel</v-btn>
              <v-btn color="primary"
                     :disabled="!valid || detailsLoading"
                     :loading="detailsLoading"
                     @click="$emit('submit')">
                Save
              </v-btn>
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
  import AttributeDefaultEditor from './AttributeDefaultEditor';

  const { State, Mutation, Action } = namespace('attributes');

  export default @Component({
    components: {
      AttributeDefaultEditor
    },
    filters: {
      formatDate (val) {
        return moment(val, 'MM-DD-YYYY').format('DD MMMM YYYY');
      }
    }
  })
  class TaskDialog extends Vue {
    @Prop() value;

    @State detailsLoading;
    @State details;
    @State attributes;

    @Mutation setDetailsParam;
    @Mutation addListItem;
    @Mutation editList;
    @Mutation deleteListItem;

    @Action saveAttribute;

    valid = true;

    handler (val) {
      this.setDetailsParam(['defaultValue', val]);
    }

    data () {
      return {
        ALL_ATTRIBUTE_TYPES
      };
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
