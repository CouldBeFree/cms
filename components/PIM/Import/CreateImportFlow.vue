<template>

  <div>

    <v-dialog v-model="showDialog" @input="$emit('input', $event)" persistent max-width="800px" :fullscreen="fullscreen || $vuetify.breakpoint.smAndDown"
              transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="primary white--text">
          <span class="headline">Create new adapter</span>
          <v-spacer />
          <v-btn icon dark @click="fullscreen = !fullscreen">
            <v-icon v-if="!fullscreen">mdi-fullscreen</v-icon>
            <v-icon v-else>mdi-fullscreen-exit</v-icon>
          </v-btn>
          <v-btn text icon color="white" class="ma-0" @click="closeDialog">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-stepper v-model="step">
          <v-stepper-header class="elevation-1">
            <v-stepper-step :complete="step > 1" step="1">
              Upload
              <small>an example</small>
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 2" step="2">Choose attributes</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3">Settings</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">

              <div class="py-5">
              <!--<div>-->
              <!--<strong>Category:</strong>{{category.title}}-->
              <!--</div>-->

                <div class="text-xs-center">
                  <p>To continue you need to upload an example csv/zip file</p>

                  <upload-btn endpoint="/api/v1/imports/parse" @uploaded="onUploadFiles">
                    Upload an example file
                  </upload-btn>
                  <br/><br/>
                  <!--br/>OR


                  <v-layout>
                    <v-flex xs2></v-flex>
                    <v-flex xs6>

                      <v-text-field type="url" v-model="details.importUrl"
                                    ref="linkToDownload" :rules="[ftpUrlValidation()]" label="Enter Url" placeholder="ftp://user:password@example.com/zipfile"></v-text-field>

                    </v-flex>
                    <v-flex xs2 class="pt-3">
                      <v-btn color="primary" @click="importFromFtp(details.importUrl)" :disabled="!details.importUrl">Next</v-btn>
                    </v-flex>
                  </v-layout-->

                  <v-btn text @click="closeDialog">Cancel</v-btn>
                </div>

              </div>

            </v-stepper-content>

            <v-stepper-content step="2">

              <v-form ref="step2Form">
              <import-table-preview :category-id="category._id" :data="details.exampleContent" v-model="details.columns"></import-table-preview>

              <v-layout>

                <v-btn text @click="step = 1">Choose another file</v-btn>

                <v-spacer></v-spacer>

                <v-btn class="pull-right" color="primary" @click="gotoStep3">
                  Continue
                </v-btn>

              </v-layout>
              </v-form>
            </v-stepper-content>

            <v-stepper-content step="3">

              <v-form ref="step3Form">
              <v-layout wrap>
                <v-flex xs12>
                  <v-checkbox v-model="details.enabledAutoImport" label="Enable automatic import" @change="$refs.linkToDownload.focus()"></v-checkbox>

                </v-flex>
                <v-flex xs8>

                  <v-text-field type="url" v-model="details.importUrl"
                                ref="linkToDownload" :rules="[ftpUrlValidation()]" :disabled="!details.enabledAutoImport" label="Link to download file" placeholder="ftp://user:password@example.com/zipfile"></v-text-field>

                </v-flex>
                <v-flex xs4>

                  <v-select :disabled="!details.enabledAutoImport"
                      :items="periodOfDownload" v-model="details.period"
                      label="How offen?" item-value="value" item-text="title"
                  ></v-select>

                </v-flex>
              </v-layout>
              </v-form>

              <v-layout>

                <v-btn text @click="step = 2">Back</v-btn>

                <v-spacer></v-spacer>

                <v-btn class="pull-right" color="primary" @click="finish">
                  Finish
                </v-btn>

              </v-layout>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>

        <!--<v-layout wrap fill-height>-->
          <!--<v-flex xs12>-->
            <!--<v-alert class="mt-0" v-model="showError" type="error" dismissible>{{ errorMessage }}</v-alert>-->
          <!--</v-flex>-->

          <!--<v-flex xs12>-->
            <!--<v-card-text>-->
              <!--<v-form v-model="validForm">-->
                <!--<slot></slot>-->
              <!--</v-form>-->
            <!--</v-card-text>-->
          <!--</v-flex>-->

          <!--<v-flex xs12 class="text-xs-right pt-4 px-2 pb-2">-->
            <!--<v-btn text color="primary" @click="closeDialog">Cancel</v-btn>-->

            <!--<v-btn color="primary" :disabled="!validForm || loading" :loading="loading" @click="submitSaveItem">Save</v-btn>-->
          <!--</v-flex>-->
        <!--</v-layout>-->
      </v-card>
    </v-dialog>

  </div>

</template>
<script>
  import { Vue, Emit, Component } from 'vue-property-decorator';
  import UploadBtn from '~/components/common/UploadBtn';
  import ImportTablePreview from '~/components/PIM/Import/ImportTablePreview';
  import { ftpUrlValidation } from '~/helpers/validators';

  export default
  @Component({
    components: {
      UploadBtn,
      ImportTablePreview
    }
  })
  class CreateImportFlow extends Vue {
    showDialog = false;
    fullscreen = false;
    validForm = false;
    loading = false;

    step = 1;

    category = {};
    details = {};

    periodOfDownload = [
      { value: 5 * 60, title: '5 min.' },
      { value: 1 * 60 * 60, title: '1 hour' },
      { value: 24 * 60 * 60, title: '1 day' },
      { value: 7 * 24 * 60 * 60, title: '1 week' }
    ];

    data() {
      return {
        ftpUrlValidation
      };
    }

    onUploadFiles([file]) {
      if (!file) {
        return;
      }
      this.details.exampleContent = file.items;
      this.step = 2;
    }

    startCreation(category) {
      this.step = 1;
      this.details = {
        enabled: true,
        currentStatus: {},
        columns: []
      };
      this.category = category;
      this.showDialog = true;
    }

    @Emit('close')
    closeDialog() {
      this.showDialog = false;
    }

    submitSaveItem() {

    }

    gotoStep3() {
      if (!this.$refs.step2Form.validate()) {
        return;
      }
      this.step = 3;
    }

    finish() {
      if (!this.$refs.step3Form.validate()) {
        return;
      }
      this.$emit('input', this.details);
      this.showDialog = false;
    }
  }
</script>
