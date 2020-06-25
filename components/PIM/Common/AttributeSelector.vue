<template>

  <v-autocomplete clearable v-model="selectorValue" :items="options" hide-details class="attribute-selector"
      :placeholder="placeholder" return-object
      item-text="label"
      item-value="_id"
      item-disabled="disabled">
  </v-autocomplete>

</template>
<script>
  import _ from 'lodash';
  import { Vue, Prop, Component } from 'vue-property-decorator';
  import { SYSTEM_ATTRIBUTES } from '~/server/src/shared/dataTypes';

  export default
  @Component({})
  class AttributeSelector extends Vue {
    @Prop() value;
    @Prop() groups;
    @Prop() selected;
    @Prop({ type: String }) placeholder;

    get systemAttributes () {
      return SYSTEM_ATTRIBUTES;
    }

    get selectorValue () {
      return this.value;
    }

    set selectorValue (value) {
      this.$emit('input', value);
    }

    isSelected (_id) {
      return !!_.find(this.selected || {}, { _id });
    }

    get options () {
      if (!this.groups) {
        return [];
      }
      const result = [];
      const selected = this.selected;
      SYSTEM_ATTRIBUTES.forEach(attribute => addAttribute(attribute));

      this.groups.forEach(group => {
        result.push({ header: `@${group.title}` });

        if (!group.attributes || !group.attributes.length) {
          return result.push({ label: 'No attributes', disabled: true });
        }

        group.attributes.forEach(attribute => addAttribute(attribute));
      });
      function addAttribute(attribute) {
        const isMultiple = attribute.dataType === 'gallery';
        const isSelected = Object.values(selected || {}).findIndex(item => item && item._id === attribute._id) !== -1;

        const item = {
          _id: attribute._id,
          label: attribute.label || attribute.title,
          isMultiple,
          disabled: !isMultiple && isSelected
        };
        result.push(item);
      }
      return result;
    }

    onChange (value) {
      this.$emit('input', value);
    }
  }
</script>
