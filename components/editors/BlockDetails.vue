<template>
  <div class="pan">

    <div class="pan-head">Parameters</div>

    <div>
      <v-list>

        <draggable class="p-4" :value="attributes" @input="$emit('input', $event)" :options="{group:'attributes'}" handle=".handle">
          <v-list-item v-for="attribute, n in attributes" :key="n" @click>
            <v-list-item-avatar class="noselect">
              <v-icon class="handle">mdi-drag</v-icon>
            </v-list-item-avatar>

            <v-list-item-content v-if="attribute.dataType === 'separator'" @click="editItem(attribute)">
              <v-list-item-title class="noselect"><strong>{{ attribute.title }}</strong></v-list-item-title>
              <v-divider style="width: 100%"></v-divider>
            </v-list-item-content>
            <v-list-item-content v-else @click="editItem(attribute)">
              <v-list-item-title class="noselect">{{ attribute.title }}</v-list-item-title>
              <v-list-item-subtitle>[{{ attribute.label }}]</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action @click="editItem(attribute, n)" class="noselect">
              <v-btn icon ripple><v-icon color="grey lighten-1">edit</v-icon></v-btn>
            </v-list-item-action>

            <v-list-item-action @click.prevent class="noselect">
              <delete-menu :loading="deleting" @delete="onDeleteAttribute(attribute)">
                Are you sure to delete this attribute?
              </delete-menu>
            </v-list-item-action>
          </v-list-item>
        </draggable>
      </v-list>

      <v-btn @click="createNewItem">
        <v-icon>add</v-icon> Add parameter
      </v-btn>
    </div>
    <attribute-dialog v-model="isCreateDialogShow" @submit="saveItem" />
  </div>
</template>
<style>
  .pan {
    position: absolute;
    top: 0;
    bottom: 0;
  }
  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import draggable from 'vuedraggable';
  import AttributeDialog from '~/components/PIM/Attributes/AttributeDialog';
  import DeleteMenu from '~/components/common/DeleteMenu';

  const { State: AttributeState, Mutation: AttributeMutation } = namespace('attributes');

  export default @Component({
    components: {
      draggable,
      AttributeDialog,
      DeleteMenu
    }
  })
  class CodeEditor extends Vue {
    @Prop() attributes;

    @AttributeState details;
    @AttributeMutation setDetails;

    deleting = false;
    isCreateDialogShow = false;

    type = 'details';

    async mounted () {
    }

    createNewItem () {
      this.setDetails({ n: -1 });

      this.isCreateDialogShow = true;
    }

    editItem (item, n) {
      this.setDetails({ ...item, n });

      this.isCreateDialogShow = true;
    }

    saveItem () {
      let attrs = this.attributes ? [...this.attributes] : [];
      if (this.details.n === -1) {
        attrs.push(this.details);
      } else {
        attrs[this.details.n] = this.details;
      }
      this.$emit('input', attrs);
      this.isCreateDialogShow = false;
    }
  }
</script>
