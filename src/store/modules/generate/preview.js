import { defineStore } from 'pinia';

export const previewStore = defineStore({
  id: 'previewStore',
  state: () => ({
    previewFileCheckedMap: new Map(),
  }),
  getters: {
    getPreviewFileChecked(state) {
      return (id) => {
        return state.previewFileCheckedMap.get(id);
      };
    },
  },
  actions: {
    setPreviewFileChecked(id, checked) {
      this.previewFileCheckedMap.set(id, checked);
    },
  },
});
