import Axios from 'axios';

export const state = () => ({
  uploadFileNum: 0,
  uploadFiles: [],
  files: [],
  loadingFiles: false,
  page: 1,
  totalItems: 0
});

export const mutations = {
  incFileId (state) {
    state.uploadFileNum++;
  },
  addUploadFile (state, file) {
    state.uploadFiles.push(file);
  },
  removeUploadFile (state, id) {
    let file = state.uploadFiles.find(f => f.id === id);
    if (!file) {
      return;
    }
    if (file.percent !== 100) {
      file.cancelToken.cancel('Operation canceled by the user.');
    }
    let index = state.uploadFiles.findIndex(f => f.id === id);
    state.uploadFiles.splice(index, 1);
  },
  setFileProgress (state, { id, percent, error }) {
    let file = state.uploadFiles.find(f => f.id === id);
    if (!file) {
      return;
    }
    if (error) {
      file.error = error;
    }
    file.percent = percent;
  },
  setFiles (state, files) {
    state.files = files;
  },
  setTotalItems (state, total) {
    state.totalItems = total;
  },
  setPage (state, page) {
    state.page = page;
  },
  setLoadingFiles (state, loading) {
    state.loadingFiles = loading;
  }
};

export const actions = {
  async loadFiles ({ state, commit }, folderId) {
    commit('setLoadingFiles', true);
    const { data, headers } = await this.$axios.get('/api/v1/files', {
      params: {
        folderId,
        page: state.page
      }
    });

    commit('setFiles', data);
    commit('setTotalItems', +headers['x-total-count']);
    commit('setLoadingFiles', false);
    return data;
  },

  async uploadFiles ({ state, commit, dispatch }, { endpoint, folderId, files }) {
    const result = [];
    for (const index in files) {
      if (!files.hasOwnProperty(index)) {
        continue;
      }
      const file = files[index];
      let id = state.uploadFileNum;

      commit('incFileId');

      const formData = new FormData();
      if (folderId) {
        formData.append('folderId', folderId);
      }
      formData.append('data', file, file.name);

      const cancelToken = Axios.CancelToken.source();

      commit('addUploadFile', {
        id,
        cancelToken,
        name: file.name,
        size: file.size,
        type: file.type,
        percent: 0
      });

      try {
        const { data } = await this.$axios.post(endpoint, formData,
          {
            cancelToken: cancelToken.token,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percent = parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total));
              commit('setFileProgress', { id, percent });
            }
          }
        );
        result[index] = data;
      } catch (err) {
        if (!Axios.isCancel(err)) {
          commit('setFileProgress', { id, error: err.message, percent: 0 });
        }
        return [];
      }
      commit('setFileProgress', { id, percent: 100 });
    }
    if (folderId) {
      dispatch('loadFiles', folderId);
    }
    return result;
  },
  async removeFile ({ commit, state }, _id) {
    try {
      await this.$axios.delete(`/api/v1/files/${_id}`);
    } catch ({ response }) {
      console.log(response);
    }
  }
};
