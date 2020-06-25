<template>

  <v-list dense>
    <draggable class="p-4" v-model="attributeGroups" :options="draggableOptions">
      <v-list-item v-for="group in attributeGroups" :key="group._id">
        <v-list-item-icon>
          <v-icon>mdi-drag</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-switch hide-details class="ma-0 pa-0" v-model="group.selected" @change="updateAttributeGroups" :label="group.title"></v-switch>
        </v-list-item-content>
      </v-list-item>
    </draggable>
  </v-list>

</template>
<script>
  import { Vue, Prop, Component } from 'vue-property-decorator';
  import draggable from 'vuedraggable';

  export default
  @Component({
    components: {
      draggable
    }
  })
  class Default extends Vue {
    @Prop() value;
    @Prop() groups;
    @Prop(Boolean) disableDragging;

    orderedGroups = null;

    get draggableOptions () {
      return {
        disabled: this.disableDragging
      };
    }

    get attributeGroups () {
      let groups = this.value || [];
      return (this.orderedGroups || this.groups).map(group => {
        group.selected = !!groups.find(item => item._id === group._id);
        return group;
      });
    }

    set attributeGroups (value) {
      this.orderedGroups = value;
      this.updateAttributeGroups();
    }

    updateAttributeGroups (event) {
      console.info(event);
      const attributeGroups = (this.orderedGroups || this.groups).filter(item => item.selected).map(group => {
        return { _id: group._id, title: group.title };
      });
      console.info(attributeGroups);
      this.$emit('input', attributeGroups);
    }
  }
</script>
