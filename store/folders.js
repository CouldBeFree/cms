export const state = () => ({
  foldersTree: [],
  loadingTree: false,
  currentFolderId: null,
  currentFolder: null
});

export const mutations = {
  setFoldersTree (state, tree) {
    state.foldersTree = tree;
  },
  setLoadingTree (state, loading) {
    state.loadingTree = loading;
  },
  setCurrentFolderId (state, folderId) {
    state.currentFolderId = folderId;

    const path = [];
    let item = searchInChildren(state.foldersTree);
    if (item) {
      item = { ...item };
      item.path = path;
    }
    state.currentFolder = item;

    function searchInChildren (items, parent = null) {
      let item = items.find(i => i._id === folderId);
      if (!item) {
        for (let i of items) {
          item = searchInChildren(i.children || [], i);
          if (item) break;
        }
      }
      if (item && parent) {
        path.unshift(parent);
      }
      return item;
    }
  }
};

export const actions = {
  async loadFoldersTree ({ state, commit }) {
    commit('setLoadingTree', true);
    const tree = await this.$axios.$get('/api/v1/folders/tree', { params: {} });

    commit('setFoldersTree', tree);
    if (state.currentFolderId) {
      commit('setCurrentFolderId', state.currentFolderId);
    }
    commit('setLoadingTree', false);
    return tree;
  },

  async createFolder ({ state }, title) {
    return this.$axios.$post('/api/v1/folders', { title, parentId: state.currentFolderId });
  },
  async renameFolder ({ state }, title) {
    return this.$axios.$put(`/api/v1/folders/${state.currentFolderId}`, { title });
  },
  async deleteFolder ({ state }) {
    return this.$axios.$delete(`/api/v1/folders/${state.currentFolderId}`);
  }
};
