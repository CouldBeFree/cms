import { fetchList } from '~/utils/fontManager';

export const state = () => ({
  fonts: [],
  loadingFonts: false
});

export const mutations = {
  setFonts (state, list) {
    state.fonts = list;
  },
  setLoadingFonts (state, loading) {
    state.loadingFonts = loading;
  }
};

export const actions = {
  async loadFonts ({ state, commit }) {
    if (state.loadingFonts || state.fonts.length) {
      return;
    }
    commit('setLoadingFonts', true);
    const list = await fetchList();

    commit('setFonts', list);
    commit('setLoadingFonts', false);
    return list;
  }
};
