import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MainLayout from 'src/layouts/MainLayout.vue';
import store from 'src/store/index.js'

installQuasarPlugin();

describe('example Component', () => {
  it('should mount component with todos', async () => {
    const wrapper = mount(MainLayout)
    $store = new store()
    console.log($store)
    await expect(wrapper).toMatchSnapshot('./test/basic.output.html')
  });

  // it('should mount component without todos', () => {
  //   const wrapper = mount(ExampleComponent, {
  //     props: {
  //       title: 'Hello',
  //       totalCount: 4,
  //     },
  //   });
  //   expect(wrapper.findAll('.q-item')).toHaveLength(0);
  // });
});
