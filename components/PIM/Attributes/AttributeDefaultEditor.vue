<template>

    <div>

        <template v-if="type === DataTypes.SHORT_TEXT">

            <v-text-field
                    :value="value"
                    label="Default value"
                    @input="$emit('input', $event)">
            </v-text-field>

        </template>
        <template v-else-if="type === DataTypes.PARAGRAPH_TYPE">

            <v-textarea
                    auto-grow
                    no-resize
                    :value="value"
                    label="Default value"
                    @input="$emit('input', $event)"
            ></v-textarea>

        </template>

        <template v-else-if="type === DataTypes.RICHTEXT_TYPE">

            <ckeditor
                    :editor="editor"
                    @input="onEditorInput($event)"
            ></ckeditor>

        </template>

        <template v-else-if="type === DataTypes.RADIO_SELECT || type === DataTypes.MULTI_SELECT">

            <div>
                <draggable class="p-4" v-model="attributeItems" :options="{group:'value'}" handle=".handle">
                    <v-layout row v-for="(item, index) in attributeItems" :key="index" justify-space-between align-center>
                        <v-flex xs1>
                            <div style="cursor: ns-resize">
                                <v-icon class="handle">format_line_spacing</v-icon>
                            </div>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                    :value="item.title"
                                    :rules="required ? [emptyValidation()] : []"
                                    @input="editValue(item, index, $event)"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs1>
                            <v-checkbox
                                    class="ml-2"
                                    style="position: relative; top: 3px;"
                                    @change="changeHandler(item, index)"
                                    :input-value="item.checked"
                                    v-if="type === DataTypes.MULTI_SELECT">
                            </v-checkbox>
                            <v-radio-group v-model="selectedItemIndex" :mandatory="false" v-else>
                                <v-radio
                                        class="ml-3"
                                        style="position: relative; top: 3px;"
                                        :value="index"
                                        @change="changeHandler(item, index)"
                                >
                                </v-radio>
                            </v-radio-group>
                        </v-flex>
                        <v-flex xs1>
                            <v-btn icon ripple>
                                <v-icon @click="removeItem(index)">
                                    delete
                                </v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </draggable>
                <v-form ref="form">
                    <v-layout align-baseline>
                        <v-text-field
                                v-model="name"
                                :rules="required ? [emptyValidation()] : []"
                                label="Default value"
                                required
                                @keypress.13.prevent="addItem"
                        ></v-text-field>
                        <v-btn class="ml-4" @click="addItem" :disabled="!name">Add</v-btn>
                    </v-layout>
                </v-form>
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
                                    v-model="date"
                                    label="Default value"
                                    readonly
                                    v-on="on"
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
                    label="Default value"
                    type="number"
                    @input="$emit('input', $event)"
                    :rules="[numberValidation()]"
                    :value="value"
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.DECIMAL">

            <v-text-field
                    label="Default value"
                    type="number"
                    @input="$emit('input', $event)"
                    :value="value"
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.LINK_TYPE">

            <v-text-field
                    :rules="[urlValidation()]"
                    @input="$emit('input', $event)"
                    label="Default value"
                    :value="value"
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.SWITCH_TYPE">

            <v-switch
                    v-model="switchItem"
                    @change="switchHandler($event)"
            ></v-switch>

        </template>

        <template v-else-if="type === DataTypes.IMAGE_TYPE || type === DataTypes.GALLERY">

            <file-selector
                    :value="value"
                    :multiple="type === DataTypes.GALLERY"
                    @input="$emit('input', $event)"
            ></file-selector>

        </template>

        <template v-else-if="type === DataTypes.VIDEO_TYPE">

            <v-text-field
                    @input="$emit('input', $event)"
                    label="Default value"
                    :value="value"
            ></v-text-field>

        </template>

        <template v-else-if="type === DataTypes.SEPARATOR_TYPE">

            <hr>

        </template>

        <template v-else>

            <div class="error--text">No editor for type: {{type}}</div>

        </template>

    </div>

</template>
<style lang="scss" scoped>
    input[type=file] {
        position: absolute;
        left: -99999px;
    }
</style>
<script>
  import { Vue, Prop, Model, Watch, Component } from 'vue-property-decorator';
  import * as DataTypes from '~/server/src/shared/dataTypes';
  import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
  import draggable from 'vuedraggable';
  import sortBy from 'lodash/sortBy';
  import pick from 'lodash/pick';
  import FileSelector from '~/components/files/FileSelector';

  export default @Component({
    name: 'AttributeDefaultEditor.vue', // mandatory property to avoid minification problems
    components: {
      FileSelector,
      draggable
    }
  })
  class SAttributeDefaultEditor extends Vue {
    @Model('input') value;
    @Prop(String) type;
    @Prop(Boolean) required;

    data() {
      return {
        DataTypes,
        editor: ClassicEditor,
        name: '',
        date: '',
        data: '',
        array: [],
        menu: false,
        modal: false,
        switchItem: false,
        valid: false
      };
    }

    @Watch('type')
    trackType(newVal, oldVal) {
      const sample = {
        'short-text': 'string',
        'datetime': 'string',
        'link': 'string',
        'number': 'number',
        'decimal': 'number',
        'paragraph': 'string',
        'multi-select': 'array',
        'drop-down': 'array',
        'gallery': 'gallery-array'
      };
      const items = Object.keys(sample);
      const targetItem = items.filter(item => item === newVal);
      const dataType = sample[targetItem];
      const valueType = typeof this.value;
      const isRightType = () => {
        switch (dataType) {
          case 'array':
            return Array.isArray(this.value);
          case 'string' || 'number' || 'gallery-array':
            return valueType === dataType;
        }
      };
      if (!isRightType()) {
        switch (dataType) {
          case 'string':
            return this.$emit('input', '');
          case 'number':
            return this.$emit('input', 0);
          case 'array':
            return this.$emit('input', []);
          case 'gallery-array':
            return this.$emit('input', []);
        }
      }
      if (newVal === 'separator') {
        this.$emit('input', '<hr>');
      }
    }

    switchHandler(event) {
      this.$emit('input', event);
    }

    numberValidation(message = 'You can enter only integers') {
      return v => v ? (v.indexOf('.') > -1 ? message : false) : message;
    }

    urlValidation(message = 'You can enter only URL') {
      const reg = /^(ftp|http|https):\/\/[^ "]+$/;
      return v => reg.test(v) || message;
    }

    get selectedItemIndex() {
      return this.value.findIndex(item => item.checked);
    }

    set selectedItemIndex(val) {
      return val;
    }

    get attributeItems() {
      if (typeof this.value !== 'object') {
        return;
      }
      const ids = (this.value || []).map(attr => attr.title);
      return sortBy(this.value || [], attr => ids.indexOf(attr.title) === -1 ? 1000 : ids.indexOf(attr.title));
    }

    set attributeItems(val) {
      const attrs = val.map(attr => pick(attr, ['checked', 'title']));
      this.array = attrs;
      this.$emit('input', [...attrs]);
    }

    emptyValidation(message = 'This field is required.') {
      return v => !!v || message;
    }

    addItem(e) {
      e.preventDefault();
      const val = this.attributeItems;
      const newItem = {
        checked: false,
        title: this.name
      };
      if (this.$refs.form.validate()) {
        if (val) {
          const newArray = [...this.attributeItems];
          newArray.push(newItem);
          this.$emit('input', newArray);
        } else {
          this.array.push(newItem);
          const newArray = [...this.array];
          this.$emit('input', newArray);
        }
        this.$refs.form.reset();
        this.$refs.form.resetValidation();
      }
    }

    editValue(item, index, event) {
      const editedObj = { ...item };
      const newArray = [...this.attributeItems];
      newArray[index] = editedObj;
      editedObj.title = event;
      this.$emit('input', newArray);
    }

    removeItem(index) {
      const newArray = [...this.attributeItems];
      newArray.splice(index, 1);
      this.$emit('input', newArray);
    }

    changeHandler(item, index) {
      const newItem = { ...item };
      const newArray = [...this.attributeItems];
      newArray[index] = newItem;
      if (this.type === DataTypes.MULTI_SELECT) {
        newItem.checked = !newItem.checked;
        this.$emit('input', newArray);
      } else {
        const copy = newArray.map(item => ({ ...item }));
        copy.forEach((elem, idx) => (elem.checked = idx === index));
        newItem.checked = true;
        copy[index] = newItem;
        this.$emit('input', copy);
      }
    }

    get formattedValue () {
      switch (this.type) {
        case DataTypes.MULTI_SELECT:
        case DataTypes.RADIO_SELECT:
          return Array.isArray(this.value) ? this.value : [];
        default:
          return this.value || '';
      }
    }

    onEditorInput(event) {
      this.$emit('input', event);
      !event ? this.valid = false : this.valid = true;
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

    chooseFile() {
      this.$refs.fileInput.click();
    }

    onFileChange($event) {
      const files = $event.target.files || $event.dataTransfer.files;
      this.$emit('input', [...files]);
    }
  }
</script>
