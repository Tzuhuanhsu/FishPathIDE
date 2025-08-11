'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.ready = exports.update = exports.template = exports.$ = void 0;
exports.$ = {
    'test': '.test',
};
exports.template = `
<ui-prop>
    <ui-label slot="label">Test</ui-label>
    <ui-checkbox slot="content" class="test"></ui-checkbox>
</ui-prop>
`;
function update(assetList, metaList) {
    this.assetList = assetList;
    this.metaList = metaList;
    this.$.test.value = metaList[0].userData.test || false;
}
exports.update = update;
;
function ready() {
    this.$.test.addEventListener('confirm', () => {
        this.metaList.forEach((meta) => {
            // Modify the data in the corresponding meta
            meta.userData.test = !!this.$.test.value;
        });
        // The Assets panel is modifying the meta file of the asset, not the dump data, so the event sent is not the same as the component property modification
        this.dispatch('change');
    });
}
exports.ready = ready;
;
function close(his) {
    // TODO something
}
exports.close = close;
;
