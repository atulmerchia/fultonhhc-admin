class HiddenValueStore {}
HiddenValueStore.value = {}

HiddenValueStore.store = (key, val) => HiddenValueStore.value[key] = val
HiddenValueStore.fetch = key => HiddenValueStore.value[key]
HiddenValueStore.erase = key => delete HiddenValueStore.value[key]

export default HiddenValueStore;
