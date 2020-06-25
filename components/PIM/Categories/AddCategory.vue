<template>
  <div>
    <v-dialog :value="value" persistent max-width="600px">
      <v-card>
        <v-card-title class="primary white--text">
            <span class="headline">
                <span v-if="details._id">Edit category</span>
                <span v-else>Add category</span>
            </span>
          <v-spacer/>
          <v-btn text icon color="white" class="ma-0" @click="$emit('input', false)">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-form ref="form">
          <v-container class="container">
            <v-layout wrap fill-height>
              <v-flex xs12>
                <v-text-field
                    :rules="[v => !!v || 'Title is required']"
                    label="Title"
                    :value="details.title"
                    @input="setDetailsParam(['title', $event])"
                >
                </v-text-field>
              </v-flex>

              <v-flex xs12>
              <groups-selector :groups="attributesGroups" :value="details.attributeGroups" @input="setDetailsParam(['attributeGroups', $event])"></groups-selector>
              </v-flex>

              <v-flex xs12 class="text-xs-right">
                <v-btn text color="primary" @click="$emit('input', false)">Cancel</v-btn>
                <v-btn color="primary" :disabled="!valid || loading" @click="$emit('submit')">Save</v-btn>
              </v-flex>
            </v-layout>

          </v-container>
        </v-form>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { ALL_ATTRIBUTE_TYPES } from '~/server/src/shared/dataTypes';
  import { Prop, Watch } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import GroupsSelector from '~/components/common/GroupsSelector';

  const { State, Mutation } = namespace('data');

  export default @Component({
    filter: [],
    components: {
      GroupsSelector
    }
  })
  class AddCategory extends Vue {
    @Prop() value;
    @State loading;
    @State details;
    @Mutation setDetailsParam;

    attributesGroups = [];

    data () {
      return { ALL_ATTRIBUTE_TYPES };
    }

    async mounted() {
      this.attributesGroups = await this.$axios.$get('/api/v1/attributes-groups');
    }

    valid = true;

    @Watch('value')
    onShowChange () {
      this.$nextTick(() => {
        this.$refs.form.resetValidation();
      });
    }
  }
</script>

<style scoped>

</style>
