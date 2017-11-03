import { configure } from '@storybook/react';

function loadStories() {
    require('../examples');
}

configure(loadStories, module);
