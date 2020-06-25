// Extra small screen / phone
export const DEVICE_SMALL_MOBILE = { width: '320', height: '540' };
// Small screen / phone
export const DEVICE_MOBILE = { width: '640', height: '960' };
// Medium screen / tablet
export const DEVICE_TABLET = { width: '768', height: '1024' };
// Large screen / desktop
export const DEVICE_LAPTOP = { width: '1024', height: '800' };
// Extra large screen / wide desktop
export const DEVICE_DESKTOP = { width: '1280', height: '1024' };

export const ALL_PANS = ['details', 'html', 'css', 'js', 'output'];

export const state = () => ({
  visiblePans: [...ALL_PANS],
  currentDevice: DEVICE_MOBILE
});

export const mutations = {
  setDevice (state, device) {
    state.currentDevice = device;
  },
  setVisiblePans (state, pans) {
    state.visiblePans = pans;
  },
  togglePan (state, pan) {
    let index = state.visiblePans.indexOf(pan);
    if (index === -1) {
      state.visiblePans.push(pan);
    } else {
      state.visiblePans.splice(index, 1);
    }
  }
};

export const actions = {
};
