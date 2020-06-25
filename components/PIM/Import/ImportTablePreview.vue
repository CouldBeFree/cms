<template>

  <div class="import-table-preview">

    <div class="scroll-block" v-if="data">

      <table class="table assign-table">
        <thead>
        <tr>
        <th v-for="(cell, cellIndex) in data[0]" :key="cellIndex" @mousemove="hoverIndex = cellIndex">

          <attribute-selector class="attribute-input" v-if="hoverIndex === cellIndex"
                              placeholder="No attribute selected"
              :groups="categoryGroups" v-model="columns[cellIndex]" @input="onChange(cellIndex, $event)"
                              :selected="columns"></attribute-selector>
          <div v-else-if="columns[cellIndex]" class="attribute-text">
            {{columns[cellIndex].label}}
          </div>
          <div v-else class="attribute-text no-attribute grey--text">
            No attribute selected
          </div>
        </th>
        </tr>
        <tr>
          <th class="column-number" v-for="(cell, cellIndex) in data[0]">{{cellIndex + 1}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td :class="{'column-skipped': !columns[cellIndex]}" v-for="(cell, cellIndex) in row" :key="cellIndex">
            {{cell}}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="overlay"></div>
  </div>
</template>
<style lang="scss">
  .import-table-preview {
    position: relative;
    .overlay {
      position: absolute;
      background-image: linear-gradient(to top, white, transparent);
      background-size: cover;
      top: 50%;
      bottom: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    }

    .scroll-block {
      overflow-x: scroll;
      -webkit-transform: scaleY(-1);
      transform: scaleY(-1);
    }

    .table.assign-table {
      margin-bottom: 5px;
      -webkit-transform: scaleY(-1);
      transform: scaleY(-1);

      th {
        min-height: 20px;
        font-weight: normal;
        border-bottom: 2px solid black;
        vertical-align: bottom;
        text-align: left;

        &.column-number {
          text-align: center;
          font-size: 10px;
          padding: 0;
          margin: 0;
        }

        .attribute-text {
          padding-top: 16px;
          margin-top: 4px;
        }

        .attribute-input {
          margin-bottom: -4px;
        }
      }

      th, td { // :not(:first-child)
        min-width: 215px;
        text-overflow: ellipsis;
        max-height: 100px;
        max-width: 350px;
        overflow: hidden;
        white-space: nowrap;
        padding: 2px 4px;
      }

      .no-attribute {

      }
    }

    .row-skipped, .column-skipped, .row-hover-skip {
      color: #999;
      background-color: #eee !important;
    }
  }
</style>
<script>
  import { Prop, Component, Vue } from 'vue-property-decorator';
  import AttributeSelector from '~/components/PIM/Common/AttributeSelector';

  export default
  @Component({
    components: {
      AttributeSelector
    }
  })
  class ImportTablePreview extends Vue {
    @Prop() data;
    @Prop() value;
    @Prop() categoryId;
    categoryGroups = [];

    hoverIndex = null;

    get columns () {
      return this.value;
    }

    set columns (value) {
      this.$emit('input', value);
    }

    async mounted () {
      try {
        this.categoryGroups = await this.$axios.$get(`/api/v1/categories/${this.categoryId}/groups`);
      } catch (err) {

      }
    }

    onChange (index, value) {
      this.value[index] = value;
      this.$emit('input', this.value);
    }
  }
</script>
