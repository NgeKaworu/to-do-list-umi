export const qiankun = {
  // 应用加载之前
  async bootstrap(props: any) {
    if (window.__POWERED_BY_QIANKUN__) {
      __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
    }
  },
  // 应用 render 之前触发
  async mount(props: any) {},
  // 应用卸载之后触发
  async unmount(props: any) {},
  // loadMicroApp 方式加载微应用时生效
  async update(props: any) {},
};

declare var __webpack_public_path__: string;
declare global {
  interface Window {
    __POWERED_BY_QIANKUN__: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__: string;
  }
}
