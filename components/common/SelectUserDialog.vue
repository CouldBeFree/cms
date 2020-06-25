<template>
    <v-dialog :value="value" @input="$emit('input', $event)" transition="dialog-bottom-transition" max-width="400px">
        <v-card>

            <v-card-title class="primary white--text">
                <div class="headline">
                    <span>Sudo account</span>
                </div>
                <v-spacer />
                <v-btn text icon color="white" class="ma-0" @click="$emit('input', false)">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-list-item-group shaped>
                <v-list-item v-for="(item, i) in list" :key="i" @click="$emit('select', item)">
                    <v-list-item-content>
                        <v-list-item-title>Login as {{item.username}} ({{item.accountType}})</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                        <v-icon>swap_horiz</v-icon>
                    </v-list-item-icon>
                </v-list-item>
            </v-list-item-group>

            <v-layout wrap fill-height>
                <v-flex xs12 class="text-xs-right pt-4 px-2 pb-2">
                    <v-btn text color="primary" @click="$emit('input', false)">Cancel</v-btn>
                </v-flex>
            </v-layout>
        </v-card>
    </v-dialog>
</template>
<script>
  import { Vue, Model, Prop, Component } from 'vue-property-decorator';

  export default @Component({
    name: 'SelectUserDialog'
  })
  class SelectUserDialog extends Vue {
    @Model('input') value;
    @Prop(Array) list;
  }
</script>
