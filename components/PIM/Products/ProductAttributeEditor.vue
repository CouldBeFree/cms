<template>

  <div>

    <div v-for="group in groups" class="b-group-row mt-3">
      <h2 class="font-weight-thin mb-1">{{group.title}}</h2>
      <v-divider></v-divider>

      <div v-for="attribute in group.attributes" class="b-attribute-row">

        <v-checkbox @change="setFieldIgnored(attribute._id, !$event)"
                    :input-value="!getFieldIgnored(attribute._id)"
                    color="info"
                    hide-details class="mt-0 pt-0">
        </v-checkbox>

        <v-input class="width-100" :label="attribute.label || attribute.title" :hide-details="getFieldIgnored(attribute._id)">

        <template v-if="getFieldIgnored(attribute._id)">
          <label @click="setFieldIgnored(attribute._id, false)">
            <span class="grey--text">No value</span>
          </label>
        </template>
        <template v-else>

          <attribute-editor class="width-100"
                              required
                              :type="attribute.dataType"
                              :default-value="attribute.defaultValue"
                              :suffix="attribute.suffix"
                              :value="getFieldValue(attribute._id)"
                              @input="setFieldValue(attribute._id, $event)"
          ></attribute-editor>

        </template>

        </v-input>

      </div>
    </div>
  </div>

</template>
<style lang="scss">
  .b-attribute-row {
    display: flex;
    /*border-bottom: 1px dotted #aaa;*/
    padding-top: 8px;

    .v-input__slot {
      flex-wrap: wrap;

      & > label {
        flex-basis: 100%;
        margin-bottom: 7px;
      }
    }
    .width-100 {
      width: 100%;
    }
  }
  .b-group-row {
    h3 {

    }
  }
</style>
<script>
  import { Vue, Model, Prop, Component } from 'vue-property-decorator';
  import AttributeEditor from '../Attributes/AttributeEditor';

  export default @Component({
    components: {
      AttributeEditor
    }
  })
  class ProductAttributeEditor extends Vue {
    @Model('input') value;

    @Prop(Array) groups;

    getFieldValue(id) {
      return ((this.value || []).find(item => item._id === id) || {}).value;
    }

    setFieldValue(id, value) {
      const index = (this.value || []).findIndex(item => item._id === id);
      const arrayResult = [...this.value];

      const item = index === -1 ? { _id: id } : { ...arrayResult[index] };
      item.value = value;
      if (index === -1) {
        arrayResult.push(item);
      } else {
        arrayResult[index] = item;
      }
      this.$emit('input', arrayResult);
    }

    getFieldIgnored(id) {
      return ((this.value || []).find(item => item._id === id) || { isIgnored: true }).isIgnored;
    }

    setFieldIgnored(id, isIgnored) {
      const index = (this.value || []).findIndex(item => item._id === id);
      const arrayResult = [...this.value];

      const item = index === -1 ? { _id: id } : { ...arrayResult[index] };
      item.isIgnored = isIgnored;
      if (index === -1) {
        arrayResult.push(item);
      } else {
        arrayResult[index] = item;
      }
      this.$emit('input', arrayResult);
    }
  }
</script>
