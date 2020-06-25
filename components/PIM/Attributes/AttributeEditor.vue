<template>

    <div>
        <template v-if="type === DataTypes.SHORT_TEXT">

            <v-text-field filled single-line hide-details
                          :value="value"
                          :placeholder="defaultValue"
                          :rules="required ? [emptyValidation()] : []"
                          @input="$emit('input', $event)"
                          :suffix="suffix"
            ></v-text-field>

        </template>

        <template v-if="type === DataTypes.PARAGRAPH_TYPE">

            <v-textarea filled single-line
                        hide-details
                        :value="value"
                        auto-grow
                        no-resize
                        :placeholder="defaultValue"
                        :rules="required ? [emptyValidation()] : []"
                        @input="$emit('input', $event)"
                        :suffix="suffix"
            ></v-textarea>

        </template>

        <template v-else-if="type === DataTypes.RICHTEXT_TYPE">

            <ckeditor
                    :editor="editor"
                    :value="value"
                    @blur="editorValidation"
                    @ready="editorValidation"
                    @input="onEditorInput($event)"
                    v-model="editorData"
            ></ckeditor>
            <div v-if="!valid" class="v-messages theme--light error--text mb-1 mt-1">
                <div class="v-messages__wrapper">
                    <div class="v-messages__message">This field is required</div>
                </div>
            </div>

        </template>

        <template v-else-if="type === DataTypes.MULTI_SELECT">

            <v-layout row wrap>
                <v-flex sm2 v-for="(item, index) in value || defaultValue" :key="index">
                    <v-checkbox
                            :label="item.title"
                            :input-value="item.checked"
                            @change="changeHandler(index)"
                            hide-details
                            color="primary"
                    >
                    </v-checkbox>
                </v-flex>
            </v-layout>

        </template>

        <template v-else-if="type === DataTypes.RADIO_SELECT">

            <div id="dropdown">
                <v-flex xs4>
                    <v-overflow-btn
                            :items="transformData.array"
                            :label="transformData.selected || ''"
                            @change="changeSelected($event)"
                            target="#dropdown"
                            hide-details
                            :suffix="suffix"
                    ></v-overflow-btn>
                </v-flex>
            </div>

        </template>

        <template v-else-if="type === DataTypes.DATETIME_TYPE">

            <v-layout row wrap>
                <v-flex xs12>
                    <v-menu
                            ref="menu"
                            v-model="menu"
                            :close-on-content-click="false"
                            :return-value.sync="date"
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                    >
                        <template v-slot:activator="{ on }">
                            <v-text-field
                                    required
                                    v-model="date"
                                    :label="defaultValue"
                                    readonly
                                    v-on="on"
                                    hide-details
                            ></v-text-field>
                        </template>
                        <v-date-picker v-model="date" no-title scrollable>
                            <template>
                                <v-spacer></v-spacer>
                                <v-btn text @click="cancel">Cancel</v-btn>
                                <v-btn text @click="save">OK</v-btn>
                            </template>
                        </v-date-picker>
                    </v-menu>
                </v-flex>
            </v-layout>

        </template>

        <template v-else-if="type === DataTypes.NUMBER_TYPE">

            <v-text-field
                    :value="value"
                    required
                    type="number"
                    @input="$emit('input', $event)"
                    :rules="required ? [emptyValidation(), numberValidation()] : []"
                    :placeholder="defaultValue"
                    hide-details
                    :suffix="suffix"
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.DECIMAL">

            <v-text-field
                    :value="value"
                    required
                    type="number"
                    @input="$emit('input', $event)"
                    :rules="required ? [emptyValidation()] : []"
                    :placeholder="defaultValue"
                    hide-details
                    :suffix="suffix"
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.LINK_TYPE">

            <v-text-field
                    :value="value"
                    :rules="required ? [emptyValidation(), urlValidation()] : []"
                    @input="$emit('input', $event)"
                    :placeholder="defaultValue"
                    hide-details
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.SWITCH_TYPE">

            <v-switch
                    :input-value="value || defaultValue"
                    @change="switchHandler($event)"
                    hide-details
                    color="primary"
            ></v-switch>

        </template>

        <template v-else-if="type === DataTypes.IMAGE_TYPE || type === DataTypes.GALLERY">

            <file-selector
                    :value="value || defaultValue"
                    :multiple="type === DataTypes.GALLERY"
                    @input="$emit('input', $event)"
            ></file-selector>

        </template>

        <template v-else-if="type === DataTypes.VIDEO_TYPE">

            <v-text-field
                    @input="$emit('input', $event)"
                    :placeholder="defaultValue"
                    :value="value"
                    :rules="required ? [emptyValidation()] : []"
                    hide-details
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.SEPARATOR_TYPE">

            <div v-html="defaultValue"></div>

        </template>

    </div>

</template>

<script>
  import { Vue, Prop, Model, Component } from 'vue-property-decorator';
  import moment from 'moment';
  import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
  import FileSelector from '~/components/files/FileSelector';
  import * as DataTypes from '~/server/src/shared/dataTypes';

  export default @Component({
    name: 'SAttributeEditor.vue',
    filters: {
      formatDate (date) {
        return moment(date).format('DD.MM.YYYY HH:mm');
      }
    },
    components: {
      FileSelector
    }
  })

  class SAttributeDefault extends Vue {
    @Model('input') value;
    @Prop(String) type;
    @Prop(Boolean) required;
    @Prop() suffix;
    @Prop() defaultValue;

    data () {
      return {
        DataTypes,
        // date: '',
        switchItem: true,
        editor: ClassicEditor,
        menu: false,
        valid: false
      };
    }

    changeSelected(val) {
      const copy = this.defaultValue.map(item => ({ ...item }));
      const index = copy.findIndex(item => item.title === val);
      copy.forEach((elem, idx) => (elem.checked = idx === index));
      copy[index].checked = true;
      this.$emit('input', copy);
    }

    get formattedValue() {
      switch (this.type) {
        case DataTypes.MULTI_SELECT:
        case DataTypes.RADIO_SELECT:
          return Array.isArray(this.value) ? this.value : [];
        default:
          return this.value || this.defaultValue || '';
      }
    }

    editorValidation() {
      this.valid = this.formattedValue.length > 0;
    }

    get editorData() {
      return this.value;
    }

    set editorData(val) {
      return val;
    }

    onEditorInput(event) {
      this.$emit('input', event);
      !event ? this.valid = false : this.valid = true;
    }

    switchHandler(event) {
      this.$emit('input', event);
    }

    changeHandler(index) {
      if (!this.value) {
        let array = this.defaultValue.map(item => ({ ...item }));
        array[index].checked = !array[index].checked;
        this.$emit('input', array);
      } else {
        let array = [...this.value];
        array[index].checked = !array[index].checked;
        this.$emit('input', array);
      }
    }

    get transformData() {
      let selected;
      let array;
      if (Array.isArray(this.defaultValue)) {
        array = this.defaultValue.map(item => item.title);
        selected = this.value ? this.value.filter(item => item.checked === true) : this.defaultValue.filter(item => item.checked === true);
        selected.length > 0 ? selected = selected[0].title : selected = 'Select default value';
      }
      return {
        array,
        selected
      };
    }

    emptyValidation(message = 'This field is required.') {
      return v => !!v || message;
    }

    get date() {
      return this.value;
    }

    set date(val) {
      this.$emit('input', val);
    }

    cancel() {
      this.date = '';
      this.menu = false;
    }

    save() {
      this.menu = false;
      this.$refs.menu.save(this.date);
      this.$emit('input', this.date);
    }

    urlValidation(message = 'You can enter only URL') {
      const reg = /^(ftp|http|https):\/\/[^ "]+$/;
      return v => reg.test(v) || message;
    }

    numberValidation(message = 'You can enter only integers') {
      return v => v ? (v.indexOf('.') > -1 ? message : false) : message;
    }
  }
</script>

<style>
    .v-input--selection-controls .v-label{
        flex-basis: unset!important;
        margin-bottom: 0!important;
    }
</style>
