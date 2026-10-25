export function set(state, data) {
  state.items = data;
}

export function add(state, data) {
  state.items.push(data);
}

export function update(state, data) {
  for (const i in state.items) {
    if (state.items[i].id === data.id) {
      state.items[i] = data;
      break;
    }
  }
}

export function remove(state, data) {
  for (const i in state.items) {
    if (state.items[i].id === data.id) {
      state.items.splice(i, 1);
      break;
    }
  }
}
